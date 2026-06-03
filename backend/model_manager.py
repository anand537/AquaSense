from pathlib import Path
from typing import Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import load_model
from xgboost import XGBClassifier

FEATURE_NAMES = [
    'ph',
    'Hardness',
    'Solids',
    'Chloramines',
    'Sulfate',
    'Conductivity',
    'Organic_carbon',
    'Trihalomethanes',
    'Turbidity',
]

ROOT_DIR = Path(__file__).resolve().parent.parent
ARTIFACT_DIR = Path(__file__).resolve().parent / 'artifacts'
DATA_PATH = ROOT_DIR / 'notebooks' / 'model_1' / 'water.csv'
SCALER_PATH = ROOT_DIR / 'notebooks' / 'model_2' / 'wqi_scaler.joblib'
QUALITY_MODEL_PATH = ROOT_DIR / 'notebooks' / 'model_2' / 'water_quality_scorer.h5'
SAFETY_MODEL_PATH = ARTIFACT_DIR / 'safety_classifier.joblib'
CLUSTER_MODEL_PATH = ARTIFACT_DIR / 'profile_clusterer.joblib'


def build_feature_vector(sample: Dict[str, float]) -> np.ndarray:
    values = [float(sample[name]) for name in FEATURE_NAMES]
    return np.asarray([values], dtype=np.float32)


def generate_cluster_labels(kmeans: KMeans, features: np.ndarray) -> Dict[int, str]:
    centers = kmeans.cluster_centers_
    labels: Dict[int, str] = {}
    thresholds = {
        'solids': np.percentile(features[:, 2], 80),
        'turbidity': np.percentile(features[:, 8], 80),
        'chloramines': np.percentile(features[:, 3], 80),
        'ph_low': np.percentile(features[:, 0], 20),
        'sulfate': np.percentile(features[:, 4], 80),
    }

    for index, center in enumerate(centers):
        if center[2] > thresholds['solids'] and center[1] > np.percentile(features[:, 1], 70):
            labels[index] = 'Hard & Mineralized'
        elif center[8] > thresholds['turbidity']:
            labels[index] = 'Turbid & Cloudy'
        elif center[3] > thresholds['chloramines']:
            labels[index] = 'Chloramine Rich'
        elif center[0] < thresholds['ph_low']:
            labels[index] = 'Acidic & Soft'
        elif center[4] > thresholds['sulfate']:
            labels[index] = 'Sulfate Heavy'
        else:
            labels[index] = 'Balanced & Stable'

    return labels


def ensure_artifacts() -> None:
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

    if SAFETY_MODEL_PATH.exists() and CLUSTER_MODEL_PATH.exists():
        return

    if not DATA_PATH.exists():
        raise FileNotFoundError(f'Missing training data: {DATA_PATH}')

    df = pd.read_csv(DATA_PATH)
    df = df.fillna(df.mean(numeric_only=True))
    X = df[FEATURE_NAMES].astype(float)
    y = df['Potability'].astype(int)

    if not SCALER_PATH.exists():
        scaler = StandardScaler().fit(X)
        joblib.dump(scaler, SCALER_PATH)
    else:
        scaler = joblib.load(SCALER_PATH)

    X_scaled = scaler.transform(X)

    clf = XGBClassifier(use_label_encoder=False, eval_metric='logloss', verbosity=0, random_state=42)
    clf.fit(X_scaled, y)
    joblib.dump(clf, SAFETY_MODEL_PATH)

    kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
    kmeans.fit(X_scaled)
    cluster_labels = generate_cluster_labels(kmeans, X_scaled)
    joblib.dump((kmeans, cluster_labels), CLUSTER_MODEL_PATH)


class PredictionEngine:
    def __init__(self) -> None:
        ensure_artifacts()
        if not SCALER_PATH.exists() or not QUALITY_MODEL_PATH.exists():
            raise FileNotFoundError('Quality scorer artifacts are missing. Please ensure the notebook model files exist.')

        self.scaler: StandardScaler = joblib.load(SCALER_PATH)
        self.quality_model = load_model(str(QUALITY_MODEL_PATH))
        self.safety_model = joblib.load(SAFETY_MODEL_PATH)
        cluster_obj = joblib.load(CLUSTER_MODEL_PATH)
        self.cluster_model, self.cluster_labels = cluster_obj

    def predict_quality(self, sample: np.ndarray) -> float:
        scaled = self.scaler.transform(sample.astype(np.float32))
        raw = float(self.quality_model.predict(scaled, verbose=0)[0, 0])
        return max(0.0, min(100.0, raw))

    def predict_safety(self, sample: np.ndarray) -> Dict[str, float]:
        scaled = self.scaler.transform(sample.astype(np.float32)).astype(np.float32)
        proba = float(self.safety_model.predict_proba(scaled)[0, 1])
        return {
            'label': 'Safe' if proba >= 0.5 else 'Unsafe',
            'probability': round(proba, 4),
        }

    def predict_profile(self, sample: np.ndarray) -> Tuple[int, str]:
        scaled = self.scaler.transform(sample.astype(np.float32)).astype(np.float64)
        centers = np.asarray(self.cluster_model.cluster_centers_, dtype=np.float64)
        distances = np.linalg.norm(centers - scaled, axis=1)
        cluster_id = int(np.argmin(distances))
        return cluster_id, self.cluster_labels.get(cluster_id, 'Balanced & Stable')

    def explain(self, sample: Dict[str, float], score: float, safety_label: str) -> List[str]:
        ranges = {
            'ph': (6.5, 8.5),
            'Hardness': (0, 300),
            'Solids': (0, 1000),
            'Chloramines': (0, 4),
            'Sulfate': (0, 500),
            'Conductivity': (0, 1000),
            'Organic_carbon': (0, 20),
            'Trihalomethanes': (0, 100),
            'Turbidity': (0, 5),
        }
        explanations: List[str] = []

        for feature, value in sample.items():
            if feature not in ranges:
                continue
            low, high = ranges[feature]
            if value < low:
                explanations.append(f'{feature} is too low ({value:.1f}); ideal range is {low}-{high}.')
            elif value > high:
                explanations.append(f'{feature} is too high ({value:.1f}); ideal range is {low}-{high}.')

        if not explanations:
            if score < 70 or safety_label == 'Unsafe':
                explanations.append('Water quality is below ideal range, but specific parameters are within broad recommended values. Consider reviewing turbidity and chemical balance.')
            else:
                explanations.append('All measured parameters are within typical safe ranges.')

        return explanations[:3]

    def recommend(self, sample: Dict[str, float], score: float, safety_label: str, profile: str) -> str:
        recommendations: List[str] = []

        if safety_label == 'Unsafe':
            recommendations.append('Avoid drinking the water until it is treated. Use boiled or filtered water for drinking and cooking.')

        if score < 50:
            recommendations.append('Install a multi-stage filter or RO/UV system for improved water quality.')
        elif score < 70:
            recommendations.append('A carbon-based filter and regular maintenance can help improve your water score.')

        if profile == 'Hard & Mineralized':
            recommendations.append('Use a water softener or mineral conditioning filter to reduce hardness.')
        elif profile == 'Turbid & Cloudy':
            recommendations.append('Check for sediment and contamination sources; pre-filtration may help.')
        elif profile == 'Chloramine Rich':
            recommendations.append('Consider a catalytic carbon filter designed for chloramine removal.')
        elif profile == 'Sulfate Heavy':
            recommendations.append('A dedicated sulfate reduction filter may improve water taste and comfort.')

        if not recommendations:
            recommendations.append('Continue regular monitoring and use a basic filtration setup to keep water quality stable.')

        return ' '.join(recommendations)

    def predict(self, sample: Dict[str, float]) -> Dict[str, object]:
        vector = build_feature_vector(sample)
        quality_score = self.predict_quality(vector)
        safety = self.predict_safety(vector)
        cluster_id, profile = self.predict_profile(vector)
        explanations = self.explain(sample, quality_score, safety['label'])
        recommendation = self.recommend(sample, quality_score, safety['label'], profile)

        return {
            'quality_score': round(quality_score, 2),
            'safety_label': safety['label'],
            'safety_probability': safety['probability'],
            'cluster_id': cluster_id,
            'profile': profile,
            'recommendation': recommendation,
            'explanations': explanations,
            'inputs': sample,
        }

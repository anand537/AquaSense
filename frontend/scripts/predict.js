const form = document.getElementById('waterForm');
const resultCard = document.getElementById('resultCard');
const resultSafety = document.getElementById('resultSafety');
const resultProbability = document.getElementById('resultProbability');
const resultScore = document.getElementById('resultScore');
const resultProfile = document.getElementById('resultProfile');
const resultRecommendation = document.getElementById('resultRecommendation');
const resultExplanation = document.getElementById('resultExplanation');

function buildPayload(form) {
    const data = {};
    new FormData(form).forEach((value, key) => {
        if (value === '') return;
        data[key] = Number(value);
    });
    return data;
}

function showResult(result) {
    resultSafety.textContent = result.safety_label;
    resultSafety.className = result.safety_label === 'Safe' ? 'safe-badge' : 'unsafe-badge';
    resultProbability.textContent = `Confidence: ${Math.round(result.safety_probability * 100)}%`;
    resultScore.textContent = `${result.quality_score.toFixed(1)} / 100`;
    resultProfile.textContent = result.profile;
    resultRecommendation.textContent = result.recommendation;
    resultExplanation.innerHTML = '';
    result.explanations.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        resultExplanation.appendChild(li);
    });
    resultCard.hidden = false;
}

function showError(message) {
    alert(`Prediction failed: ${message}`);
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = buildPayload(form);
    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const body = await response.json();
            throw new Error(body.detail || response.statusText);
        }

        const result = await response.json();
        showResult(result);
    } catch (error) {
        showError(error.message);
    }
});

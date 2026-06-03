// ===== DASHBOARD INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeFormHandlers();
    setupThresholdSlider();
    populateDashboardInfo();
});

// ===== TAB FUNCTIONALITY =====
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(tabName).classList.add('active');

            // Log for debugging
            logger.log(`Switched to tab: ${tabName}`);
        });
    });
}

// ===== FORM HANDLERS =====
function initializeFormHandlers() {
    const predictionForm = document.getElementById('predictionForm');
    
    if (predictionForm) {
        predictionForm.addEventListener('submit', handlePredictionSubmit);
    }

    // Settings form handlers (if applicable)
    const settingsInputs = document.querySelectorAll('input[id^="poor"], input[id^="fair"], input[id^="good"]');
    settingsInputs.forEach(input => {
        input.addEventListener('change', () => {
            saveSetting(input.id, input.value);
        });
    });
}

// ===== PREDICTION SUBMISSION HANDLER =====
function handlePredictionSubmit(event) {
    event.preventDefault();

    // Get form data
    const formData = new FormData(event.target);
    const inputData = Object.fromEntries(formData);

    // Log input
    logger.log('Prediction input:', inputData);

    // Simulate ML model prediction
    const prediction = simulateModelPrediction(inputData);

    // Display result
    displayPredictionResult(prediction);
}

// ===== SIMULATE MODEL PREDICTION =====
function simulateModelPrediction(inputData) {
    // Determine which model is being used based on page content
    const modelTitle = document.getElementById('modelTitle').textContent;
    const isClassifier = modelTitle.includes('Classifier');

    if (isClassifier) {
        // Model 1: Classification
        return simulateClassification(inputData);
    } else {
        // Model 2: Regression/Scoring
        return simulateScoring(inputData);
    }
}

function simulateClassification(inputData) {
    // Simulate water safety classification
    const ph = parseFloat(inputData.ph) || 7;
    const do_level = parseFloat(inputData.do) || 8;
    const temp = parseFloat(inputData.temperature) || 20;
    const turbidity = parseFloat(inputData.turbidity) || 1;

    // Simple classification logic
    let safetyScore = 0;
    let status = 'Unknown';

    // pH check (optimal: 6.5-8.5)
    if (ph >= 6.5 && ph <= 8.5) safetyScore += 30;
    else if (ph >= 6 && ph <= 9) safetyScore += 15;
    else safetyScore += 0;

    // DO check (optimal: >5 mg/L)
    if (do_level > 5) safetyScore += 30;
    else if (do_level > 3) safetyScore += 15;
    else safetyScore += 0;

    // Temperature check (optimal: 5-30°C)
    if (temp >= 5 && temp <= 30) safetyScore += 20;
    else if (temp >= 0 && temp <= 35) safetyScore += 10;
    else safetyScore += 0;

    // Turbidity check (optimal: <1 NTU)
    if (turbidity < 1) safetyScore += 20;
    else if (turbidity < 5) safetyScore += 10;
    else safetyScore += 0;

    // Determine status
    if (safetyScore >= 90) status = 'Safe';
    else if (safetyScore >= 70) status = 'Caution';
    else status = 'Unsafe';

    const confidence = 75 + Math.random() * 20;

    return {
        status: status,
        confidence: confidence.toFixed(1),
        score: safetyScore,
        details: getClassificationDetails(inputData, safetyScore)
    };
}

function simulateScoring(inputData) {
    // Simulate water quality scoring
    const ph = parseFloat(inputData.ph) || 7;
    const do_level = parseFloat(inputData.do) || 8;
    const temp = parseFloat(inputData.temperature) || 20;
    const conductivity = parseFloat(inputData.conductivity) || 500;
    const turbidity = parseFloat(inputData.turbidity) || 1;
    const tds = parseFloat(inputData.tds) || 250;

    // Calculate quality score (0-10 scale)
    let score = 0;

    // Weight each parameter
    const phScore = (Math.abs(ph - 7) <= 1.5) ? 10 : Math.max(0, 10 - Math.abs(ph - 7) * 2);
    const doScore = (do_level > 5) ? 10 : (do_level / 5) * 10;
    const tempScore = (temp >= 5 && temp <= 30) ? 10 : Math.max(0, 10 - Math.abs(temp - 20) / 5);
    const conductivityScore = (conductivity < 1000) ? 10 : Math.max(0, 10 - (conductivity - 1000) / 500);
    const turbidityScore = (turbidity < 1) ? 10 : Math.max(0, 10 - turbidity * 2);
    const tdsScore = (tds < 500) ? 10 : Math.max(0, 10 - (tds - 500) / 250);

    // Calculate weighted average
    score = (phScore * 0.2 + doScore * 0.2 + tempScore * 0.15 + 
             conductivityScore * 0.15 + turbidityScore * 0.15 + tdsScore * 0.15);

    const confidence = 80 + Math.random() * 18;

    return {
        score: score.toFixed(2),
        confidence: confidence.toFixed(1),
        category: getQualityCategory(score),
        details: getScoreDetails(inputData, score)
    };
}

function getClassificationDetails(inputData, score) {
    const details = [];
    
    const ph = parseFloat(inputData.ph);
    if (ph < 6.5 || ph > 8.5) {
        details.push(`pH level (${ph}) is outside optimal range (6.5-8.5). Consider water treatment.`);
    }

    const do_level = parseFloat(inputData.do);
    if (do_level < 5) {
        details.push(`Dissolved oxygen (${do_level} mg/L) is low. May indicate pollution or stagnation.`);
    }

    const temp = parseFloat(inputData.temperature);
    if (temp < 5 || temp > 30) {
        details.push(`Temperature (${temp}°C) is outside comfortable range. May affect aquatic life.`);
    }

    const turbidity = parseFloat(inputData.turbidity);
    if (turbidity > 1) {
        details.push(`Turbidity (${turbidity} NTU) indicates suspended particles. May require filtration.`);
    }

    return details.length > 0 ? details : ['Water quality parameters are within acceptable ranges.'];
}

function getScoreDetails(inputData, score) {
    const details = [];
    
    const category = getQualityCategory(score);
    details.push(`Quality Category: ${category}`);

    if (score < 5) {
        details.push('Not recommended for direct consumption or aquatic activities.');
        details.push('Advanced treatment required before use.');
    } else if (score < 7) {
        details.push('Suitable for non-potable uses after basic treatment.');
        details.push('Monitor parameters regularly.');
    } else {
        details.push('Good quality water suitable for most uses.');
        details.push('Continue regular monitoring to maintain quality.');
    }

    return details;
}

function getQualityCategory(score) {
    if (score < 2.5) return 'Poor';
    if (score < 5) return 'Fair';
    if (score < 7.5) return 'Good';
    return 'Excellent';
}

// ===== DISPLAY PREDICTION RESULT =====
function displayPredictionResult(prediction) {
    const resultBox = document.getElementById('predictionResult');
    const modelTitle = document.getElementById('modelTitle').textContent;
    const isClassifier = modelTitle.includes('Classifier');

    if (isClassifier) {
        document.getElementById('resultStatus').textContent = prediction.status;
        document.getElementById('resultConfidence').textContent = prediction.confidence + '%';
    } else {
        document.getElementById('resultScore').textContent = prediction.score;
    }

    const detailsHtml = prediction.details.map(detail => 
        `<div style="margin: 10px 0; padding: 10px; background: rgba(77, 184, 255, 0.1); border-left: 3px solid #4db8ff; border-radius: 4px;">
            <strong>•</strong> ${detail}
        </div>`
    ).join('');

    document.getElementById('resultDetails').innerHTML = detailsHtml;
    resultBox.style.display = 'block';

    logger.log('Prediction result displayed:', prediction);
}

// ===== THRESHOLD SLIDER =====
function setupThresholdSlider() {
    const thresholdSlider = document.getElementById('threshold');
    const thresholdValue = document.getElementById('thresholdValue');

    if (thresholdSlider) {
        thresholdSlider.addEventListener('input', (e) => {
            const value = (e.target.value * 100).toFixed(0);
            thresholdValue.textContent = value + '%';
        });
    }
}

// ===== POPULATE DASHBOARD INFO =====
function populateDashboardInfo() {
    // Get model info from page title or URL
    const modelBadge = document.getElementById('modelBadge');
    const modelTitle = document.getElementById('modelTitle');

    if (modelBadge && modelBadge.textContent.includes('Model 1')) {
        logger.log('Model 1 dashboard loaded: Water Safety Classifier');
    } else if (modelBadge && modelBadge.textContent.includes('Model 2')) {
        logger.log('Model 2 dashboard loaded: Water Quality Scorer');
    }
}

// ===== SAVE SETTINGS =====
function saveSetting(key, value) {
    try {
        localStorage.setItem(`aquasense_${key}`, value);
        logger.log(`Setting saved: ${key} = ${value}`);
    } catch (error) {
        logger.error('Failed to save setting', error);
    }
}

// ===== LOAD SETTINGS =====
function loadSetting(key, defaultValue) {
    try {
        return localStorage.getItem(`aquasense_${key}`) || defaultValue;
    } catch (error) {
        logger.error('Failed to load setting', error);
        return defaultValue;
    }
}

// ===== NAVIGATION =====
function goBackToHome() {
    window.location.href = '../../index.html';
}

// ===== LOGGER UTILITY =====
const logger = {
    log: (message, data = null) => {
        if (data) {
            console.log(`[AquaSense Dashboard] ${message}:`, data);
        } else {
            console.log(`[AquaSense Dashboard] ${message}`);
        }
    },
    error: (message, error = null) => {
        if (error) {
            console.error(`[AquaSense Dashboard Error] ${message}:`, error);
        } else {
            console.error(`[AquaSense Dashboard Error] ${message}`);
        }
    },
    warn: (message, data = null) => {
        if (data) {
            console.warn(`[AquaSense Dashboard Warning] ${message}:`, data);
        } else {
            console.warn(`[AquaSense Dashboard Warning] ${message}`);
        }
    }
};

// ===== CHART PLACEHOLDER INITIALIZATION =====
function initializeCharts() {
    // Placeholder for chart initialization (Chart.js, D3.js, etc.)
    logger.log('Charts initialized (placeholder)');
}

// ===== RESPONSIVE ADJUSTMENTS =====
function handleResponsive() {
    if (window.innerWidth < 768) {
        // Mobile adjustments
        logger.log('Mobile view activated');
    } else if (window.innerWidth < 1200) {
        // Tablet adjustments
        logger.log('Tablet view activated');
    } else {
        // Desktop view
        logger.log('Desktop view activated');
    }
}

window.addEventListener('resize', handleResponsive);
handleResponsive();

// ===== ACCESSIBILITY ENHANCEMENTS =====
// Add ARIA labels
const predictionForm = document.getElementById('predictionForm');
if (predictionForm) {
    predictionForm.setAttribute('aria-label', 'Water quality prediction form');
}

// ===== INITIALIZATION LOG =====
logger.log('Dashboard initialized successfully');

// ===== EXPORT FUNCTIONS =====
window.Dashboard = {
    goBackToHome,
    loadSetting,
    saveSetting
};

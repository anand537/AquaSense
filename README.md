# AquaSense
Smart Water Quality Prediction System

## Running the Project

1. Create and activate the Python virtual environment:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

2. Install Python dependencies:

```powershell
pip install -r requirements.txt
```

3. Train backend artifacts if needed:

```powershell
python backend\train_models.py
```

4. Start the FastAPI backend:

```powershell
uvicorn backend.main:app --reload
```

5. Open the prediction UI in your browser:

```text
http://127.0.0.1:8000/predict.html
```

If you open the app from the frontend directly, the prediction page will still be available as `frontend\predict.html`, but the backend is required for live prediction requests.

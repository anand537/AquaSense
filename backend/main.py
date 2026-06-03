from pathlib import Path
from typing import Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from backend.model_manager import PredictionEngine

app = FastAPI(
    title='AquaSense API',
    description='Backend API for AquaSense water quality prediction.',
    version='1.0.0',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

frontend_dir = Path(__file__).resolve().parent.parent / 'frontend'
if frontend_dir.exists():
    app.mount('/static', StaticFiles(directory=str(frontend_dir), html=True), name='frontend')

predictor = PredictionEngine()


class WaterSample(BaseModel):
    ph: float = Field(..., ge=0, le=14, description='Water pH level')
    hardness: float = Field(..., ge=0, alias='Hardness')
    solids: float = Field(..., ge=0, alias='Solids')
    chloramines: float = Field(..., ge=0, alias='Chloramines')
    sulfate: float = Field(..., ge=0, alias='Sulfate')
    conductivity: float = Field(..., ge=0, alias='Conductivity')
    organic_carbon: float = Field(..., ge=0, alias='Organic_carbon')
    trihalomethanes: float = Field(..., ge=0, alias='Trihalomethanes')
    turbidity: float = Field(..., ge=0, alias='Turbidity')

    class Config:
        validate_by_name = True
        json_schema_extra = {
            'example': {
                'ph': 7.2,
                'Hardness': 150,
                'Solids': 400,
                'Chloramines': 2.5,
                'Sulfate': 300,
                'Conductivity': 450,
                'Organic_carbon': 10,
                'Trihalomethanes': 50,
                'Turbidity': 1.5,
            }
        }


@app.get('/')
def root() -> RedirectResponse:
    return RedirectResponse(url='/static/index.html')


@app.get('/predict.html')
def predict_page() -> FileResponse:
    return FileResponse(frontend_dir / 'predict.html')


@app.get('/health')
def health_check() -> Dict[str, str]:
    return {'status': 'ok', 'message': 'AquaSense backend is running'}


@app.post('/predict')
def predict(sample: WaterSample):
    values = sample.dict(by_alias=True)
    try:
        return predictor.predict(values)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.exception_handler(HTTPException)
def http_exception_handler(request, exc):
    return JSONResponse(status_code=exc.status_code, content={'detail': exc.detail})

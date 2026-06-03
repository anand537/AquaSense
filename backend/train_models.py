from backend.model_manager import ensure_artifacts


if __name__ == '__main__':
    print('Training safety classifier and profile clusterer artifacts...')
    ensure_artifacts()
    print('Artifacts are ready in backend/artifacts')

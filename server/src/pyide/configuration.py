import os
from pathlib import Path


PROJECT_PATH = Path(
    os.path.normpath(
        Path(Path(__file__).parent, '..', '..', 'test', 'resources')
    )
)
EXCLUDED_FILE_LISTING_EXTENSION = ['pyc']

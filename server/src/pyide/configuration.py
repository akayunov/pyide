import os
from pathlib import Path
# SYS_PATH_PREPEND = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..', 'test/resources'))
SYS_PATH_PREPEND = Path(
    os.path.normpath(
        Path(Path(__file__).parent, '..', '..', 'test', 'resources')
    )
)

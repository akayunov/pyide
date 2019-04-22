import stat

from aiohttp import web
from pathlib import Path

from pyide.const import ROUTING
from pyide.configuration import PROJECT_PATH, EXCLUDED_FILE_LISTING_EXTENSION


class FileListing(web.View):
    async def get(self):
        result = {
            'folders': [],
            'files': []
        }
        for item_path in (PROJECT_PATH / self.request.match_info.get('file_name', '')).iterdir():
            if stat.S_ISDIR(item_path.stat().st_mode):
                result['folders'].append(str(Path(f'{ROUTING["filelisting"]}') / Path(item_path).relative_to(PROJECT_PATH)))
            else:
                if item_path.suffix not in EXCLUDED_FILE_LISTING_EXTENSION:
                    result['files'].append(str(Path(f'{ROUTING["code"]}') / Path(item_path).relative_to(PROJECT_PATH)))

        result['files'] = sorted(result['files'])
        result['folders'] = sorted(result['folders'])

        return web.json_response(result)

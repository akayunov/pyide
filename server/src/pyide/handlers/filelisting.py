from pathlib import Path
import os
from pyide.configuration import SYS_PATH_PREPEND
from aiohttp import web


class FileListing(web.View):
    async def get(self):
        result = []
        for root, dirs, files in os.walk((SYS_PATH_PREPEND / self.request.match_info.get('file_name', ''))):
            padding_len = len(Path(root).relative_to(SYS_PATH_PREPEND).parts)
            for d_dir in sorted(dirs):
                d_dir_path = (Path(root) / Path(d_dir)).relative_to(SYS_PATH_PREPEND)
                result.append(
                    f'''<div class=folderlink ><img class="triange-img" style="transform: rotate(90deg);" src="/client/resources/triangle.png"><span class="padding_{padding_len}">{'  ' * padding_len}</span><a href="/server/filelisting/{d_dir_path}">{d_dir}</a></div>'''
                )
            for f_file in sorted(f for f in files if not f.endswith('pyc')):
                f_file_path = (Path(root) / Path(f_file)).relative_to(SYS_PATH_PREPEND)
                result.append(
                    f'''<div class=filelink ><img class="triange-img" style="transform: rotate(90deg);"src="/client/resources/blank.png"><span class="padding_{padding_len}">{'  ' * padding_len}</span><a href="/server/code/{f_file_path}">{f_file}</a></div>''')
            break
        return web.json_response(result)

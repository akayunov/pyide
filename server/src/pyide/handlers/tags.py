import aiohttp.web

from pathlib import Path
from pyide.configuration import PROJECT_PATH
from pyide.handlers.code import AST_PARSER
from aiohttp import web


class Tags(web.View):
    async def get(self):
        result = {
            'scops': [],  # tags that have nested tags
            'tags': []  # just tags
        }
        # TODO file_name should include query string for nested tags
        file_path = Path(str(PROJECT_PATH / self.request.match_info.get('file_name', '')))
        if file_path in AST_PARSER:
            global_scope = [
                i for i in AST_PARSER[file_path].child_parent_scope_id_links
                if AST_PARSER[file_path].child_parent_scope_id_links[i]['parent_scope_id'] is None
            ][0]

            for tag_name in AST_PARSER[file_path].scope_id_structure.get(global_scope, {}):
                # TODO add test on [0] part
                if AST_PARSER[file_path].scope_id_structure[global_scope][tag_name][0].child_scope_id:
                    result['scops'].append(tag_name)
                else:
                    result['tags'].append(tag_name)
            return web.json_response(result)
        else:
            raise aiohttp.web.HTTPNotFound(reason=f'File {file_path} not found in AST_PARSER')

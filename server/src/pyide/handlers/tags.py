import aiohttp.web

from pyide.configuration import SYS_PATH_PREPEND
from pyide.handlers.code import AST_PARSER
from aiohttp import web


class Tags(web.View):
    async def get(self):
        result = []
        path = self.request.match_info.get('file_name', '')
        file_path = SYS_PATH_PREPEND + '/' + path
        if file_path in AST_PARSER:
            global_scope = [i for i in AST_PARSER[file_path].child_parent_scope_id_links if AST_PARSER[file_path].child_parent_scope_id_links[i]['parent_scope_id'] is None][0]
            for tag_name in AST_PARSER[file_path].scope_id_structure.get(global_scope, {}):
                padding_size = 1
                # TODO add test on [0] part
                if AST_PARSER[file_path].scope_id_structure[global_scope][tag_name][0].child_scope_id:
                    img_type = 'triangle'
                else:
                    img_type = 'blank'
                result.append(
                    '''<div class=tags ><img class="triange-img" style="transform: rotate(90deg);" src="/client/resourses/{}.png"><span class="padding_{}">{}</span>\
                    <span>{}</span></div>'''.format(img_type, padding_size, '  ' * padding_size, tag_name)
                )
            return web.json_response(result)
        else:
            print(f'File {file_path} not found in AST_PARSER')
            raise aiohttp.web.HTTPNotFound()

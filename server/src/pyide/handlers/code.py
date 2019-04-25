import aiohttp.web
from io import BytesIO
import tokenize
from pyide.pyidetokenizer import PyideTokenizer
from pyide.astparser.astparser import AST_PARSER, AstParser
from pyide import configuration


class Code(aiohttp.web.View):
    async def get(self):
        path = self.request.match_info.get('file_name', '')
        path = configuration.PROJECT_PATH / path
        if path.exists():
            if path.suffix == '.py':
                result = list(PyideTokenizer().parse_file(path))
                AST_PARSER[path] = AstParser(path).parse_content()
                return aiohttp.web.json_response(result)
            else:
                with open(path, 'rb') as code_file:
                    result = []
                    for index, line in enumerate(code_file.readlines()):
                        result.append(f'''<div tabindex="{index + 1}" class="content-line"><span>{line.decode(
                            'utf8')}</span></div>''')
                    return aiohttp.web.json_response(result)
        else:
            pass

    async def post(self):
        path = self.request.match_info.get('file_name', '')
        path = configuration.PROJECT_PATH / path
        body = await self.request.json()
        if body['type'] == 'gotodefinition':
            token_info = None
            for i in tokenize.tokenize(BytesIO(body['code_string'].encode('utf8')).readline):
                if i.end[1] >= body['cursor_position']:
                    token_info = i
                    break
            # print(token_info.string, token_info.start[0], token_info.start[1])
            # import pdb;
            # pdb.set_trace()
            node = AST_PARSER[path].get_assign_node_information(token_info.string, line_number=body['code_line_number'],
                                                                col_offset=token_info.start[1])
            if node:
                # TODO add file name in case cross file definition
                return aiohttp.web.json_response({
                    'code_line_number': node.lineno.lineno,
                    'cursor_position': node.col_offset
                })
            else:
                raise aiohttp.web.HTTPNotFound(text=f'Go to definition not found: {body}')

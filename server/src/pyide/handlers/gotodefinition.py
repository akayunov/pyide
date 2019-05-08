import aiohttp.web
from io import BytesIO
import tokenize
from pyide.astparser.astparser import AST_PARSER
from pyide import configuration


class GoToDefinition(aiohttp.web.View):
    async def post(self):
        path = configuration.PROJECT_PATH / self.request.match_info.get('file_name', '')
        body = await self.request.json()
        print('INPUT BODY:', body)

        token_info = None
        for i in tokenize.tokenize(BytesIO(body['code_string'].encode('utf8')).readline):
            if i.end[1] >= body['cursor_position']:
                token_info = i
                break

        node = AST_PARSER[path]['ast_tree'].get_assign_node_information(
            token_info.string, line_number=body['code_line_number'], col_offset=token_info.start[1]
        )
        if node:
            # TODO add file name in case cross file definition
            return aiohttp.web.json_response({
                'code_line_number': node.lineno.lineno - 1,
                'cursor_position': node.col_offset
            })
        else:
            raise aiohttp.web.HTTPNotFound(text=f'Go to definition not found: {body}')


import aiohttp.web
from io import BytesIO
import tokenize
from pyide.astparser.astparser import AstParser, AST_PARSER
from pyide import configuration


class GoToDefinition(aiohttp.web.View):
    async def post(self):
        path = configuration.PROJECT_PATH / self.request.match_info.get('file_name', '')
        body = await self.request.json()
        print('INPUT BODY:', body)

        token_info = None
        for i in tokenize.tokenize(BytesIO(body['code_string'].encode('utf8')).readline):
            if i.end[1] >= body['cursor_position']:
                token_info = tokenize.TokenInfo(
                    type=i.type,
                    string=i.string,
                    start=(body['code_line_number'], i.start[1]),
                    end=(body['code_line_number'], i.end[1]),
                    line=i.line
                )
                break

        node_info, node_scope_id, scope_tree = AstParser.search_token(token_info, AST_PARSER[path]['ast_tree'])
        node_info = AstParser.get_token_definition(token_info, node_scope_id, scope_tree)
        print('node_info in gotoddefinition: ', node_info, node_info.lineno)

        if node_info:
            # TODO add file name in case cross file definition
            return aiohttp.web.json_response({
                'code_line_number': node_info.lineno - 1,
                'cursor_position': node_info.col_offset
            })
        else:
            raise aiohttp.web.HTTPNotFound(text=f'Go to definition not found: {body}')


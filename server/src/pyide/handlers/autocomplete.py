import aiohttp.web
from io import BytesIO
import tokenize
from pyide.astparser.astparser import AST_PARSER
from pyide import configuration

import token
from tokenize import TokenInfo


class AutoComplete(aiohttp.web.View):
    async def post(self):
        path = configuration.PROJECT_PATH / self.request.match_info.get('file_name', '')
        body = await self.request.json()
        print('INPUT BODY:', body)

        body['data']['lineText'] = body['data']['lineText'].strip().rstrip()

        t_struct_adjusted = []
        result = []
        for i in tokenize.tokenize(BytesIO(body['data']['lineText'].encode('utf8')).readline):
            if i.type == token.ENDMARKER:
                continue
            t_struct_adjusted.append(
                TokenInfo(type=i.type, string=i.string, start=(body['data']['lineNumber'], i.start[1]),
                          end=(body['data']['lineNumber'], i.end[1]), line=i.line)
            )
        # pprint(t_struct_adjusted)
        token_string = ''
        if t_struct_adjusted[-1].type == token.NEWLINE:
            t_struct_adjusted.pop(-1)
        if t_struct_adjusted[-1].string == '.':
            # ищем имена
            result += AST_PARSER[path]['ast_tree'].get_autocomlete(
                token_string='',
                owner_attribute_string=t_struct_adjusted[-2].string, line_number=t_struct_adjusted[-1].start[0],
                col_offset=t_struct_adjusted[-1].start[1]
            )
            token_string = ''
        elif t_struct_adjusted[-2].string == '.':
            # ищем атрибуты предыдущего имени
            result += AST_PARSER[path]['ast_tree'].get_autocomlete(
                t_struct_adjusted[-1].string, owner_attribute_string=t_struct_adjusted[-3].string,
                line_number=t_struct_adjusted[-1].start[0],
                col_offset=t_struct_adjusted[-1].start[1]
            )
            token_string = t_struct_adjusted[-1].string
        elif t_struct_adjusted[-1].type == token.NAME:
            # ищем атрибуты предыдущего имени
            result += AST_PARSER[path]['ast_tree'].get_autocomlete(
                t_struct_adjusted[-1].string, line_number=t_struct_adjusted[-1].start[0],
                col_offset=t_struct_adjusted[-1].start[1]
            )
            token_string = t_struct_adjusted[-1].string
        elif t_struct_adjusted[-1].type != token.NAME:
            # чо возвращать то последнии символы не имя переменно нечего дополять
            pass
        return aiohttp.web.json_response({
            'type': 'autocomplete',
            'data': {
                'lineNumber': body['data']['lineNumber'],
                'result': result,
                'prefix': token_string
            }
        })
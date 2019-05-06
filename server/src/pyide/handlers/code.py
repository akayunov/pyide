import aiohttp.web
from io import BytesIO
import tokenize
import xml.etree.ElementTree as et
from pyide.pyidetokenizer import PyideTokenizer
from pyide.astparser.astparser import AST_PARSER, AstParser
from pyide import configuration

import token
from tokenize import TokenInfo


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
                        result.append(f'''<div tabindex="{index}" class="content-line"><span>{line.decode(
                            'utf8')}</span></div>''')
                    return aiohttp.web.json_response(result)
        else:
            pass

    async def post(self):
        path = self.request.match_info.get('file_name', '')
        path = configuration.PROJECT_PATH / path
        body = await self.request.json()
        print('INPUT BODY:', body)
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
                    'code_line_number': node.lineno.lineno - 1,
                    'cursor_position': node.col_offset
                })
            else:
                raise aiohttp.web.HTTPNotFound(text=f'Go to definition not found: {body}')

        elif body['type'] == 'lineChanged':
            # TODO respons with somethink only if markup was change
            message = body['data']

            path = configuration.PROJECT_PATH / message['fileName']
            if not path.suffix == '.py':
                # TODO
                print('============Ne py')
                return aiohttp.web.json_response({
                    'type': 'lineChanged',
                    'data': {
                        'lineNumber': message['lineNumber'],
                        # 'lineElements': [et.tostring(i, encoding="unicode") for i in tokenized_elements_to],
                        'lineElements': [],
                        # TODO  remove convrting
                        'fileName': message['fileName'],
                        'lineText': ''.join(et.fromstring(message['outerHTML']).itertext())
                    }
                })
            # body = json.loads(self.request.body)
            # print(body)
            # if body['type'] == 'parse':
            t_struct_adjusted = []
            code_line_as_html_elements = et.fromstring(message['outerHTML'])
            line_text = ''.join(code_line_as_html_elements.itertext())
            # for i in tokenize.tokenize(BytesIO(line_text.encode('utf8')).readline):
            #     t_struct_adjusted.append(
            #         TokenInfo(type=i.type, string=i.string, start=(message['lineNumber'], i.start[1]), end=(message['lineNumber'], i.end[1]), line=i.line)
            #     )
            # t_struct_adjusted.append(TokenInfo(type=0, string='', start=(2, 0), end=(2, 0), line=''))
            # print('x0:', t_struct_adjusted)
            # tokenized_elements_to = tokenize_source_by_xml(t_struct_adjusted, file_name=path, current_line=message['lineNumber'])
            tokenized_elements_to = list(PyideTokenizer().parse_string(0, line_text.encode('utf8')))[0]
            # print('xx1:', [et.tostring(i,encoding="unicode") for i in tokenized_elements_to])
            print('xx1:', tokenized_elements_to)

            result_array = et.fromstring(tokenized_elements_to)
            return aiohttp.web.json_response({
                'type': 'lineChanged',
                'data': {
                    'lineNumber': message['lineNumber'],
                    # 'lineElements': [et.tostring(i, encoding="unicode") for i in tokenized_elements_to],
                    'lineElements': [et.tostring(child, encoding="unicode") for child in result_array],
                # TODO  remove convrting
                    'fileName': message['fileName'],
                    'lineText': line_text
                }
            })
        elif body['type'] == 'lineDeleted':
            message = body['data']
            code_line_as_html_elements = et.fromstring(message['outerHTML'])
            line_text = ''.join(code_line_as_html_elements.itertext())
            return aiohttp.web.json_response({
                'type': 'lineChanged',
                'data': {
                    'lineNumber': message['lineNumber'],
                    # 'lineElements': [et.tostring(i, encoding="unicode") for i in tokenized_elements_to],
                    'lineElements': [],
                    # TODO  remove convrting
                    'fileName': message['fileName'],
                    'lineText': line_text
                }
            })
        elif body['type'] == 'autoCompleteShow':
            # from pyide.rdb import Rdb;
            # Rdb().set_trace();
            body['data']['lineText'] = body['data']['lineText'].strip().rstrip()
            path = configuration.PROJECT_PATH / body['data']['fileName']
            # print('QWQEQEQW', path, configuration.PROJECT_PATH)
            # print('TTTTTTT', AST_PARSER.keys())
            t_struct_adjusted = []
            result = []
            for i in tokenize.tokenize(BytesIO(body['data']['lineText'].encode('utf8')).readline):
                if i.type == token.ENDMARKER:
                    continue
                t_struct_adjusted.append(
                    TokenInfo(type=i.type, string=i.string, start=(body['data']['lineNumber'], i.start[1]), end=(body['data']['lineNumber'], i.end[1]), line=i.line)
                )
            # pprint(t_struct_adjusted)
            token_string = ''
            if t_struct_adjusted[-1].type == token.NEWLINE:
                t_struct_adjusted.pop(-1)
            if t_struct_adjusted[-1].string == '.':
                # ищем имена
                result += AST_PARSER[path].get_autocomlete(
                    token_string='',
                    owner_attribute_string=t_struct_adjusted[-2].string, line_number=t_struct_adjusted[-1].start[0],
                    col_offset=t_struct_adjusted[-1].start[1]
                )
                token_string = ''
            elif t_struct_adjusted[-2].string == '.':
                # ищем атрибуты предыдущего имени
                result += AST_PARSER[path].get_autocomlete(
                    t_struct_adjusted[-1].string, owner_attribute_string=t_struct_adjusted[-3].string, line_number=t_struct_adjusted[-1].start[0],
                    col_offset=t_struct_adjusted[-1].start[1]
                )
                token_string = t_struct_adjusted[-1].string
            elif t_struct_adjusted[-1].type == token.NAME:
                # ищем атрибуты предыдущего имени
                result += AST_PARSER[path].get_autocomlete(
                    t_struct_adjusted[-1].string, line_number=t_struct_adjusted[-1].start[0], col_offset=t_struct_adjusted[-1].start[1]
                )
                token_string = t_struct_adjusted[-1].string
            elif t_struct_adjusted[-1].type != token.NAME:
                # чо возвращать то последнии символы не имя переменно нечего дополять
                pass
            return aiohttp.web.json_response({
                    'type': 'autoCompleteShow',
                    'data':{
                        'lineNumber': body['data']['lineNumber'],
                        'result': result,
                        'prefix': token_string
                    }
                })

import json
import aiohttp
import token
from pyide import configuration
import tokenize
from io import BytesIO
from tokenize import TokenInfo
# from pyide.handlers.code import tokenize_source_by_xml, AST_PARSER
from pyide.pyidetokenizer import PyideTokenizer
import xml.etree.ElementTree as et
from aiohttp import web


class Command(web.View):
    async def get(self):

        ws = web.WebSocketResponse()
        await ws.prepare(self.request)

        async for msg in ws:
            if msg.type == aiohttp.WSMsgType.TEXT:
                if msg.data == 'close':
                    await ws.close()
                else:
                    # await ws.send_str(msg.data + '/answer')
                    print('Event recieved', msg)
                    resp = on_message_in(msg.data)
                    if resp: # TODO remove it it's temporary
                        await ws.send_json()
            elif msg.type == aiohttp.WSMsgType.ERROR:
                print('ws connection closed with exception %s' %
                      ws.exception())

        print('websocket connection closed')

        return ws


def on_message_in(message):
    print("\n\n\nrecieve:", message)
    message = json.loads(message)
    if message['type'] == 'lineParse':
        pass
        # message = message['data']
        #
        # path = configuration.PROJECT_PATH / message['fileName']
        # if not path.suffix =='.py':
        #     return
        # # body = json.loads(self.request.body)
        # # print(body)
        # # if body['type'] == 'parse':
        # t_struct_adjusted = []
        # code_line_as_html_elements = et.fromstring(message['outerHTML'])
        # line_text = ''.join(code_line_as_html_elements.itertext())
        # # for i in tokenize.tokenize(BytesIO(line_text.encode('utf8')).readline):
        # #     t_struct_adjusted.append(
        # #         TokenInfo(type=i.type, string=i.string, start=(message['lineNumber'], i.start[1]), end=(message['lineNumber'], i.end[1]), line=i.line)
        # #     )
        # # t_struct_adjusted.append(TokenInfo(type=0, string='', start=(2, 0), end=(2, 0), line=''))
        # # print('x0:', t_struct_adjusted)
        # # tokenized_elements_to = tokenize_source_by_xml(t_struct_adjusted, file_name=path, current_line=message['lineNumber'])
        # tokenized_elements_to = list(PyideTokenizer().parse_string(0, line_text.encode('utf8')))[0]
        # # print('xx1:', [et.tostring(i,encoding="unicode") for i in tokenized_elements_to])
        # print('xx1:', tokenized_elements_to)
        #
        # result_array = et.fromstring(tokenized_elements_to)
        # return {
        #     'type': 'lineParse',
        #     'data': {
        #         'lineNumber': message['lineNumber'],
        #         # 'lineElements': [et.tostring(i, encoding="unicode") for i in tokenized_elements_to],
        #         'lineElements': [et.tostring(child,encoding="unicode") for child in result_array],  # TODO  remove convrting
        #         'fileName': message['fileName'],
        #         'lineText': line_text
        #     }
        # }

    elif message['type'] == 'autoCompleteShow':
        pass
        # from pyide.rdb import Rdb;
        # Rdb().set_trace();
        # message['data']['lineText'] = message['data']['lineText'].strip().rstrip()
        # path = configuration.PROJECT_PATH / message['data']['fileName']
        # print('QWQEQEQW', path, configuration.PROJECT_PATH)
        # print('TTTTTTT', AST_PARSER.keys())
        # t_struct_adjusted = []
        # result = []
        # for i in tokenize.tokenize(BytesIO(message['data']['lineText'].encode('utf8')).readline):
        #     if i.type == token.ENDMARKER:
        #         continue
        #     t_struct_adjusted.append(
        #         TokenInfo(type=i.type, string=i.string, start=(message['data']['lineNumber'], i.start[1]), end=(message['data']['lineNumber'], i.end[1]), line=i.line)
        #     )
        # # pprint(t_struct_adjusted)
        # token_string = ''
        # if t_struct_adjusted[-1].type == token.NEWLINE:
        #     t_struct_adjusted.pop(-1)
        # if t_struct_adjusted[-1].string == '.':
        #     # ищем имена
        #     result += AST_PARSER[path].get_autocomlete(
        #         token_string='',
        #         owner_attribute_string=t_struct_adjusted[-2].string, line_number=t_struct_adjusted[-1].start[0],
        #         col_offset=t_struct_adjusted[-1].start[1]
        #     )
        #     token_string = ''
        # elif t_struct_adjusted[-2].string == '.':
        #     # ищем атрибуты предыдущего имени
        #     result += AST_PARSER[path].get_autocomlete(
        #         t_struct_adjusted[-1].string, owner_attribute_string=t_struct_adjusted[-3].string, line_number=t_struct_adjusted[-1].start[0],
        #         col_offset=t_struct_adjusted[-1].start[1]
        #     )
        #     token_string = t_struct_adjusted[-1].string
        # elif t_struct_adjusted[-1].type == token.NAME:
        #     # ищем атрибуты предыдущего имени
        #     result += AST_PARSER[path].get_autocomlete(
        #         t_struct_adjusted[-1].string, line_number=t_struct_adjusted[-1].start[0], col_offset=t_struct_adjusted[-1].start[1]
        #     )
        #     token_string = t_struct_adjusted[-1].string
        # elif t_struct_adjusted[-1].type != token.NAME:
        #     # чо возвращать то последнии символы не имя переменно нечего дополять
        #     pass
        #
        # return {
        #         'type': 'autoCompleteShow',
        #         'data':{
        #             'lineNumber': message['data']['lineNumber'],
        #             'result': result,
        #             'prefix': token_string
        #         }
        #     }

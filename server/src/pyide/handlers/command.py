import traceback
import tornado.websocket
import json
import token
from pyide import configuration
import tokenize
from io import BytesIO
from tokenize import TokenInfo
from pyide.handlers.code import tokenize_source_by_xml, AST_PARSER
import xml.etree.ElementTree as et


class Command(tornado.websocket.WebSocketHandler):
    def open(self):
        print("WebSocket opened")

    def on_message(self, message):
        try:
            self.on_message_in(message)
        except Exception as e:
            print(e, traceback.format_exc())

    def on_message_in(self, message):
        print("\n\n\nrecieve:", message)
        message = json.loads(message)
        if message['type'] == 'lineParse':
            message = message['data']

            path = configuration.SYS_PATH_PREPEND + message['fileName']
            if not path.endswith('py'):
                return
            # body = json.loads(self.request.body)
            # print(body)
            # if body['type'] == 'parse':
            t_struct_adjusted = []
            code_line_as_html_elements = et.fromstring(message['outerHTML'])
            line_text = ''.join(code_line_as_html_elements.itertext())
            for i in tokenize.tokenize(BytesIO(line_text.encode('utf8')).readline):
                t_struct_adjusted.append(
                    TokenInfo(type=i.type, string=i.string, start=(message['lineNumber'], i.start[1]), end=(message['lineNumber'], i.end[1]), line=i.line)
                )
            t_struct_adjusted.append(TokenInfo(type=0, string='', start=(2, 0), end=(2, 0), line=''))
            print('x0:', t_struct_adjusted)
            tokenized_elements_to = tokenize_source_by_xml(t_struct_adjusted, file_name=path, current_line=message['lineNumber'])
            tokenized_elements_to = tokenized_elements_to[0]
            print('xx1:', [et.tostring(i,encoding="unicode") for i in tokenized_elements_to])

            self.write_message(
                json.dumps({
                    'type': 'lineParse',
                    'data':{
                        'lineNumber': message['lineNumber'],
                        'lineElements': [et.tostring(i,encoding="unicode") for i in tokenized_elements_to],
                        'fileName': message['fileName']
                    }
                })
            )

        elif message['type'] == 'autoCompleteShow':
            # from pyide.rdb import Rdb;
            # Rdb().set_trace();
            message['data']['lineText'] = message['data']['lineText'].strip().rstrip()
            path = configuration.SYS_PATH_PREPEND + message['data']['fileName']
            t_struct_adjusted = []
            result = []
            for i in tokenize.tokenize(BytesIO(message['data']['lineText'].encode('utf8')).readline):
                if i.type == token.ENDMARKER:
                    continue
                t_struct_adjusted.append(
                    TokenInfo(type=i.type, string=i.string, start=(message['data']['lineNumber'], i.start[1]), end=(message['data']['lineNumber'], i.end[1]), line=i.line)
                )
            # pprint(t_struct_adjusted)
            token_string = ''
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

            print({"result": result})
            # self.write(
            #     json.dumps({
            #         "result": result,
            #         "prefix": token_string
            #     })
            # )
            self.write_message(
                json.dumps({
                    'type': 'autoCompleteShow',
                    'data':{
                        'lineNumber': message['data']['lineNumber'],
                        'result': result,
                        'prefix': token_string
                    }
                })
            )

    def on_close(self):
        print("WebSocket closed")

    def check_origin(self, *args):
        # TODO remove it
        return True
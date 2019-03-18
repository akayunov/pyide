import tornado.websocket
import json
from pyide import configuration
import tokenize
from io import BytesIO
from tokenize import TokenInfo
from pyide.handlers.code import tokenize_source_by_xml
import xml.etree.ElementTree as et


class Command(tornado.websocket.WebSocketHandler):
    def open(self):
        print("WebSocket opened")

    def on_message(self, message):
        print("\n\n\nrecieve:", message)
        message = json.loads(message)
        if message['type'] == 'lineParse':
            message = message['data']

            path = configuration.SYS_PATH_PREPEND + message['fileName']
            # body = json.loads(self.request.body)
            # print(body)
            # if body['type'] == 'parse':
            t_struct_adjusted = []
            for i in tokenize.tokenize(BytesIO(message['lineText'].encode('utf8')).readline):
                t_struct_adjusted.append(
                    TokenInfo(type=i.type, string=i.string, start=(message['lineNumber'], i.start[1]), end=(message['lineNumber'], i.end[1]), line=i.line)
                )
            t_struct_adjusted.append(TokenInfo(type=0, string='', start=(2, 0), end=(2, 0), line=''))
            print(t_struct_adjusted)
            elements_to = tokenize_source_by_xml(t_struct_adjusted, file_name=path, current_line=message['lineNumber'])
            elements_to = elements_to[0]
            print([et.tostring(i,encoding="unicode") for i in elements_to])

            code_line = et.fromstring(message['outerHTML'])
            index = 0
            el_to_index_shift = 0

            # from pyide.rdb import Rdb;
            # Rdb().set_trace();
            while index < min([len(code_line), len(elements_to)]):
                orig_el = code_line[index]
                if orig_el.attrib.get('nodeid'):
                    # changed_node_text = orig_el.text
                    # cursor may be in string so need iter
                    changed_node_text = "".join(orig_el.itertext())
                    new_text = ''
                    while changed_node_text != new_text:
                        new_text += elements_to[index + el_to_index_shift].text
                        elements_to[index + el_to_index_shift].attrib['nodeid'] = orig_el.attrib['nodeid']
                        el_to_index_shift += 1
                    index += 1
                else:
                    index += 1
            self.write_message(
                json.dumps({
                    'type': 'lineParse',
                    'lineNumber': message['lineNumber'],
                    'lineElements': [et.tostring(i,encoding="unicode") for i in elements_to]
                })
            )

    def on_close(self):
        print("WebSocket closed")

    def check_origin(self, *args):
        # TODO remove it
        return True
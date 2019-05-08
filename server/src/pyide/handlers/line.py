import aiohttp.web
import xml.etree.ElementTree as et
from pyide.tokenizer.pytokenizer import PyTokenizer
from pyide.tokenizer.txttokenizer import TxtTokenizer
from pyide import configuration
from pyide.astparser.astparser import AST_PARSER


class Line(aiohttp.web.View):
    async def post(self):
        body = await self.request.json()
        # print('INPUT BODY:', body)
        # TODO responce with something only if markup was changed
        message = body['data']
        path = configuration.PROJECT_PATH / message['fileName']

        html = et.fromstring(message['outerHTML'])
        text_content = ''.join(html.itertext())

        if path.suffix == '.txt':
            if body['type'] == 'lineChange':
                AST_PARSER[path]['content'].content[message['lineNumber']] = text_content.encode('utf8')
                return aiohttp.web.json_response({
                    'type': 'lineChange',
                    'data': {
                        'lineNumber': message['lineNumber'],
                        'lineElements': [et.tostring(child, encoding="unicode") for child in next(TxtTokenizer().parse_string(0, text_content.encode('utf8'), return_string=False))] ,
                        'fileName': message['fileName'],
                        'lineText': text_content
                    }
                })
        elif path.suffix == '.py':
            if body['type'] == 'lineChange':
                AST_PARSER[path]['content'].content[message['lineNumber']] = text_content.encode('utf8')
                return aiohttp.web.json_response({
                    'type': 'lineChange',
                    'data': {
                        'lineNumber': message['lineNumber'],
                        'lineElements': [et.tostring(child, encoding="unicode") for child in next(PyTokenizer().parse_string(0, text_content.encode('utf8'), return_string=False))],
                        'fileName': message['fileName'],
                        'lineText': text_content
                    }
                })
            elif body['type'] == 'lineAdd':
                AST_PARSER[path]['content'].content.insert(message['lineNumber'], ''.join(et.fromstring(message['outerHTML']).itertext()).encode('utf8'))
                return aiohttp.web.json_response({
                    'type': 'lineAdd',
                    'data': {
                        'lineNumber': message['lineNumber'],
                        'lineElements': [],
                        'fileName': message['fileName'],
                        'lineText': text_content
                    }
                })
            elif body['type'] == 'lineRemove':
                AST_PARSER[path]['content'].content.pop(message['lineNumber'])
                return aiohttp.web.json_response({
                    'type': 'lineRemove',
                    'data': {
                        'lineNumber': message['lineNumber'],
                        'lineElements': [],
                        'fileName': message['fileName'],
                        'lineText': text_content
                    }
                })

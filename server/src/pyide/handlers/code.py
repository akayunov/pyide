import aiohttp.web
from pyide.contentio import ContentIo
from pyide.tokenizer.pytokenizer import PyTokenizer
from pyide.tokenizer.txttokenizer import TxtTokenizer
from pyide.astparser.astparser import AST_PARSER, AstParser
from pyide import configuration


class Code(aiohttp.web.View):
    async def get(self):
        path = self.request.match_info.get('file_name', '')
        path = configuration.PROJECT_PATH / path
        if path.exists():
            content_io = ContentIo(path)
            AST_PARSER[path] = {}
            AST_PARSER[path]['content'] = content_io
            if path.suffix == '.py':
                AST_PARSER[path]['ast_tree'] = AstParser(content_io).parse_content()
                result = list(PyTokenizer().parse_file(content_io))
                return aiohttp.web.json_response(result)
            else:
                AST_PARSER[path]['ast_tree'] = {}
                result = list(TxtTokenizer().parse_file(content_io))
                return aiohttp.web.json_response(result)
        else:
            raise aiohttp.web.HTTPNotFound(text=f'File not found: {path}')

    async def put(self):
        path = self.request.match_info.get('file_name', '')
        path = configuration.PROJECT_PATH / path
        if path.exists():
            raise aiohttp.web.HTTPConflict(text=f'File already exists: {path}')

        with open(path, 'wb') as f:
            f.write(AST_PARSER[path]['content'].read())

        return aiohttp.web.Response()

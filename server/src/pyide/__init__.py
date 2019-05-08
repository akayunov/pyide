import argparse
import logging

from pathlib import Path
from aiohttp.web_log import AccessLogger
AccessLogger.LOG_FORMAT = '%a %t "%r" %s %b'
from aiohttp import web

from pyide.const import ROUTING
from pyide.handlers.code import Code
# from pyide.handlers.command import Command
from pyide.handlers.tags import Tags
from pyide.handlers.autocomplete import AutoComplete
from pyide.handlers.gotodefinition import GoToDefinition
from pyide.handlers.line import Line
from pyide.handlers.favicon import Favicon
from pyide.handlers.filelisting import FileListing


def main():
    parser = argparse.ArgumentParser(description='Pyide args')
    parser.add_argument('--host', metavar='host', type=str, default='0.0.0.0', help='Host name')
    parser.add_argument('-p', '--port', metavar='port', type=int, default=31415, help='Listen port number')
    parser.add_argument('-d', '--debug', action='store_true', default=False, help='Debug mode')
    args = parser.parse_args()

    settings = {'debug': args.debug}
    if args.debug:
        logging.basicConfig(level=logging.DEBUG)

    app = web.Application(**settings)
    app.add_routes(
        [
            # web.view(ROUTING['command'], Command),
            web.view(ROUTING['filelisting'] + '/{file_name:.*}', FileListing),
            web.view(ROUTING['filelisting'], FileListing),
            web.view(ROUTING['code'] + '/{file_name:.*}', Code),
            web.view(ROUTING['tags'] + '/{file_name:.*}', Tags),
            web.view(ROUTING['gotodefinition'] + '/{file_name:.*}', GoToDefinition),
            web.view(ROUTING['line'] + '/{file_name:.*}', Line),
            web.view(ROUTING['autocomplete'] + '/{file_name:.*}', AutoComplete),

            web.static('/client', ROUTING['client']),

            web.view(ROUTING['favicon'], Favicon)

        ]
    )
    web.run_app(app, host=args.host, port=args.port)

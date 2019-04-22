import argparse
import logging
import os

from aiohttp.web_log import AccessLogger
AccessLogger.LOG_FORMAT = '%a %t "%r" %s %b'
from aiohttp import web

from pyide.const import ROUTING
from pyide.handlers.code import Code
from pyide.handlers.command import websocket_handler
from pyide.handlers.tags import Tags
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
            web.get(f'{ROUTING["command"]}', websocket_handler),
            web.get(f'{ROUTING["filelisting"]}/{{file_name:.*}}', FileListing),
            web.get(f'{ROUTING["filelisting"]}', FileListing),
            web.get(f'{ROUTING["code"]}/{{file_name:.*}}', Code),
            web.post(f'{ROUTING["code"]}/{{file_name:.*}}', Code),
            web.get(f'{ROUTING["tags"]}/{{file_name:.*}}', Tags),
            web.static('/client', os.path.join(os.path.dirname(__file__), '..', '..', '..', 'client')),
            web.get('/{file_name:favicon\.ico}', Favicon)
        ]
    )
    web.run_app(app, host=args.host, port=args.port)

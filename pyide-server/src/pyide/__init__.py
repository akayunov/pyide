import argparse
import logging
import os

import tornado.ioloop
import tornado.web
from pyide.handlers.code import Code
from pyide.handlers.command import Command
from pyide.handlers.tags import Tags

from pyide.handlers.filelisting import FileListing

LOGGER = logging.getLogger('tornado.access')
LOGGER.setLevel(logging.WARN)


def main():
    parser = argparse.ArgumentParser(description='Pyide args')
    parser.add_argument('-p', '--port', metavar='port', type=int, default=31415, help='Listen port number')
    parser.add_argument('-d', '--debug', action='store_true', default=False, help='Debug mode')
    args = parser.parse_args()

    settings = {'debug': args.debug}
    if args.debug:
        LOGGER.setLevel(logging.DEBUG)

    app = tornado.web.Application(
        [
            (r'/server/command', Command),
            (r'/server/filelisting(.*)', FileListing),
            (r'/server/code/(.*)', Code),
            (r'/server/tags/(.*)', Tags),
            (r'/client/(.*)', tornado.web.StaticFileHandler, dict(path=os.path.join(os.path.dirname(__file__), '..', '..','..','pyide-client'))),
            (r'/favicon.ico(.*)?', tornado.web.StaticFileHandler, dict(path=os.path.join(os.path.dirname(__file__), '..', '..','..','pyide-client', 'resourses', 'favicon.ico'))),
        ],
        **settings
    )
    app.listen(args.port)
    tornado.ioloop.IOLoop.current().start()

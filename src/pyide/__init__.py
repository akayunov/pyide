import argparse
import os
import tornado.ioloop
import tornado.web

from pyide.command import Command
from pyide.code import Code
from pyide.tags import Tags
from pyide.filelisting import FileListing


def main():
    parser = argparse.ArgumentParser(description='Pyide args')
    parser.add_argument('-p', '--port', metavar='port', type=int, default=31415, help='Listen port number')
    parser.add_argument('-d', '--debug', action='store_true', default=False, help='Debug mode')
    args = parser.parse_args()

    settings = {'debug': args.debug}

    app = tornado.web.Application(
        [
            (r'/server/command', Command),
            (r'/server/filelisting(.*)', FileListing),
            (r'/server/code/(.*)', Code),
            (r'/server/tags/(.*)', Tags),
            (r'/client/(.*)', tornado.web.StaticFileHandler, dict(path=os.path.join(os.path.dirname(__file__), '..', 'pyide-client'))),
        ],
        **settings
    )
    app.listen(args.port)
    tornado.ioloop.IOLoop.current().start()

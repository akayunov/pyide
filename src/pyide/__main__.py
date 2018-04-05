import argparse
import os
import tornado.ioloop
import tornado.web


from pyide.command import Command
from pyide.code import Code
from pyide.filelisting import FileListing

PARSER = argparse.ArgumentParser(description='Pyide args')
PARSER.add_argument('-p', '--port', metavar='port', type=int, default=31415, help='Listen port number')
PARSER.add_argument('-d', '--debug', action='store_true', default=False, help='Debug mode')
PARSER.add_argument('--coverage', action='store_true', default=False, help='Accumulate coverage report')
ARGS = PARSER.parse_args()

if ARGS.coverage:
    pass
    # os.environ['COVERAGE_PROCESS_START'] = os.path.join(os.path.dirname(__file__), '..', '..', '.coveragerc')
    # os.environ['COVERAGE_FILE'] = os.path.join(os.path.dirname(__file__), '..', '..', 'tmp', '.coverage')
    # import coverage
    # coverage.process_startup()

SETTINGS = {'debug': ARGS.debug}

APP = tornado.web.Application(
    [
        (r'/server/command', Command),
        (r'/server/filelisting', FileListing),
        (r'/server/code/(.*)', Code),
        (r'/client/(.*)', tornado.web.StaticFileHandler, dict(path=os.path.join(os.path.dirname(__file__), '..', 'pyide-client'))),
    ],
    **SETTINGS
)
APP.listen(ARGS.port)
tornado.ioloop.IOLoop.current().start()

import os
import tornado.ioloop
import tornado.web


from pyide.command import Command
from pyide.code import Code
from pyide.filelisting import FileListing

SETTINGS = {'debug': True}
APP = tornado.web.Application(
    [
        (r'/server/command', Command),
        (r'/server/filelisting', FileListing),
        (r'/server/code/(.*)', Code),
        (r'/client/(.*)', tornado.web.StaticFileHandler, dict(path=os.path.join(os.path.dirname(__file__), '..', 'pyide-client'))),
    ],
    **SETTINGS
)
APP.listen(31415)
tornado.ioloop.IOLoop.current().start()

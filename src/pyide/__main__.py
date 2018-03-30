import tornado.ioloop
import tornado.web
import os

from pyide.command import Command
from pyide.code import Code
from pyide.filelisting import FileListing

settings = {'debug': True}
app = tornado.web.Application([
    (r'/server/command', Command),
    (r'/server/filelisting', FileListing),
    (r'/server/code/(.*)', Code),
    (r'/client/(.*)', tornado.web.StaticFileHandler, dict(path='/home/akayunov/pyide/src/pyide-client')),
],
**settings
)
app.listen(31415)
tornado.ioloop.IOLoop.current().start()

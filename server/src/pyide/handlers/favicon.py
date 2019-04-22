import os
from aiohttp import web


class Favicon(web.View):
    async def get(self):
        with open(os.path.join(os.path.dirname(__file__), '..',  '..', '..','..','client', 'resources', 'favicon.ico'), 'rb') as f:
            return web.Response(body=f.read())

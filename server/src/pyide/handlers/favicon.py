from pathlib import Path
from aiohttp import web


class Favicon(web.View):
    async def get(self):
        with open(Path(__file__).parent.parent.parent.parent.parent / 'client' / 'resources' / 'favicon.ico', 'rb') as f:
            return web.Response(body=f.read())

import tornado.web


class Command(tornado.web.RequestHandler):
    def get(self):
        self.write('')

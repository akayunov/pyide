import tornado.websocket
import json


class Command(tornado.websocket.WebSocketHandler):
    def open(self):
        print("WebSocket opened")

    def on_message(self, message):
        self.write_message(message)
        print("recieve:", message)

    def on_close(self):
        print("WebSocket closed")

    def check_origin(self, *args):
        # TODO remove it
        return True
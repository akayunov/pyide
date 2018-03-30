class PyideException(Exception):
    def __init__(self, msg):
        self.msg = msg


class NotFound(PyideException): pass


class UnknowNodeType(PyideException): pass
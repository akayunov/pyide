class PyideException(Exception):
    def __init__(self, msg):
        super().__init__()
        self.msg = msg


class NotFound(PyideException):
    pass


class UnknowNodeType(PyideException):
    pass

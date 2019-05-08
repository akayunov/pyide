class ContentIo:
    def __init__(self, file_path):
        self.content = []

        with open(file_path, 'rb') as f:
            for line in f:
                self.content.append(line)
        if not self.content:
            self.content.append(b'')
        self.gen = (i for i in self.content)

    def readline(self):
        try:
            return next(self.gen)
        except StopIteration:
            return b''

    def readlines(self):
        return (i for i in self.content)

    def read(self):
        return b''.join(self.content)

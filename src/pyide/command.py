import tornado.web


output = '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title> JS test/CSS test</title>
    <script src="/client/jquery-3.2.1.min.js"></script>
    <script src="/client/test.js"></script>
    <link rel="stylesheet" href="/client/style.css">
</head>
<body>
<div id='command_' contenteditable="true">
    ls -la
    </div>
</body>
</html>

'''

class Command(tornado.web.RequestHandler):
    def get(self):
        self.write(output)
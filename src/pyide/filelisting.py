import os
import tornado.web

from pyide.configuration import sys_path_prepend

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
{}
</body>
</html>
'''


class FileListing(tornado.web.RequestHandler):
    def get(self):
        result = ''
        for root, dirs, files in os.walk(sys_path_prepend):
            for d_dir in dirs:
                result += '<div class=folderlink ><a href="http://localhost:31415/server/code{}">{}</a></div>'.format(os.path.join(root, d_dir), os.path.join(root, d_dir))
            for f_file in (f for f in files if not f.endswith('pyc') ):
                result += '<div><a class=filelink href="http://localhost:31415/server/code{}">{}</a></div>'.format(os.path.join(root, f_file), os.path.join(root, f_file))
        self.write(output.format(result))
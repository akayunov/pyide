import json
import os
import tornado.web
from pyide.configuration import SYS_PATH_PREPEND


class FileListing(tornado.web.RequestHandler):
    def get(self, path):
        result = []
        for root, dirs, files in os.walk((SYS_PATH_PREPEND + path)):
            padding_size = path.count('/')
            print('padding', padding_size, path, root, dirs, files)
            for d_dir in sorted(dirs):
                d_dir_path = os.path.join(root, d_dir).replace(SYS_PATH_PREPEND + '/', '')
                result.append(
                    '''<div class=folderlink ><img class="triange-img" style="transform: rotate(90deg);" src="/client/triangle.png"><span class="padding_{}">{}</span>\
<a href="/server/filelisting/{}">{}</a></div>'''.format(padding_size, '  ' * padding_size, d_dir_path, d_dir)
                )
            for f_file in sorted(f for f in files if not f.endswith('pyc')):
                f_file_path = os.path.join(root, f_file).replace(SYS_PATH_PREPEND + '/', '')
                result.append(
                    '''<div class=filelink   ><img class="triange-img" style="transform: rotate(90deg);"src="/client/blank.png"><span class="padding_{}">{}</span>\
<a href="/server/code/{}">{}</a></div>'''.format(padding_size, '  ' * padding_size, f_file_path, f_file))
            break
        self.write(json.dumps(result))

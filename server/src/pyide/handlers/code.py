import os.path
import keyword
import token
import json
from io import BytesIO
import tokenize
from tokenize import TokenInfo
import tornado.web
from pyide.astparser import AstParser
from pyide import configuration
import xml.etree.ElementTree as et


AST_PARSER = {}


def mark_token_by_xml(k, current_position, ast_parser):
    # tabulation
    padding = ''
    tagged_string = ''
    # token = ''

    # if k.string == '\n':
    # from pyide.rdb import Rdb;
    # Rdb().set_trace();
    if current_position == 0:
        tab_length = k.start[1] - current_position
        for i in range(int(tab_length / 4)):
            # padding += '<span class="padding_{}">    </span>'.format(i)
            el = et.Element('span', attrib={'class': f'padding_{i}'})
            el.text = '    '
            yield el
    else:
        # padding = ('<span>' + ' ' * (k.start[1] - current_position) + '</span>')
        padding = ' ' * (k.start[1] - current_position)
        if padding:
            # TODO may be use custom tag <s></s> to save 2 symbol and do file size smaller?
            # padding = '<span>' + padding + '</span>'
            el = et.Element('span')
            el.text = padding
            yield el

    if keyword.iskeyword(k.string):
        # tagged_string = padding + '<span class=keyword>' + k.string + '</span>'
        el = et.Element('span', attrib={'class': 'keyword'})
        el.text = k.string
        yield el
    else:
        if k.exact_type == 3:
            # STRING
            # tagged_string = padding + '<span class=string>' + k.string + '</span>'
            el = et.Element('span', attrib={'class': 'string'})
            el.text = k.string
            yield el
        elif k.exact_type == 54:
            # COMMENT
            # tagged_string = padding + '<span class=comment>' + k.string + '</span>'
            el = et.Element('span', attrib={'class': 'comment'})
            el.text = k.string
            yield el
        elif k.exact_type == 2:
            # NUMBER
            # tagged_string = padding + '<span class=number>' + k.string + '</span>'
            el = et.Element('span', attrib={'class': 'number'})
            el.text = k.string
            yield el
        elif k.exact_type == 1:
            # NAME
            # parent_node_info = ast_parser.get_assign_node_information_by_token(k.string, k.start[0], k.start[1])
            # parent_node_info = ast_parser.get_assign_node_information(k.string, k.start[0], k.start[1])
            node = ast_parser.get_node(k.string, k.start[0], k.start[1])
            # return padding + '<span parent_id="{}" id="{}">'.format(
            #     parent_node_info.id if parent_node_info else None,
            #     node.id if node else None) + k.string + '</span>'
            # tagged_string = padding + '<span class="{}">'.format(node.type if node else 'unknown') + k.string + '</span>'
            el = et.Element('span', attrib={'class': f'{node.type if node else "unknown"}'})
            el.text = k.string
            yield el
        else:
            # tagged_string = padding + '<span>' + k.string + '</span>'
            el = et.Element('span')
            el.text = k.string
            yield el
    # return token


def mark_token(k, current_position, ast_parser):
    # tabulation
    padding = ''
    tagged_string = ''

    if current_position == 0:
        tab_length = k.start[1] - current_position
        for i in range(int(tab_length / 4)):
            padding += '<span class="padding_{}">    </span>'.format(i)
    else:
        # padding = ('<span>' + ' ' * (k.start[1] - current_position) + '</span>')
        padding = ' ' * (k.start[1] - current_position)
        if padding:
            # TODO may be use custom tag <s></s> to save 2 symbol and do file size smaller?
            #  see webcomponets
            padding = '<span>' + padding + '</span>'

    if keyword.iskeyword(k.string):
        tagged_string = padding + '<span class=keyword>' + k.string + '</span>'
    else:
        if k.exact_type == 3:
            # STRING
            # check for multiline
            if '\n' in k.string:
                # TODO move to generator
                tagged_string = padding
                for item in k.string.split('\n'):
                    tagged_string += '<span class=string>' + item + '</span>' + '<span>\n</span>'
            else:
                tagged_string = padding + '<span class=string>' + k.string + '</span>'
        elif k.exact_type == 54:
            # COMMENT
            tagged_string = padding + '<span class=comment>' + k.string + '</span>'
        elif k.exact_type == 2:
            # NUMBER
            tagged_string = padding + '<span class=number>' + k.string + '</span>'
        elif k.exact_type == 1:
            # NAME
            # parent_node_info = ast_parser.get_assign_node_information_by_token(k.string, k.start[0], k.start[1])
            # parent_node_info = ast_parser.get_assign_node_information(k.string, k.start[0], k.start[1])
            node = ast_parser.get_node(k.string, k.start[0], k.start[1])
            # return padding + '<span parent_id="{}" id="{}">'.format(
            #     parent_node_info.id if parent_node_info else None,
            #     node.id if node else None) + k.string + '</span>'
            tagged_string = padding + '<span class="{}">'.format(node.type if node else 'unknown') + k.string + '</span>'
        else:
            tagged_string = padding + '<span>' + k.string + '</span>'
    return tagged_string


def get_module_name(path):
    return path.replace(configuration.SYS_PATH_PREPEND, '').strip('/').replace('/', '.').replace('.py', '')


# TODO move in init stage
def get_next_file(path):
    for (dirpath, dirnames, filenames) in os.walk(path, onerror=None):  # add , followlinks=True, but check dir on it was already visited
        for filename in filenames:
            yield os.path.join([dirpath, filename])
        for dirname in dirnames:
            yield from get_next_file(os.path.join([dirpath, dirname]))


def tokenize_source_by_xml(tokenize_structure, file_name, current_line=1):
    current_position = 0
    string = ''
    result = []
    tokens = []
    result_tokens = []
    for k in tokenize_structure:
        print(k, k.exact_type)
        if k.exact_type == 59:
            # file encoding
            continue

        if k.exact_type == 5:
            # INDENT
            continue
        if k.exact_type == 6:
            # DEDENT
            continue
        if k.exact_type == 0:
            # end marker
            continue
        # if k.string == 'def':
        #     import pdb;pdb.set_trace()
        if int(k.start[0]) == current_line:
            # string += mark_token_by_xml(k, current_position, AST_PARSER[file_name])
            tokens.extend(list(mark_token_by_xml(k, current_position, AST_PARSER[file_name])))
            current_position = k.end[1]

        else:
            # if string == '\n':
            #     string = f'<div tabindex="{current_line}" class="content-line" class=empty><span>\n</span></div>'
            # else:
            #     string = f'<div tabindex="{current_line}" class="content-line">' + string + '</div>'

            # result.append(string)
            result_tokens.append(tokens)
            # string = ''
            tokens = []
            current_position = 0
            current_line = k.start[0]
            # # do the same for first token
            # string += mark_token(k, current_position, AST_PARSER[file_name])
            tokens.extend(list(mark_token_by_xml(k, current_position, AST_PARSER[file_name])))
            current_position = k.end[1]
    result_tokens.append(tokens)
    print(result_tokens)
    return result_tokens


def tokenize_source(tokenize_structure, file_name, current_line=1):
    current_position = 0
    string = ''
    result = []
    for k in tokenize_structure:
        print(k)
        if k.exact_type == 59:
            # file encoding
            continue

        if k.exact_type == 5:
            # INDENT
            continue
        if k.exact_type == 6:
            # DEDENT
            continue
        # if k.string == 'def':
        #     import pdb;pdb.set_trace()
        if int(k.start[0]) == current_line:
            string += mark_token(k, current_position, AST_PARSER[file_name])
            current_position = k.end[1]

        else:
            if string == '\n':
                # TODO do I really need tabIndex parameter? YEs to understant which row was deleted so it should be uniq on page an don't change in page live
                string = f'<div tabindex="{current_line}" class="content-line" class=empty><span>\n</span></div>'
            else:
                string = f'<div tabindex="{current_line}" class="content-line">' + string + '</div>'

            result.append(string)
            string = ''
            current_position = 0
            current_line = k.start[0]
            # # do the same for first token
            string += mark_token(k, current_position, AST_PARSER[file_name])
            current_position = k.end[1]
    return result


class Code(tornado.web.RequestHandler):
    def get(self, path):
        ast_parser = None
        path = configuration.SYS_PATH_PREPEND + '/' + path
        if os.path.isdir(path):
            for file_path in get_next_file(path):
                if file_path.endswith('py'):
                    with open(file_path, 'rb') as code_file:
                        ast_parser = AstParser(code_file.read(), None)
        else:
            if path.endswith('py'):
                with open(path, 'rb') as code_file:
                    ast_parser = AstParser(code_file.read(), None)

        if ast_parser:
            AST_PARSER[path] = ast_parser
            ast_parser.parse_content()
            # import pdb;pdb.set_trace()
            result = tokenize_source(ast_parser.tokenizer_structure, path)

            self.write(json.dumps(result))
        else:
            with open(path, 'rb') as code_file:
                result = []
                for index, line in enumerate(code_file.readlines()):
                    result.append(f'''<div tabindex="{index + 1}" class="content-line"><span>{line.decode('utf8')}</span></div>''')
                self.write(json.dumps(result))

    def post(self, path):
        path = configuration.SYS_PATH_PREPEND + '/' + path
        body = json.loads(self.request.body)
        # print(body)
        if body['type'] == 'parse':
            t_struct_adjusted = []
            for i in tokenize.tokenize(BytesIO(body['code_string'].encode('utf8')).readline):
                t_struct_adjusted.append(
                    TokenInfo(type=i.type, string=i.string, start=(body['code_line_number'], i.start[1]), end=(body['code_line_number'], i.end[1]), line=i.line)
                )
            t_struct_adjusted.append(TokenInfo(type=0, string='', start=(2, 0), end=(2, 0), line=''))
            code_sting = tokenize_source(t_struct_adjusted, file_name=path, current_line=body['code_line_number'])
            # print(code_sting)
            self.write(
                json.dumps({'code_string': code_sting})
            )
        elif body['type'] == 'autocomplete':
            t_struct_adjusted = []
            result = []
            body['code_string'] = body['code_string'].strip().rstrip()
            for i in tokenize.tokenize(BytesIO(body['code_string'].encode('utf8')).readline):
                if i.type == token.ENDMARKER:
                    continue
                t_struct_adjusted.append(
                    TokenInfo(type=i.type, string=i.string, start=(body['code_line_number'], i.start[1]), end=(body['code_line_number'], i.end[1]), line=i.line)
                )
            # pprint(t_struct_adjusted)
            token_string = ''
            if t_struct_adjusted[-1].string == '.':
                # ищем имена
                result += AST_PARSER[path].get_autocomlete(
                    token_string='',
                    owner_attribute_string=t_struct_adjusted[-2].string, line_number=t_struct_adjusted[-1].start[0],
                    col_offset=t_struct_adjusted[-1].start[1]
                )
                token_string = ''
            elif t_struct_adjusted[-2].string == '.':
                # ищем атрибуты предыдущего имени
                result += AST_PARSER[path].get_autocomlete(
                    t_struct_adjusted[-1].string, owner_attribute_string=t_struct_adjusted[-3].string, line_number=t_struct_adjusted[-1].start[0],
                    col_offset=t_struct_adjusted[-1].start[1]
                )
                token_string = t_struct_adjusted[-1].string
            elif t_struct_adjusted[-1].type == token.NAME:
                # ищем атрибуты предыдущего имени
                result += AST_PARSER[path].get_autocomlete(
                    t_struct_adjusted[-1].string, line_number=t_struct_adjusted[-1].start[0], col_offset=t_struct_adjusted[-1].start[1]
                )
                token_string = t_struct_adjusted[-1].string
            elif t_struct_adjusted[-1].type != token.NAME:
                # чо возвращать то последнии символы не имя переменно нечего дополять
                pass

            # print({"result": result})
            self.write(
                json.dumps({
                    "result": result,
                    "prefix": token_string
                })
            )
        elif body['type'] == 'gotodefinition':
            token_info = None
            for i in tokenize.tokenize(BytesIO(body['code_string'].encode('utf8')).readline):
                if i.end[1] >= body['cursor_position']:
                    token_info = i
                    break
            # print(token_info.string, token_info.start[0], token_info.start[1])
            # import pdb;
            # pdb.set_trace()
            node = AST_PARSER[path].get_assign_node_information(token_info.string, line_number=body['code_line_number'], col_offset=token_info.start[1])
            if node:
                self.write(
                    json.dumps({
                        'code_line_number': node.lineno.lineno,
                        'cursor_position': node.col_offset
                    })
                )
            else:
                self.write({})

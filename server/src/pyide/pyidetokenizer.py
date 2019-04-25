import tokenize
import keyword
import xml.etree.ElementTree as Et
from io import BytesIO


class PyideTokenizer:
    def parse_file(self, file_name):
        index = -1
        with open(file_name, 'rb') as f:
            multi_line_statement = b''
            while True:
                index += 1
                string = f.readline()
                if not string:
                    if multi_line_statement:
                        el = Et.Element('span', attrib={'class': 'unknown', 'tabindex': f'{index}'})
                        el.text = multi_line_statement.decode('utf8')
                        yield Et.tostring(el, encoding='unicode')
                    break
                multi_line_statement += string
                try:
                    yield from self.parse_string(index, multi_line_statement)
                except tokenize.TokenError:
                    pass
                else:
                    multi_line_statement = b''

    def parse_string(self, index, string):
        tokenize_string = ''
        current_position = 0

        div = Et.Element('div', attrib={'class': 'content-line', 'tabindex': f'{index}'})
        div.text = tokenize_string

        for k in tokenize.tokenize(BytesIO(string).readline):
            # print(k)
            if k.exact_type == 57:
                # file encoding
                continue
            if k.exact_type == 5:
                # INDENT
                continue
            if k.exact_type == 6:
                # DEDENT
                continue
            for el in self.mark_token(k, current_position):
                div.append(el)
            current_position = k.end[1]

        yield Et.tostring(div, encoding='unicode')

    def mark_token(self, k, current_position):
        # TODO may be use custom tag <s></s> to save 2 symbol and do file size smaller?
        #  see webcomponets

        if current_position == 0:
            tab_length = k.start[1] - current_position
            for i in range(int(tab_length / 4)):
                el = Et.Element('span', attrib={'class': f'padding_{i}'})
                el.text = '    '
                yield el
        else:
            padding = ' ' * (k.start[1] - current_position)
            if padding:
                el = Et.Element('span')
                el.text = padding
                yield el

        if keyword.iskeyword(k.string):
            # TODO after keyword class will be name - class name
            #  after keyword def - will be function name
            el = Et.Element('span', attrib={'class': 'keyword'})
            el.text = k.string
            yield el
        else:
            if k.exact_type == 3:
                # STRING
                # check for multi line
                if '\n' in k.string:
                    for item in k.string.split('\n'):
                        el = Et.Element('span', attrib={'class': 'string'})
                        el.text = item
                        yield el
                        el = Et.Element('span')
                        el.text = '\n'
                        yield el
                else:
                    el = Et.Element('span', attrib={'class': 'string'})
                    el.text = k.string
                    yield el
            elif k.exact_type == 54:
                # COMMENT
                el = Et.Element('span', attrib={'class': 'comment'})
                el.text = k.string
                yield el
            elif k.exact_type == 2:
                # NUMBER
                el = Et.Element('span', attrib={'class': 'number'})
                el.text = k.string
                yield el
            elif k.exact_type == 1:
                # NAME
                # TODO get infro from ast tree
                # parent_node_info = ast_parser.get_assign_node_information_by_token(k.string, k.start[0], k.start[1])
                # parent_node_info = ast_parser.get_assign_node_information(k.string, k.start[0], k.start[1])
                # node = ast_parser.get_node(k.string, k.start[0], k.start[1])
                # return padding + '<span parent_id="{}" id="{}">'.format(
                #     parent_node_info.id if parent_node_info else None,
                #     node.id if node else None) + k.string + '</span>'
                # tagged_string = padding + '<span class="{}">'.format(node.type if node else 'unknown') + k.string + '</span>'
                # tagged_string = padding + '<span class="{}">'.format('unknown') + k.string + '</span>'
                el = Et.Element('span', attrib={'class': 'unknown'})
                el.text = k.string
                yield el
            else:
                el = Et.Element('span')
                el.text = k.string
                yield el

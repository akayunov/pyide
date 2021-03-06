import token
import tokenize
import keyword
import xml.etree.ElementTree as Et
from io import BytesIO


class PyTokenizer:
    def parse_file(self, content):
        index = 0
        multi_line_statement = b''
        while True:
            string = content.readline()
            if not string:
                if multi_line_statement:
                    el = Et.Element('span', attrib={'class': 'unknown', 'tabindex': f'{index}'})
                    el.text = multi_line_statement.decode('utf8')
                    yield Et.tostring(el, encoding='unicode')
                break
            multi_line_statement += string
            try:
                shift_index = yield from self.parse_string(index, multi_line_statement)
            except tokenize.TokenError:
                print('=============Tokenize error!!!.=============')
                pass
            else:
                index += 1
                multi_line_statement = b''
                index += shift_index

    def parse_string(self, index, string, return_value_type='html_string'):  # return_value_type set('html_string', 'html_obj')
        multiline_index = 0
        current_position = 0
        div = Et.Element('div', attrib={'class': 'content-line', 'tabindex': f'{index + multiline_index}'})

        for k in tokenize.tokenize(BytesIO(string).readline):
            print('INPUT TOKEN',k, index)
            if k.exact_type == token.ENCODING:
                # file encoding
                continue
            if k.exact_type == token.INDENT:
                # INDENT
                continue
            if k.exact_type == token.DEDENT:
                # DEDENT
                continue
            if k.exact_type == token.ENDMARKER:
                # DEDENT
                continue
            if k.exact_type == token.STRING:
                # STRING
                # check for multi line
                if '\n' in k.string:
                    first_part, *string_parts = k.string.split('\n')
                    el = Et.Element('span', attrib={'class': 'string'})
                    el.text = first_part
                    div.append(el)
                    if return_value_type == 'html_string':
                        yield Et.tostring(div, encoding='unicode')
                    elif return_value_type == 'html_obj':
                        yield div
                    else:
                        raise Exception('Unknown retrun_value_type')
                    for str_index, item in enumerate(string_parts):
                        multiline_index += 1
                        div = Et.Element('div', attrib={'class': 'content-line', 'tabindex': f'{index + multiline_index}'})
                        el = Et.Element('span', attrib={'class': 'string'})
                        el.text = item
                        new_line = Et.Element('span')
                        new_line.text = '\n'
                        div.append(el)
                        div.append(new_line)
                        if return_value_type == 'html_string':
                            yield Et.tostring(div, encoding='unicode')
                        elif return_value_type == 'html_obj':
                            yield div
                        else:
                            raise Exception('Unknown return_value_type')
                    multiline_index += 1
                    div = Et.Element('div', attrib={'class': 'content-line', 'tabindex': f'{index + multiline_index}'})
                    current_position = k.end[1]
                    continue
            if k.start[0] > multiline_index + 1:
            # TODO check how to do it with token.NL  if k.exact_type == token.NL:
                # next line in multi line statement
                if return_value_type == 'html_string':
                    yield Et.tostring(div, encoding='unicode')
                elif return_value_type == 'html_obj':
                    yield div
                else:
                    raise Exception('Unknown return_value_type')
                div = Et.Element('div', attrib={'class': 'content-line', 'tabindex': f'{index + multiline_index}'})
                multiline_index += 1
            div.extend([i for i in self.mark_token(k, current_position)])
            current_position = k.end[1]
        if return_value_type == 'html_string':
            yield Et.tostring(div, encoding='unicode')
        elif return_value_type == 'html_obj':
            yield div
        else:
            raise Exception('Unknown return_value_type')
        return multiline_index

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
            if k.exact_type == token.COMMENT:
                # COMMENT
                el = Et.Element('span', attrib={'class': 'comment'})
                el.text = k.string
                yield el
            elif k.exact_type == token.NUMBER:
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
            elif k.exact_type == token.NEWLINE and k.string == '':
                # by some reason tokenizer add new line symbol at the end of the string if this one doesn't exists
                # but it can helps with trailing spaces
                pass
            else:
                el = Et.Element('span')
                el.text = k.string
                yield el

import xml.etree.ElementTree as Et


class TxtTokenizer:
    def parse_file(self, content_io):
        for index, line in enumerate(content_io.readlines()):
            yield from self.parse_string(index, line)

    def parse_string(self, index, line, return_string=True):
        print('INPUT TOKEN', line, index)
        div = Et.Element('div', attrib={'class': 'content-line', 'tabindex': f'{index}'})
        el = Et.Element('span', attrib={'class': 'string'})
        el.text = line.decode('utf8')
        div.append(el)
        if return_string:
            yield Et.tostring(div).decode('utf8')
        else:
            yield div

import traceback
import ast
import operator
import tokenize
import token
from io import BytesIO
import keyword
import uuid
import _ast

from pyide.astparser.nodeinfo import NodeInfo
from pyide.astparser.nodeparsers import Parsers


# descriptor to get lineno by attribute acces without any []
class LineNoDesc:
    def __get__(self, instance, owner):
        return instance.node_lineno

    def __set__(self, instance, value):
        instance.node_lineno = value


class LineNo:
    lineno = LineNoDesc()

    def __init__(self, lineno):
        self.node_lineno = lineno

    def __hash__(self):
        return self.node_lineno

    def __eq__(self, other):
        if isinstance(other, int):
            return self.node_lineno == other
        elif isinstance(other, LineNo):
            return self.node_lineno == other.node_lineno
        else:
            raise TypeError('Uncomparable types')

    def __lt__(self, other):
        if isinstance(other, int):
            return self.node_lineno < other
        elif isinstance(other, LineNo):
            return self.node_lineno < other.node_lineno
        else:
            raise TypeError('Uncomparable types')

    def __gt__(self, other):
        if isinstance(other, int):
            return self.node_lineno > other
        elif isinstance(other, LineNo):
            return self.node_lineno > other.node_lineno
        else:
            raise TypeError('Uncomparable types')

    def __repr__(self):
        return str(self.node_lineno)




class AstParser:
    def __init__(self, content_io, parent_scope_id=None):
        self.scope_id = str(uuid.uuid4())  # curent scope
        self.parent_scope_id = parent_scope_id  # parent scope

        self.created_lineno = {}
        self.line_structure = {}  # key is line number, value is dictionary: keys are node_strings, values = NodeInfo() objects
        self.scope_id_structure = {}  # additional structure - keys - scope_id, values - dict: keys - token_strings, values - NodeInfo()

        self.tokenizer_structure = []
        # tree of scopes - link any scope_id to it parent, needed in search of name from bottom to up in scope tree
        # easy to modify just add new and don't think about old ones
        self.child_parent_scope_id_links = {
            self.scope_id: {
                'parent_scope_id': None,
                'lineno': 1,
                'col_offset': 0
            }
        }

        self.content = content_io.read()
        # for while for easy add remove lines
        # if not content.endswith(b'\n'):
        #     self.content = content + b'\n'
        # else:
        #     self.content = content
        # # TODO move it on class level


    def parse_content(self):
        ast_tree = ast.parse(self.content)
        self.tokenizer_structure = list(tokenize.tokenize(BytesIO(self.content).readline))

        # initialize lineno
        for i in range(1, self.content.decode('utf8').count('\n') + 1 + (1 if not self.content.decode('utf8').endswith('\n') else 0)):
            self.line_structure[self.get_lineno(i)] = {}

        # initialize names
        for name_to_create, in_line_to_create in (
                (token_obj.string, token_obj.start[0]) for token_obj in self.tokenizer_structure
                if token_obj.exact_type == token.NAME and not keyword.iskeyword(token_obj.string)):
            if not self.line_structure[self.get_lineno(in_line_to_create)]:
                self.line_structure[self.get_lineno(in_line_to_create)] = {name_to_create: []}
            else:
                self.line_structure[self.get_lineno(in_line_to_create)][name_to_create] = []

        # go to parse_module in usual case
        parsers = Parsers(self)
        # print('parsers, ast_tree.__class__', parsers.parsers_dict.keys(), parsers, str(hash(ast_tree.__class__)))
        # getattr(parsers, str(hash(ast_tree.__class__)))(ast_tree)
        parsers.parsers[ast_tree.__class__](ast_tree)
        self.convert_to_scope_id_structure()
        # debug_print
        from pprint import pprint
        print('line_structure')
        pprint(self.line_structure)
        print('scope_id_structure')
        pprint(self.scope_id_structure)
        print('child_parent_scope_id_links')
        pprint(self.child_parent_scope_id_links)
        # import pdb;pdb.set_trace()
        return self

    def get_lineno(self, line_number):
        # don't forget rebuild keys too, on remove/add rows
        if line_number not in self.created_lineno:
            ln_obj = LineNo(line_number)
            self.created_lineno[line_number] = ln_obj
        else:
            ln_obj = self.created_lineno[line_number]
        return ln_obj

    def convert_to_scope_id_structure(self):
        for lineno in self.line_structure:
            for name_string in self.line_structure[lineno]:
                for node in self.line_structure[lineno][name_string]:
                    if node.action is ast.Store:
                        # TODO if there are many assign statement we save only last one but need save all see testmodule6
                        # create scope_id_structure
                        if node.scope_id not in self.scope_id_structure:
                            self.scope_id_structure[node.scope_id] = {name_string: [node]}
                        else:
                            if name_string in self.scope_id_structure[node.scope_id]:
                                self.scope_id_structure[node.scope_id][name_string].append(node)
                            else:
                                self.scope_id_structure[node.scope_id][name_string] = [node]

    @staticmethod
    def pass_through_assign_chain(node):
        # find origin assigment in chain for example:
        #
        # a = b
        # c = a
        # d = c
        # if we try to find out which type is d when this function return b as origin object
        while node.value:
            node = node.value
        return node

    @staticmethod
    def pass_through_attribute_chain(node):
        # find origin obj in chain of attribute access for example:
        #
        # a().b().c()
        # if we try to find out which type is c when this function return a as origin object
        while node.owner:
            node = node.owner
        return node

    def get_scope_id_for_attribute(self, node: NodeInfo):
        # TODO too dirty
        # if it is attribute try to search in owner child_scope_id
        #  and if owner don't have child_scope_if search in assign statement value child_scope_id
        # for example
        # a.qwe()
        # qwe -> node
        # a = Asd() -> owner_node_info
        # .. = Asd() -> assign_node_info
        # class Asd: -> owner_assign_value_node_definition_info
        orig_node = node
        while node.owner:
            node = node.owner
        # owner_node_info = self.get_assign_node_information_by_token(node.string, node.lineno.lineno, node.col_offset)
        owner_node_info = self.get_assign_node_information(node.string, node.lineno.lineno, node.col_offset)
        if not owner_node_info:
            return None
        assign_owner_value_node_info = self.pass_through_assign_chain(owner_node_info)
        if orig_node == assign_owner_value_node_info:
            # workaround for situation like expected_sha256 = expected_sha256.lower()
            # - will be deep recursion for next string FIX IT
            return None
        # owner_node_info_type_definition = self.get_assign_node_information_by_token(
        owner_node_info_type_definition = self.get_assign_node_information(
            assign_owner_value_node_info.string, assign_owner_value_node_info.lineno.lineno, assign_owner_value_node_info.col_offset
        )
        if not owner_node_info_type_definition:
            return None
        return owner_node_info_type_definition.child_scope_id

    # def get_assign_node_information_by_token(self, token_string, line_number: int, col_offset):
    #     node = self.get_node(token_string, line_number, col_offset)
    #     if node:
    #         # странно что проверка на атрибут идет то единожды
    #         #  как бы надо проверять на каждый цикл
    #         if node.type == 'attribute':
    #             scope_id = self.get_scope_id_for_attribute(node)
    #             origin_scope_id = None
    #         else:
    #             scope_id = node.scope_id
    #             origin_scope_id = scope_id
    #
    #         while scope_id:
    #             if self.scope_id_structure.get(scope_id, {}).get(token_string):
    #                 if scope_id == origin_scope_id:
    #                     # TODO if there some variant then show them all
    #                     return list(filter(lambda x: x.lineno.lineno <= line_number, self.scope_id_structure[scope_id][token_string]))[-1]
    #                 else:
    #                     return self.scope_id_structure[scope_id][token_string][0]
    #             scope_id = self.child_parent_scope_id_links[scope_id]['parent_scope_id']

    def get_assign_node_information(self, token_string, line_number: int, col_offset: int):
        if self.line_structure[line_number].get(token_string) and self.line_structure[line_number][token_string][0].type == 'attribute':
            attribute_owner = self.pass_through_attribute_chain(self.line_structure[line_number][token_string][0])
            namespace_id = self.get_assign_node_information(attribute_owner.string, attribute_owner.lineno, attribute_owner.col_offset).child_scope_id
            origin_namespace_id = namespace_id
        else:
            namespace_id = None
            for _namespace_id, namespace_prop in sorted(self.child_parent_scope_id_links.items(), key=lambda x: operator.itemgetter('lineno')(x[1])):
                if namespace_prop['col_offset'] <= col_offset:
                    namespace_id = _namespace_id
            origin_namespace_id = namespace_id

        while namespace_id:
            if self.scope_id_structure.get(namespace_id, {}).get(token_string):
                if namespace_id == origin_namespace_id:
                    # TODO if there some variant then show them all
                    return list(filter(lambda x: x.lineno.lineno <= line_number, self.scope_id_structure[namespace_id][token_string]))[-1]
                else:
                    return self.scope_id_structure[namespace_id][token_string][0]
            namespace_id = self.child_parent_scope_id_links[namespace_id]['parent_scope_id']

    def get_autocomlete(self, token_string, owner_attribute_string=None, line_number: int = 0, col_offset: int = 0):
        if not owner_attribute_string:
            namespace_id = None
            for _namespace_id, namespace_prop in sorted(self.child_parent_scope_id_links.items(), key=lambda x: operator.itemgetter('lineno')(x[1])):
                if namespace_prop['col_offset'] <= col_offset:
                    namespace_id = _namespace_id
        else:
            attribute_owner_node = self.get_assign_node_information(owner_attribute_string, line_number, col_offset)
            namespace_id = attribute_owner_node.child_scope_id

        result = []
        while namespace_id:
            result += list(filter(lambda x: x.startswith(token_string), self.scope_id_structure.get(namespace_id, {}).keys()))
            if owner_attribute_string:
                break
            namespace_id = self.child_parent_scope_id_links[namespace_id]['parent_scope_id']
        return result

    def get_node(self, token_string, line_number: int, col_offset):
        node_info = self.line_structure[self.get_lineno(line_number)].get(token_string, None)
        if node_info:
            for node in reversed(node_info):
                if node.col_offset <= col_offset:
                    return node
        return None

    # def shift_lines(self, start_line, line_count):
    #     if line_count > 0:
    #         for line_number in sorted(list(self.created_lineno), reverse=True):
    #             if line_number >= start_line:
    #                 self.created_lineno[line_number + line_count] = self.created_lineno[line_number]
    #                 self.created_lineno[line_number + line_count].node_lineno += line_count
    #                 del self.created_lineno[line_number]
    #     elif line_count < 0:
    #         for line_number in sorted(list(self.created_lineno), reverse=False):
    #             if line_number >= start_line:
    #                 self.created_lineno[line_number + line_count] = self.created_lineno[line_number]
    #                 self.created_lineno[line_number + line_count].node_lineno += line_count
    #                 # del self.created_lineno[line_number]

    def add_lines(self, lines, start_line_number):
        # self.shift_lines(start_line_number, len(lines) - replace)
        # for line_number, line in enumerate(lines, start_line_number):
        #     ast.parse()
        #     self.add_line(line, line_number, reevaluate_tree=False)
        content_arr = self.content.split('\n')
        content_arr = content_arr[:start_line_number] + lines + content_arr[start_line_number:]
        self.content = '\n'.join(content_arr)
        try:
            self.parse_content()
        except Exception:
            print(traceback.format_exc())

AST_PARSER = {}
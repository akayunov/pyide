import traceback
import ast
import operator
import _ast
import tokenize
import token
from io import BytesIO
import keyword
import uuid


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
        if type(other) is int:
            return self.node_lineno == other
        elif type(other) is LineNo:
            return self.node_lineno == other.node_lineno
        else:
            raise TypeError('Uncomparable types')

    def __lt__(self, other):
        if type(other) is int:
            return self.node_lineno < other
        elif type(other) is LineNo:
            return self.node_lineno < other.node_lineno
        else:
            raise TypeError('Uncomparable types')

    def __gt__(self, other):
        if type(other) is int:
            return self.node_lineno > other
        elif type(other) is LineNo:
            return self.node_lineno > other.node_lineno
        else:
            raise TypeError('Uncomparable types')

    def __repr__(self):
        return str(self.node_lineno)


class NodeInfo:
    def __init__(self, node_string, node_type, col_offset, node_id, scope_id, lineno, action=None, parent_scope_id=None, child_scope_id=None,
                 owner=None, value=None):
        self.string = node_string
        self.type = node_type
        self.col_offset = col_offset
        self.id = node_id
        self.scope_id = scope_id
        self.lineno = lineno
        self.parent_scope_id = parent_scope_id

        # for module, classes, function
        self.child_scope_id = child_scope_id

        # for assign
        self.value = value
        self.action = action

        # for attribute
        self.owner = owner

    def __repr__(self):
        return '\n                               NodeInfo(' + ',\n                                          '.join(
            (attr + '=\'' + str(getattr(self, attr)) + '\'' for attr in
             ['string', 'type', 'col_offset', 'id', 'scope_id', 'lineno', 'parent_scope_id', 'child_scope_id', 'action', 'value', 'owner'])) + ')\n\n'

    __str__ = __repr__


class AstParser:
    def __init__(self, content, parent_scope_id):
        self.scope_id = str(uuid.uuid4())  # curent scope
        self.parent_scope_id = parent_scope_id  # parent scope

        self.created_lineno = {}
        self.line_structure = {}  # key is line number, value is dictionary: keys are node_strings, values = NodeInfo() objects
        self.scope_id_structure = {}  # additional structure - keys - scope_id, values - dict: keys - token_strings, values - NodeInfo()

        # tree of scopes - link any scope_id to it parent, needed in search of name from bottom to up in scope tree
        # easy to modify just add new and don't think about old ones
        self.child_parent_scope_id_links = {
            self.scope_id: {
                'parent_scope_id': None,
                'lineno': 1,
                'col_offset': 0
            }
        }

        # for while for easy add remove lines
        if not content.endswith(b'\n'):
            self.content = content + b'\n'
        else:
            self.content = content
        # TODO move it on class level
        self.parsers = {
            _ast.FunctionDef: self.parse_function,
            _ast.ClassDef: self.parse_class,
            _ast.Module: self.parse_module,
            _ast.Import: self.parse_import,
            _ast.ImportFrom: self.parse_import_from,
            _ast.Assign: self.parse_assing,
            _ast.List: self.parse_list,
            _ast.Str: self.parse_string,
            _ast.Return: self.parse_return,
            _ast.Name: self.parse_name,
            _ast.arg: self.parse_argument,
            _ast.Tuple: self.parse_tuple,
            _ast.Attribute: self.parse_attribute,
            _ast.Num: self.parse_number,
            _ast.Pass: self.parse_pass,
            _ast.Raise: self.parse_raise,
            _ast.Expr: self.parse_expression,
            _ast.Call: self.parse_call,
            _ast.For: self.parse_for,
            _ast.Lambda: self.parse_lambda,
            _ast.If: self.parse_if,
            _ast.ListComp: self.parse_listcomp,
            _ast.BinOp: self.parse_binop,
            _ast.NameConstant: self.parse_nameconstant,
            _ast.Subscript: self.parse_subscript,
            _ast.DictComp: self.parse_dictcomp,
            _ast.AugAssign: self.parse_augassign,
            _ast.IfExp: self.parse_ifexp,
            _ast.While: self.parse_while,
            _ast.Dict: self.parse_dict,
            _ast.Try: self.parse_try,
            _ast.Delete: self.parse_delete,
            _ast.Assert: self.parse_assert,
            _ast.Compare: self.parse_compare,
            _ast.UnaryOp: self.parse_unaryop,
            _ast.BoolOp: self.parse_boolop,
            _ast.Yield: self.parse_yield,
            _ast.Break: self.parse_break,
            _ast.Continue: self.parse_continue,
            _ast.GeneratorExp: self.parse_generatorexp,
            _ast.Global: self.parse_global
        }

    def parse_content(self, start_line=1):
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
        self.parsers[ast_tree.__class__](ast_tree)
        self.convert_to_scope_id_structure()
        # debug_print
        from pprint import pprint
        # print('line_structure')
        # pprint(self.line_structure)
        # print('scope_id_structure')
        # pprint(self.scope_id_structure)
        # print('child_parent_scope_id_links')
        # pprint(self.child_parent_scope_id_links)
        # import pdb;pdb.set_trace()

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
        while node.value:
            node = node.value
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
        owner_node_info = self.get_assign_node_information_by_namespace_id(node.string, node.lineno.lineno, node.col_offset)
        if not owner_node_info:
            return None
        assign_owner_value_node_info = self.pass_through_assign_chain(owner_node_info)
        if orig_node == assign_owner_value_node_info:
            # workaround for situation like expected_sha256 = expected_sha256.lower()
            # - will be deep recursion for next string FIX IT
            return None
        # owner_node_info_type_definition = self.get_assign_node_information_by_token(
        owner_node_info_type_definition = self.get_assign_node_information_by_namespace_id(
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

    def get_assign_node_information_by_namespace_id(self, token_string, line_number: int, col_offset: int):
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

    def get_autocomlete(self, token_string, owner_attribute_string=None, line_number: int=0, col_offset: int=0):
        if not owner_attribute_string:
            namespace_id = None
            for _namespace_id, namespace_prop in sorted(self.child_parent_scope_id_links.items(), key=lambda x: operator.itemgetter('lineno')(x[1])):
                if namespace_prop['col_offset'] <= col_offset:
                    namespace_id = _namespace_id
        else:
            attribute_owner_node = self.get_assign_node_information_by_namespace_id(owner_attribute_string, line_number, col_offset)
            namespace_id = attribute_owner_node.child_scope_id

        result = []
        while namespace_id:
            result += list(filter(lambda x: x.startswith(token_string),self.scope_id_structure.get(namespace_id, {}).keys()))
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

    def add_lines(self, lines, start_line_number, replace=0):
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

    # ========================= Parsers for ast nodes=======================

    def parse_module(self, node):
        for i in node.body:
            self.parsers[i.__class__](i)

    def parse_class(self, node):
        # TODO looks like function def ttry to merge
        for n, decorator in enumerate(node.decorator_list):
            self.parsers[decorator.__class__](decorator)
        with ScopeContextManager(self, node) as s:
            for body_obj in node.body:
                self.parsers[body_obj.__class__](body_obj)
        node_line = node.lineno + len(node.decorator_list)
        self.line_structure[self.get_lineno(node_line)][node.name].append(
            NodeInfo(
                node_string=node.name,
                node_type='class',
                action=ast.Store,
                col_offset=node.col_offset,
                node_id=str(uuid.uuid4()),
                scope_id=self.scope_id,
                parent_scope_id=self.parent_scope_id,
                child_scope_id=s.new_scope_id,
                lineno=self.get_lineno(node_line)
            ))

    def parse_function(self, node):
        for n, decorator in enumerate(node.decorator_list):
            self.parsers[decorator.__class__](decorator)
        if node.returns:
            self.parsers[node.returns.__class__](node.returns)
        with ScopeContextManager(self, node) as s:
            for argument in node.args.args:
                self.parsers[argument.__class__](argument)
            for body_obj in node.body:
                self.parsers[body_obj.__class__](body_obj)
        node_line = node.lineno + len(node.decorator_list)
        self.line_structure[self.get_lineno(node_line)][node.name].append(
            NodeInfo(
                node_string=node.name,
                node_type='function',
                action=ast.Store,
                col_offset=node.col_offset,
                node_id=str(uuid.uuid4()),
                scope_id=self.scope_id,
                parent_scope_id=self.parent_scope_id,
                child_scope_id=s.new_scope_id,
                lineno=self.get_lineno(node_line)
            ))

    def parse_return(self, node: ast.Return):
        if node.value is not None:
            self.parsers[node.value.__class__](node.value)

    def parse_name(self, node: ast.Name):
        node_info = NodeInfo(
            node_string=node.id,
            node_type='name',
            col_offset=node.col_offset,
            node_id=str(uuid.uuid4()),
            action=node.ctx.__class__,
            scope_id=self.scope_id,
            parent_scope_id=self.parent_scope_id,
            child_scope_id=None,
            lineno=self.get_lineno(node.lineno)
        )
        self.line_structure[self.get_lineno(node.lineno)][node.id].append(node_info)
        return node_info

    def parse_argument(self, node: ast.arg):
        self.line_structure[self.get_lineno(node.lineno)][node.arg].append(
            NodeInfo(
                node_string=node.arg,
                node_type='argument',
                action=ast.Store,
                col_offset=node.col_offset,
                node_id=str(uuid.uuid4()),
                scope_id=self.scope_id,
                parent_scope_id=self.parent_scope_id,
                child_scope_id=None,
                lineno=self.get_lineno(node.lineno)
            ))

    def parse_import(self, node: ast.Import):
        for alias_name in node.names:
            for mod in filter(None, alias_name.name.split('.')):
                self.line_structure[self.get_lineno(node.lineno)][mod].append(
                    NodeInfo(
                        node_string=alias_name.name,
                        node_type='module',
                        col_offset=node.col_offset,
                        node_id=str(uuid.uuid4()),
                        scope_id=self.scope_id,
                        action=ast.Store,  # TODO fix it and pass to standart lib
                        parent_scope_id=self.parent_scope_id,
                        child_scope_id=None,
                        lineno=self.get_lineno(node.lineno)
                    ))
            if alias_name.asname:
                self.line_structure[self.get_lineno(node.lineno)][alias_name.asname].append(
                    NodeInfo(
                        node_string=alias_name.asname,
                        node_type='module_alias',
                        col_offset=node.col_offset,
                        node_id=str(uuid.uuid4()),
                        action=ast.Store,
                        scope_id=self.scope_id,
                        parent_scope_id=self.parent_scope_id,
                        child_scope_id=None,
                        lineno=self.get_lineno(node.lineno)
                    ))

    def parse_import_from(self, node: ast.ImportFrom):
        for mod in filter(None, node.module.split('.')):
            self.line_structure[self.get_lineno(node.lineno)][mod].append(
                NodeInfo(
                    node_string=node.module,
                    node_type='module',
                    col_offset=node.col_offset,
                    node_id=str(uuid.uuid4()),
                    scope_id=self.scope_id,
                    parent_scope_id=self.parent_scope_id,
                    child_scope_id=None,
                    lineno=self.get_lineno(node.lineno)
                ))
        for alias_name in node.names:
            self.line_structure[self.get_lineno(node.lineno)][alias_name.name].append(
                NodeInfo(
                    node_string=alias_name.name,
                    node_type='imported_name',
                    col_offset=node.col_offset,
                    node_id=str(uuid.uuid4()),
                    scope_id=self.scope_id,
                    action=ast.Store,  # TODO fix it and pass to standart lib
                    parent_scope_id=self.parent_scope_id,
                    child_scope_id=None,
                    lineno=self.get_lineno(node.lineno)
                ))
            if alias_name.asname:
                self.line_structure[self.get_lineno(node.lineno)][alias_name.asname].append(
                    NodeInfo(
                        node_string=alias_name.asname,
                        node_type='module_alias',
                        col_offset=node.col_offset,
                        node_id=str(uuid.uuid4()),
                        scope_id=self.scope_id,
                        action=ast.Store,
                        parent_scope_id=self.parent_scope_id,
                        child_scope_id=None,
                        lineno=self.get_lineno(node.lineno)
                    ))

    def parse_assing(self, node: ast.Assign):
        value_node_info = self.parsers[node.value.__class__](node.value)
        for target in node.targets:
            if target.__class__ == ast.Name:
                self.line_structure[self.get_lineno(node.lineno)][target.id].append(
                    NodeInfo(
                        node_string=target.id,
                        node_type='name',
                        col_offset=node.col_offset,
                        node_id=str(uuid.uuid4()),
                        action=ast.Store,
                        scope_id=self.scope_id,
                        parent_scope_id=self.parent_scope_id,
                        child_scope_id=None,
                        lineno=self.get_lineno(node.lineno),
                        value=value_node_info
                    ))
            else:
                self.parsers[target.__class__](target)

    def parse_list(self, node: ast.List):
        for list_el in node.elts:
            # parse value
            self.parsers[list_el.__class__](list_el)

    def parse_tuple(self, node: ast.Tuple):
        for tuple_el in node.elts:
            # parse value
            self.parsers[tuple_el.__class__](tuple_el)

    def parse_string(self, node: ast.Str):
        pass

    def parse_number(self, node: ast.Num):
        pass

    def parse_pass(self, node: ast.Pass):
        pass

    def parse_attribute(self, node: ast.Attribute):
        value_node_info = self.parsers[node.value.__class__](node.value)
        if value_node_info:
            node_info = NodeInfo(
                node_string=node.attr,
                node_type='attribute',
                owner=value_node_info,
                col_offset=node.col_offset,
                node_id=str(uuid.uuid4()),
                scope_id=self.scope_id,
                parent_scope_id=self.parent_scope_id,
                child_scope_id=None,
                lineno=self.get_lineno(node.lineno)
            )
            self.line_structure[self.get_lineno(node.lineno)][node.attr].append(node_info)
            return node_info
        else:
            # for builtins we will be here
            pass

    def parse_raise(self, node: ast.Raise):
        self.parsers[node.exc.__class__](node.exc)

    def parse_expression(self, node: ast.Expr):
        self.parsers[node.value.__class__](node.value)

    def parse_call(self, node: ast.Call):
        if node.func.__class__ is ast.Name:
            node_info = NodeInfo(
                node_string=node.func.id,
                node_type='name',
                col_offset=node.col_offset,
                node_id=str(uuid.uuid4()),
                scope_id=self.scope_id,
                parent_scope_id=self.parent_scope_id,
                lineno=self.get_lineno(node.lineno)
            )
            self.line_structure[self.get_lineno(node.lineno)][node.func.id].append(node_info)
        else:
            node_info = self.parsers[node.func.__class__](node.func)
        for argument in node.args:
            self.parsers[argument.__class__](argument)
        return node_info

    def parse_for(self, node: ast.For):
        self.parsers[node.target.__class__](node.target)
        self.parsers[node.iter.__class__](node.iter)
        for body_i in node.body:
            self.parsers[body_i.__class__](body_i)
        for orelse_i in node.orelse:
            self.parsers[orelse_i.__class__](orelse_i)

    def parse_lambda(self, node: ast.Lambda):
        pass

    def parse_if(self, node: ast.If):
        self.parsers[node.test.__class__](node.test)
        for body_i in node.body:
            self.parsers[body_i.__class__](body_i)
        for orelse in node.orelse:
            self.parsers[orelse.__class__](orelse)

    def parse_listcomp(self, node: ast.Lambda):
        pass

    def parse_binop(self, node: ast.Lambda):
        pass

    def parse_nameconstant(self, node: ast.Lambda):
        pass

    def parse_subscript(self, node: ast.Lambda):
        pass

    def parse_dictcomp(self, node: ast.Lambda):
        pass

    def parse_augassign(self, node: ast.Lambda):
        pass

    def parse_ifexp(self, node: ast.Lambda):
        pass

    def parse_while(self, node: ast.Lambda):
        pass

    def parse_dict(self, node: ast.Lambda):
        pass

    def parse_try(self, node: ast.Lambda):
        pass

    def parse_delete(self, node: ast.Lambda):
        pass

    def parse_assert(self, node: ast.Lambda):
        pass

    def parse_compare(self, node: ast.Compare):
        self.parsers[node.left.__class__](node.left)
        for comparator in node.comparators:
            self.parsers[comparator.__class__](comparator)

    def parse_unaryop(self, node: ast.Compare):
        pass

    def parse_boolop(self, node: ast.Compare):
        pass

    def parse_yield(self, node: ast.Compare):
        pass

    def parse_break(self, node: ast.Compare):
        pass

    def parse_continue(self, node: ast.Continue):
        pass

    def parse_generatorexp(self, node: ast.GeneratorExp):
        pass

    def parse_global(self, node: ast.GeneratorExp):
        pass


class ScopeContextManager:
    def __init__(self, ast_parser_obj: AstParser, node):
        self.ast_parser_obj = ast_parser_obj
        self.new_scope_id = str(uuid.uuid4())
        #         у класса и функции есть
        #         (Pdb)
        #         node.lineno
        #         13
        #         (Pdb)
        #         node.col_offset
        #         4
        # и они показывают где определаена йункция или класс
        self.previous_scope_id = ast_parser_obj.scope_id
        self.previous_parent_scope_id = ast_parser_obj.parent_scope_id
        self.ast_parser_obj.child_parent_scope_id_links[self.new_scope_id] = {
            'parent_scope_id': self.previous_scope_id,
            'lineno': node.lineno,
            'col_offset': node.col_offset
        }

    def __enter__(self):
        self.ast_parser_obj.scope_id = self.new_scope_id
        self.ast_parser_obj.parent_scope_id = self.previous_scope_id
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.ast_parser_obj.scope_id = self.previous_scope_id
        self.ast_parser_obj.parent_scope_id = self.previous_parent_scope_id

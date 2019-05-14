import ast
import _ast
import uuid

from pyide.astparser.old.nodeinfo_old import NodeInfo
from pyide.astparser.old.scopemanager_old import ScopeContextManager


class Parsers:
    def __init__(self, ast_tree_obj):
        self.ast_tree_obj = ast_tree_obj
        self.parsers = {
            _ast.Module: self.parse_module,
            _ast.FunctionDef: self.parse_function,
            _ast.ClassDef: self.parse_class,
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

    # def __getattr__(self, item):
    #     return self.parsers_dict[item]

    def parse_module(self, node, token_info=None):
        for i in node.body:
            self.parsers[i.__class__](i)

    def parse_class(self, node):
        # TODO looks like function def ttry to merge
        for _, decorator in enumerate(node.decorator_list):
            self.parsers[decorator.__class__](decorator)
        with ScopeContextManager(self.ast_tree_obj, node) as scope:
            for body_obj in node.body:
                self.parsers[body_obj.__class__](body_obj)
        node_line = node.lineno + len(node.decorator_list)
        self.ast_tree_obj.line_structure[self.ast_tree_obj.get_lineno(node_line)][node.name].append(
            NodeInfo(
                node_string=node.name,
                node_type='class',
                action=ast.Store,
                col_offset=node.col_offset,
                node_id=str(uuid.uuid4()),
                scope_id=self.ast_tree_obj.scope_id,
                parent_scope_id=self.ast_tree_obj.parent_scope_id,
                child_scope_id=scope.new_scope_id,
                lineno=self.ast_tree_obj.get_lineno(node_line)
            ))

    def parse_function(self, node):
        for _, decorator in enumerate(node.decorator_list):
            self.parsers[decorator.__class__](decorator)
        if node.returns:
            self.parsers[node.returns.__class__](node.returns)
        with ScopeContextManager(self.ast_tree_obj, node) as scope:
            for argument in node.args.args:
                self.parsers[argument.__class__](argument)
            for body_obj in node.body:
                self.parsers[body_obj.__class__](body_obj)
        node_line = node.lineno + len(node.decorator_list)
        self.ast_tree_obj.line_structure[self.ast_tree_obj.get_lineno(node_line)][node.name].append(
            NodeInfo(
                node_string=node.name,
                node_type='function',
                action=ast.Store,
                col_offset=node.col_offset,
                node_id=str(uuid.uuid4()),
                scope_id=self.ast_tree_obj.scope_id,
                parent_scope_id=self.ast_tree_obj.parent_scope_id,
                child_scope_id=scope.new_scope_id,
                lineno=self.ast_tree_obj.get_lineno(node_line)
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
            scope_id=self.ast_tree_obj.scope_id,
            parent_scope_id=self.ast_tree_obj.parent_scope_id,
            child_scope_id=None,
            lineno=self.ast_tree_obj.get_lineno(node.lineno)
        )
        self.ast_tree_obj.line_structure[self.ast_tree_obj.get_lineno(node.lineno)][node.id].append(node_info)
        return node_info

    def parse_argument(self, node: ast.arg):
        self.ast_tree_obj.line_structure[self.ast_tree_obj.get_lineno(node.lineno)][node.arg].append(
            NodeInfo(
                node_string=node.arg,
                node_type='argument',
                action=ast.Store,
                col_offset=node.col_offset,
                node_id=str(uuid.uuid4()),
                scope_id=self.ast_tree_obj.scope_id,
                parent_scope_id=self.ast_tree_obj.parent_scope_id,
                child_scope_id=None,
                lineno=self.ast_tree_obj.get_lineno(node.lineno)
            ))

    def parse_import(self, node: ast.Import):
        for alias_name in node.names:
            for mod in filter(None, alias_name.name.split('.')):
                self.ast_tree_obj.line_structure[self.ast_tree_obj.get_lineno(node.lineno)][mod].append(
                    NodeInfo(
                        node_string=alias_name.name,
                        node_type='module',
                        col_offset=node.col_offset,
                        node_id=str(uuid.uuid4()),
                        scope_id=self.ast_tree_obj.scope_id,
                        action=ast.Store,  # TODO fix it and pass to standart lib
                        parent_scope_id=self.ast_tree_obj.parent_scope_id,
                        child_scope_id=None,
                        lineno=self.ast_tree_obj.get_lineno(node.lineno)
                    ))
            if alias_name.asname:
                self.ast_tree_obj.line_structure[self.ast_tree_obj.get_lineno(node.lineno)][alias_name.asname].append(
                    NodeInfo(
                        node_string=alias_name.asname,
                        node_type='module_alias',
                        col_offset=node.col_offset,
                        node_id=str(uuid.uuid4()),
                        action=ast.Store,
                        scope_id=self.ast_tree_obj.scope_id,
                        parent_scope_id=self.ast_tree_obj.parent_scope_id,
                        child_scope_id=None,
                        lineno=self.ast_tree_obj.get_lineno(node.lineno)
                    ))

    def parse_import_from(self, node: ast.ImportFrom):
        for mod in filter(None, node.module.split('.')):
            self.ast_tree_obj.line_structure[self.ast_tree_obj.get_lineno(node.lineno)][mod].append(
                NodeInfo(
                    node_string=node.module,
                    node_type='module',
                    col_offset=node.col_offset,
                    node_id=str(uuid.uuid4()),
                    scope_id=self.ast_tree_obj.scope_id,
                    parent_scope_id=self.ast_tree_obj.parent_scope_id,
                    child_scope_id=None,
                    lineno=self.ast_tree_obj.get_lineno(node.lineno)
                ))
        for alias_name in node.names:
            self.ast_tree_obj.line_structure[self.ast_tree_obj.get_lineno(node.lineno)][alias_name.name].append(
                NodeInfo(
                    node_string=alias_name.name,
                    node_type='imported_name',
                    col_offset=node.col_offset,
                    node_id=str(uuid.uuid4()),
                    scope_id=self.ast_tree_obj.scope_id,
                    action=ast.Store,  # TODO fix it and pass to standart lib
                    parent_scope_id=self.ast_tree_obj.parent_scope_id,
                    child_scope_id=None,
                    lineno=self.ast_tree_obj.get_lineno(node.lineno)
                ))
            if alias_name.asname:
                self.ast_tree_obj.line_structure[self.ast_tree_obj.get_lineno(node.lineno)][alias_name.asname].append(
                    NodeInfo(
                        node_string=alias_name.asname,
                        node_type='module_alias',
                        col_offset=node.col_offset,
                        node_id=str(uuid.uuid4()),
                        scope_id=self.ast_tree_obj.scope_id,
                        action=ast.Store,
                        parent_scope_id=self.ast_tree_obj.parent_scope_id,
                        child_scope_id=None,
                        lineno=self.ast_tree_obj.get_lineno(node.lineno)
                    ))

    def parse_assing(self, node: ast.Assign):
        value_node_info = self.parsers[node.value.__class__](node.value)
        for target in node.targets:
            if target.__class__ == ast.Name:
                self.ast_tree_obj.line_structure[self.ast_tree_obj.get_lineno(node.lineno)][target.id].append(
                    NodeInfo(
                        node_string=target.id,
                        node_type='name',
                        col_offset=node.col_offset,
                        node_id=str(uuid.uuid4()),
                        action=ast.Store,
                        scope_id=self.ast_tree_obj.scope_id,
                        parent_scope_id=self.ast_tree_obj.parent_scope_id,
                        child_scope_id=None,
                        lineno=self.ast_tree_obj.get_lineno(node.lineno),
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
        node_info = None
        if value_node_info:
            node_info = NodeInfo(
                node_string=node.attr,
                node_type='attribute',
                owner=value_node_info,
                col_offset=node.col_offset,
                node_id=str(uuid.uuid4()),
                scope_id=self.ast_tree_obj.scope_id,
                parent_scope_id=self.ast_tree_obj.parent_scope_id,
                child_scope_id=None,
                lineno=self.ast_tree_obj.get_lineno(node.lineno)
            )
            self.ast_tree_obj.line_structure[self.ast_tree_obj.get_lineno(node.lineno)][node.attr].append(node_info)
            node_info = node_info
        else:
            # for builtins we will be here
            pass
        return node_info

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
                scope_id=self.ast_tree_obj.scope_id,
                parent_scope_id=self.ast_tree_obj.parent_scope_id,
                lineno=self.ast_tree_obj.get_lineno(node.lineno)
            )
            self.ast_tree_obj.line_structure[self.ast_tree_obj.get_lineno(node.lineno)][node.func.id].append(node_info)
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

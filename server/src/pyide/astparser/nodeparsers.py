import ast
import _ast


class Parsers:
    def __init__(self):
        self.current_scope = None
        self.previous_scope = None

        self.scope_tree = {}

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

    def parse_module(self, node, token_string, token_line=None, token_position=None, ctxs=tuple([ast.Store, ast.Load, ast.Del])):
        self.current_scope = node
        self.scope_tree[self.previous_scope] = self.current_scope
        for i in node.body:
            if token_line is not None and token_line != i.lineno:
                continue
            result = self.parsers[i.__class__](i, token_string, token_line, token_position, ctxs)
            if result:
                return result

    def parse_class(self, node, token_string, token_line=None, token_position=None, ctxs=tuple([ast.Store, ast.Load, ast.Del])):
        if token_string is not None and node.name == token_string:
            return node
        # TODO looks like function def ttry to merge
        for _, decorator in enumerate(node.decorator_list):
            self.parsers[decorator.__class__](decorator, token_string, token_line, token_position, ctxs)
        self.previous_scope = self.current_scope
        self.current_scope = node
        self.scope_tree[self.previous_scope] = self.current_scope
        for body_obj in node.body:
            self.parsers[body_obj.__class__](body_obj, token_string, token_line, token_position, ctxs)

    def parse_function(self, node, token_string, token_line=None, token_position=None, ctxs=tuple([ast.Store, ast.Load, ast.Del])):
        for _, decorator in enumerate(node.decorator_list):
            self.parsers[decorator.__class__](decorator)
        if node.returns:
            self.parsers[node.returns.__class__](node.returns, token_string, token_line, token_position, ctxs)
        self.previous_scope = self.current_scope
        self.current_scope = node
        self.scope_tree[self.previous_scope] = self.current_scope
        for argument in node.args.args:
            self.parsers[argument.__class__](argument, token_string, token_line, token_position, ctxs)
        for body_obj in node.body:
            self.parsers[body_obj.__class__](body_obj, token_string, token_line, token_position, ctxs)

    def parse_return(self, node: ast.Return, token_string, token_line=None, token_position=None, ctxs=tuple([ast.Store, ast.Load, ast.Del])):
        if node.value is not None:
            self.parsers[node.value.__class__](node.value, token_string, token_line, token_position, ctxs)

    def parse_name(self, node: ast.Name, token_string, token_line=None, token_position=None, ctxs=tuple([ast.Store, ast.Load, ast.Del])):
        if node.id == token_string and \
                type(node.ctx) in ctxs and \
                token_line is not None and token_line == node.lineno and \
                token_position is not None and token_position == node.col_offset:
            return node

    def parse_argument(self, node: ast.arg, token_string, token_line=None, token_position=None, ctxs=tuple([ast.Store, ast.Load, ast.Del])):
        pass

    def parse_import(self, node: ast.Import, token_string, token_line=None, token_position=None, ctxs=tuple([ast.Store, ast.Load, ast.Del])):
        pass

    def parse_import_from(self, node: ast.ImportFrom, token_string, token_line=None, token_position=None, ctxs=tuple([ast.Store, ast.Load, ast.Del])):
        pass

    def parse_assing(self, node: ast.Assign, token_string, token_line=None, token_position=None, ctxs=tuple([ast.Store, ast.Load, ast.Del])):
        for target in node.targets:
            if target.__class__ == ast.Name:
                pass
            else:
                self.parsers[target.__class__](target, token_string, token_line, token_position, ctxs)

    def parse_list(self, node: ast.List, token_string, token_line=None, token_position=None, ctxs=tuple([ast.Store, ast.Load, ast.Del])):
        for list_el in node.elts:
            # parse value
            self.parsers[list_el.__class__](list_el, token_string, token_line, token_position, ctxs)

    def parse_tuple(self, node: ast.Tuple, token_string, token_line=None, token_position=None, ctxs=tuple([ast.Store, ast.Load, ast.Del])):
        for tuple_el in node.elts:
            # parse value
            self.parsers[tuple_el.__class__](tuple_el, token_string, token_line, token_position, ctxs)

    def parse_string(self, node: ast.Str, token_string, token_line=None, token_position=None, ctxs=tuple([ast.Store, ast.Load, ast.Del])):
        pass

    def parse_number(self, node: ast.Num, token_string, token_line=None, token_position=None, ctxs=tuple([ast.Store, ast.Load, ast.Del])):
        pass

    def parse_pass(self, node: ast.Pass, token_string, token_line=None, token_position=None, ctxs=tuple([ast.Store, ast.Load, ast.Del])):
        pass

    def parse_attribute(self, node: ast.Attribute, token_string, token_line=None, token_position=None, ctxs=tuple([ast.Store, ast.Load, ast.Del])):
        return self.parsers[node.value.__class__](node.value, token_string, token_line, token_position, ctxs)

    def parse_raise(self, node: ast.Raise):
        self.parsers[node.exc.__class__](node.exc)

    def parse_expression(self, node: ast.Expr, token_string, token_line=None, token_position=None, ctxs=tuple([ast.Store, ast.Load, ast.Del])):
        return self.parsers[node.value.__class__](node.value, token_string, token_line, token_position, ctxs)

    def parse_call(self, node: ast.Call, token_string, token_line=None, token_position=None, ctxs=tuple([ast.Store, ast.Load, ast.Del])):
        if node.func.__class__ is ast.Name:
            pass
        else:
            node_info = self.parsers[node.func.__class__](node.func, token_string, token_line, token_position, ctxs)
            if node_info:
                return node_info
        for argument in node.args:
            arg_info = self.parsers[argument.__class__](argument, token_string, token_line, token_position, ctxs)
            if arg_info:
                return arg_info

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

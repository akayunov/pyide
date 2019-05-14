import ast

from pyide.astparser.nodeparsers import Parsers


class AstParser:
    @staticmethod
    def search_token(token_info, node_to_start):
        parsers = Parsers()
        result = parsers.parsers[node_to_start.__class__](node_to_start, token_string=token_info.string, token_line=token_info.start[0], token_position=token_info.start[1], ctxs=tuple([ast.Store, ast.Load, ast.Del]))
        return result, parsers.current_scope, parsers.scope_tree

    @staticmethod
    def get_token_definition(token_info, node_scope_id, scope_tree):
        parsers = Parsers()
        result = parsers.parsers[node_scope_id.__class__](node_scope_id, token_string=token_info.string, ctxs=(ast.Store,))
        while not result:
            parent_node = AstParser.get_parent_node(node_scope_id, scope_tree)
            result = parsers.parsers[parent_node.__class__](parent_node, token_string=token_info.string, ctxs=(ast.Store,))
        return result

    @staticmethod
    def get_parent_node(node, scope_tree):
        for n in scope_tree:
            if scope_tree[n] == node:
                return n

    @staticmethod
    def parse_content(content):
        return ast.parse(content.read())


AST_PARSER = {}

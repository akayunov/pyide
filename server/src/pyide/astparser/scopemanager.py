import uuid


class ScopeContextManager:
    def __init__(self, ast_parser_obj, node):
        self.ast_parser_obj = ast_parser_obj
        self.new_scope_id = str(uuid.uuid4())
        #         у класса и функции есть
        #         (Pdb)
        #         node.lineno
        #         13
        #         (Pdb)
        #         node.col_offset
        #         4
        # и они показывают где определаена функция или класс
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

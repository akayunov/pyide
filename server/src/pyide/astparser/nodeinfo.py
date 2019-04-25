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

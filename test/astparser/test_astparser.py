import os.path

from pyide.astparser import AstParser

def test_add_lines():
    with open(os.path.join(os.path.dirname(__file__), 'resourses', 'testmodule1.py')) as f:
        content = f.read()
        ast_parse = AstParser(content, 123)

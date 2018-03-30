import ast
f = open('/home/akayunov/pyide/server/test/testpackage/testmodule1.py')
con = f.read()
qwe = ast.parse(con, 'tratata', 'exec')

def w(node):
    for i in ast.walk(node):
        yield i
        if 'body' in i._fields:
            print(i.body)
            for k in i.body:
                yield from w(k)
        # if 'body' in i._fields:
        #     w(i)


for i in w(qwe):
    print('=' * 100)
    print(i, i._fields)
    if 'value' in i._fields:
        print(i.value)
    if getattr(i, 'lineno', None):
        print(i.lineno)
    # print('\n'.join(dir(i)))

import symtable
f = open('/home/akayunov/pyide/server/test/testpackage/testmodule1.py')
con = f.read()
qwe = symtable.symtable(con, 'tratata', 'exec')

print(qwe.get_symbols())
print(qwe.lookup('Asd'))
print(qwe.lookup('Asd').get_namespaces())


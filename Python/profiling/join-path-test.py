# 2018-09-21 19:58:08 #
from os import walk as oswalk, sep
from os.path import join as pathjoin
from fnmatch import filter as fnfilter
from time_this import time_this

# things to try: join                                           0
#                plain concat                                   1
#                pre-concat                                     2
#                str formatting                                 3
#                pre-formatting                                 4
#                os.path.join                                   5

@time_this(2500)
def pathjoin0():
    for path, files in path_data:
        yield from (sjoin([path, f]) for f in files)

@time_this(2500)
def pathjoin1():
    for path, files in path_data:
        yield from (path + s + f for f in files)

@time_this(2500)
def pathjoin2():
    for path, files in path_data:
        path += s
        yield from (path + f for f in files)

@time_this(2500)
def pathjoin3():
    for path, files in path_data:
        yield from (f'{path}{s}{f}' for f in files)

@time_this(2500)
def pathjoin4():
    for path, files in path_data:
        path += s
        yield from (f'{path}{f}' for f in files)

@time_this(2500)
def pathjoin5():
    for path, files in path_data:
        yield from (osjoin(path, f) for f in files)

osjoin = pathjoin
path_data = [(p, fnfilter(fs, '*.py')) for p, d, fs in oswalk('/home/erik/Downloads')]
s = sep
sjoin = s.join

pathjoin0()
pathjoin1()
pathjoin2()
pathjoin3()
pathjoin4()
pathjoin5()

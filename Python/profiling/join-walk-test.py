# 2018-09-21 22:43:00 #
import functools
import os
from fnmatch import filter as fnfilter
from time_this import time_this

@time_this(1000)
def map0():
    for path, files in path_data:
        yield from map(pjoin, [path] * len(files), files)

@time_this(1000)
def map1():
    for path, files in path_data:
        yield from map(lambda f: pjoin(path, f), files)

@time_this(1000)
def map2():
    for path, files in path_data:
        yield from map(partfn(pjoin, path), files)

@time_this(1000)
def map3():
    for path, files in path_data:
        yield from map(f'{path}{s}{{}}'.format, files)

@time_this(1000)
def map4():
    for path, files in path_data:
        yield from map(sfmt, [path] * len(files), files)

@time_this(1000)
def map5():
    for path, files in path_data:
        yield from map(partfn(sfmt, path), files)

@time_this(1000)
def map6():
    for path, files in path_data:
        yield from (f'{path}{s}{f}' for f in files)

@time_this(1000)
def map7():
    for path, files in path_data:
        yield from (trifmt(path, s, f) for f in files)

pjoin = os.path.join
partfn = functools.partial
s = os.sep
sfmt = f'{{}}{s}{{}}'.format
trifmt = '{}{}{}'.format
path_data = [(p, fnfilter(fs, '*.py')) for p, d, fs in os.walk('/home/erik/Downloads')]

map0()
map1()
map2()
map3()
map4()
map5()
map6()
map7()

# map0 x 1000 times: min=0.00029 max=0.00035 avg=0.0003 total=0.3
# map1 x 1000 times: min=0.0003 max=0.0004 avg=0.0003 total=0.3
# map2 x 1000 times: min=0.0003 max=0.00038 avg=0.00031 total=0.31
# map3 x 1000 times: min=8.2e-05 max=0.00011 avg=8.4e-05 total=0.084
# map4 x 1000 times: min=8.5e-05 max=0.00012 avg=8.8e-05 total=0.088
# map5 x 1000 times: min=9.1e-05 max=0.00013 avg=9.4e-05 total=0.094
# map6 x 1000 times: min=6.8e-05 max=9.7e-05 avg=7.1e-05 total=0.071
# map7 x 1000 times: min=9.1e-05 max=0.00013 avg=9.5e-05 total=0.095

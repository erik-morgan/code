# 2018-09-23 18:01:45 #
from fnmatch import fnmatch, filter as fnfilter
from os import sep, walk as oswalk
from time_this import time_this
import re

def iter_dir(dpath, pattern='*'):
    steps = (step[::2] for step in oswalk(dpath))
    return {f'{path}{sep}{f}':f for path, files in steps
                                for f in fnfilter(files, pattern)}

@time_this(100)
def split0():
    return {f.partition(' ')[0].partition('.')[0]:path for path, f in files.items()}

@time_this(100)
def split1():
    return {f.replace('.', ' ').partition(' ')[0]:path for path, f in files.items()}

@time_this(100)
def split2():
    return {min(f.partition(' ')[0], f.partition('.')[0], key=len):path
            for path, f in files.items()}

@time_this(100)
def split3():
    return {f.partition(' ' if ' ' in f and f.find(' ') < f.find('.')
                            else '.')[0]:path for path, f in files.items()}

@time_this(100)
def split4():
    rx = re.compile(r'[^-A-Za-z0-9]')
    return {rx.split(f, 1)[0]:path for path, f in files.items()}

@time_this(100)
def split5():
    rx = re.compile(r'[^-A-Za-z0-9]')
    return {f[0]:p for p, f in zip(files.keys(), map(rx.split, files.values()))}

@time_this(100)
def split6():
    rx = re.compile(r'[. ]')
    return {rx.split(f, 1)[0]:path for path, f in files.items()}

@time_this(100)
def split7():
    rx = re.compile(r'^[^. ]+').match
    return {rx(f)[0]:p for p, f in files.items() if f[0] != '.' and (' ' in f or '.' in f)}

@time_this(100)
def split8():
    return {f[:f.find('.', 0, f.find(' '))]:path for path, f in files.items()}

@time_this(100)
def split9():
    d = {}
    for path, f in files.items():
        c = f.find('.')
        d[f[:f.find(' ') if ' ' in f and f.find(' ') < c else c]] = path
    return d

files = iter_dir('/home/erik/Downloads')

split0()
split1()
split2()
split3()
split4()
split5()
split6()
split7()
split8()
split9()

# Using split for split0 - split2
# split0 x 100 times: min=0.00018 max=0.00025 avg=0.00018 total=0.18
# split1 x 100 times: min=0.00018 max=0.00024 avg=0.00018 total=0.18
# split2 x 100 times: min=0.0004 max=0.0005 avg=0.00041 total=0.41
# split3 x 100 times: min=0.0001 max=0.00014 avg=0.00011 total=0.11
# split4 x 100 times: min=0.00032 max=0.00062 avg=0.00033 total=0.33
# split5 x 100 times: min=0.00031 max=0.00041 avg=0.00033 total=0.33
# split6 x 100 times: min=0.00032 max=0.00052 avg=0.00033 total=0.33
# split7 x 100 times: min=0.00017 max=0.00042 avg=0.00018 total=0.18
# split8 x 100 times: min=0.00064 max=0.00079 avg=0.00066 total=0.66
# split9 x 100 times: min=0.00013 max=0.0002 avg=0.00014 total=0.14
# Using partition for split0 - split2
# split0 x 100 times: min=0.00013 max=0.00022 avg=0.00013 total=0.13
# split1 x 100 times: min=0.00015 max=0.00023 avg=0.00015 total=0.15
# split2 x 100 times: min=0.00033 max=0.00046 avg=0.00034 total=0.34
# split3 x 100 times: min=0.00011 max=0.00015 avg=0.00011 total=0.11
# split4 x 100 times: min=0.00032 max=0.00062 avg=0.00033 total=0.33
# split5 x 100 times: min=0.00031 max=0.00041 avg=0.00033 total=0.33
# split6 x 100 times: min=0.00031 max=0.00054 avg=0.00033 total=0.33
# split7 x 100 times: min=0.00017 max=0.00046 avg=0.00019 total=0.19
# split8 x 100 times: min=0.00063 max=0.00099 avg=0.00066 total=0.66
# split9 x 100 times: min=0.00013 max=0.00019 avg=0.00014 total=0.14
# Changed iter_dir from playground (no spaces in filenames) to Downloads
# split0 x 100 times: min=0.0033 max=0.0036 avg=0.0033 total=0.33
# split1 x 100 times: min=0.0038 max=0.0043 avg=0.0039 total=0.39
# split2 x 100 times: min=0.0092 max=0.01 avg=0.0093 total=0.93
# split3 x 100 times: min=0.0047 max=0.0052 avg=0.0048 total=0.48
# split4 x 100 times: min=0.0061 max=0.007 avg=0.0064 total=0.64
# split5 x 100 times: min=0.012 max=0.012 avg=0.012 total=1.2
# split6 x 100 times: min=0.0061 max=0.0073 avg=0.0063 total=0.63
# split7 x 100 times: min=0.0061 max=0.0072 avg=0.0062 total=0.62
# split8 x 100 times: min=0.0054 max=0.0063 avg=0.0056 total=0.56
# split9 x 100 times: min=0.0052 max=0.0055 avg=0.0053 total=0.53

# 2018-09-21 16:55:55 #
from fnmatch import fnmatch, filter as fnfilter
from os import walk as oswalk
from time_this import time_this
import re

# also test iter_dir with: pattern=regular expression
#                          pattern=fnmatch
#                          pattern=fnfilter
# 
# re is close second @ 0.026 using re.compile(r'^(?=.+py$).*', re.I) & match
#                                  re.compile(r'py$', re.I) & search
# fastest is consistently fnfilter, but @ 0.022-0.023 is barely worth it
# 
# then test if it is faster to: yield in for loop
#                               yield from gen exp
#                               append to local list and return
#                               extend local list and return

@time_this(10)
def iterdir_regexp(pattern):
    yield from filter(pattern.search,
               (f for p, d, fs in oswalk('/home/erik/Downloads') for f in fs))

@time_this(10)
def iterdir_fnmatch(pattern):
    yield from (f for p, d, fs in oswalk('/home/erik/Downloads')
                  for f in fs if fnmatch(f, pattern))

@time_this(10)
def iterdir_fnfilter(pattern):
    return fnfilter([f for p, d, fs in oswalk('/home/erik/Downloads') for f in fs],
                    pattern)

rx = re.compile(r'py$', re.I)
iterdir_regexp(rx)
iterdir_fnmatch('*.py')
iterdir_fnfilter('*.py')

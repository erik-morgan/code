# 2018-09-21 22:11:32 #
from timeit import default_timer as timer
from inspect import isgeneratorfunction as isgenfunc

def time_this(passes=1000):
    def wrapper(fn):
        def wrapped(*args, **kwargs):
            def gen_wrapper(*args, **kwargs):
                return list(fn(*args, **kwargs))
            f = gen_wrapper if isgenfunc(fn) else fn
            times = []
            for n in range(passes):
                tbeg = timer()
                result = f(*args, **kwargs)
                tend = timer()
                times.append(tend - tbeg)
            print(f'{fn.__name__} x {passes} times: min={min(times):.2} '
                  f'max={max(times):.2} avg={sum(times)/len(times):.2} '
                  f'total={sum(times):.2}')
            if isinstance(result, (list, tuple, set, dict)):
                print(f'result: {len(result)}')
            return result
        return wrapped
    return wrapper

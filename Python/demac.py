#!/bin/python
import os
import fnmatch

def main():
    if os.path.exists('/run/media/erik'):
        for path, dnames, fnames in os.walk('/run/media/erik', False):
            fpaths = (os.path.join(path, f) for f in fnames)
            for fpath in fpaths:
                if fnmatch.fnmatch(fpath, '/run/media/erik/*/.*'):
                    os.remove(fpath)
            if fnmatch.fnmatch(path, '/run/media/erik/*/.*'):
                os.rmdir(path)

if __name__ == '__main__':
    main()
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

def fixTimes(parentPath):
    for entry in os.scandir(parentPath):
        statInfo = entry.stat()
        os.utime(entry.path, 
                 (statInfo.st_atime + 18000, statInfo.st_mtime + 18000))
        if entry.is_dir():
            fixTimes(entry.path)

if __name__ == '__main__':
    main()
    fixTimes('/run/media/erik')
#!/bin/python
import sh
from pathlib import Path

root = Path.home() / 'build'
preBuild = [d for d in root.iterdir() if d.is_dir()]
sh.cower('-duf')
buildList = [d for d in root.iterdir() if d.is_dir()]
for pacdir in buildList:
    if pacdir not in preBuild:
        sh.cd(str(pacdir.resolve()))
        sh.makepkg(sh.yes(_piped=True), '-sic', _fg=True)
        sh.rm('-rf', sh.glob('..?*'), sh.glob('.[!.]*'), sh.glob('*'))
        sh.cd('..')
        pacdir.rmdir()

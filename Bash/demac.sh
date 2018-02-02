#!/bin/bash

cd '/run/media/erik/IT_DOCS'
find . -type f -name '.?*' -delete
rm -rf .??*

# script_path="$(dirname "${BASH_SOURCE[0]}")"

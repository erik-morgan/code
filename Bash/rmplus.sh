#!/bin/bash

ask () {
    local target="$1"
    until [[ $ans == y ]] || [[ $ans == n ]]; do
        read -n 1 -p "Are you sure you want to delete everthing in $target (y/n)?" ans
    done
    if [[ $ans = 'y' ]]; then
        cd "$target"
        rm -rf ..?* .[!.]* *
    else
        exit 1
    fi
}

if [[ $# -eq 0 ]]; then
    ask "$(pwd)"
elif [[ $# -eq 1 ]]; then
    if [[ -e "$1" && -d "$1" ]]; then
        ask "$1"
    else
        echo "$1 is not a valid target. Must be an existing directory"
        exit 1
    fi
else
    echo "You can only include one target directory. Check for whitespace."
    exit 1
fi
#!/bin/bash

json=''

pacinstall () {
    local pacname="$1"
    echo "Installing ${pacname}..."
    if [[ ! $(pwd) = '/home/erik/build' ]]; then
        cd '/home/erik/build'
    fi
    rm -rf ..?* .[!.]* *
    git clone "https://aur.archlinux.org/$pacname.git" .
    yes | sudo -u erik makepkg -sirc --needed
}

pacselect () {
    read -rd '\n' -a options < <(echo "$json" | jq -r '.results | .[] | .Name')
    echo 'Select packages to install using spaced numbers:'
    local lim="${#options[@]}"
    for ((i=0; i <= lim; i++)); do
        echo "$i) ${options[i]}"
    done
    read -rd ' ' -a nums -p 'Enter package numbers: '
    for num in $nums; do
        pacinstall "${options[num]}"
    done
}

pacsearch () {
    json="$(curl -G -H "Accept: application/json" -d "v=5&type=search&by=name&arg=$1" "https://aur.archlinux.org/rpc/")"
    local rescnt=$(echo "$json" | jq -r .resultcount)
    if [[ $rescnt -eq 1 ]]; then
        local pacname="$(echo "$json" | jq -r .results[0].Name)"
        echo "Found 1 package: $pacname"
        read -n 1 -p 'Do you want to install it (y/n): ' ans
        until [[ $ans = 'y' ]] || [[ $ans = 'n' ]]; do
            read -n 1 -p 'Do you want to install it (y/n): ' ans
        done
        if [[ $ans = 'y' ]]; then
            pacinstall "$pacname"
        else
            exit 1
        fi
    else
        pacselect
    fi
}

cd "/home/erik/build"
rm -rf ..?* .[!.]* *
if [[ -z "$1" ]]; then
    echo "No package name provided!"
    exit 1
elif [[ $# -gt 1 ]]; do
    echo "There is more than 1 argument."
    echo "You can only search for one package at a time."
    exit 1
else
    pacsearch "$1"
fi
rm -rf ..?* .[!.]* *
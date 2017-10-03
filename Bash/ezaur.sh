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

pactest () {
	local json="$(curl -G -H "Accept: application/json" -d "v=5&type=info&arg=$1" "https://aur.archlinux.org/rpc/")"
	local rescnt=$(echo "$json" | jq -r .resultcount)
	if [[ $rescnt -eq 1 ]]; then
		return 0
	else
		return 1
	fi
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
        until [[ $ans == y ]] || [[ $ans == n ]]; do
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

showhelp () {
	echo "
This script has the following options:
  -i aur1 [aur2 aur3...]
     This option installs AUR packages with exact
     package names aur1, aur2, aur3, and so on. It
     will not search for them, so incorrect or
     non-existent packages will be skipped.
  -s aur1
     This option searches the AUR for package names
     containing the string in aur1. Matching AUR
     packages will be listed, allowing you to pick
     one to be installed.
  -u
     This option updates all installed AUR packages.

Currently, you can only use one option at a time.
"
}

cd "/home/erik/build"
rm -rf ..?* .[!.]* *
failures=()
if [[ $# -eq 0 ]]; then
	echo "No arguments provided!"
	showhelp
	exit 1
elif [[ $# -eq 1 ]]; then
	if [[ "$1" == "-u" ]]; then
		aurupdate
	else
		echo "Only one option provided, and it wasn't -u"
		showhelp
		exit 1
	fi
else
	if [[ "$1" == "-s" ]]; then
		shift
		pacsearch "$1"
	elif [[ "$1" == "-i" ]]; then
		shift
		until [[ -z "$1" ]]; do
			pactest "$1"
			if [[ $? -eq 0 ]]; then
				pacinstall "$1"
			else
				failures+=("$1")
			fi
			shift
		done
	else
		echo "You suck, try again."
		showhelp
		exit 1
	fi
fi
rm -rf ..?* .[!.]* *

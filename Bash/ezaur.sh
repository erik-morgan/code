#!/bin/bash

pactest () {
	local json="$(curl -G -H "Accept: application/json" -d "v=5&type=info&arg=$1" "https://aur.archlinux.org/rpc/")"
	local retnum=$(echo "$json" | jq -r .resultcount)
	if [[ $retnum -eq 0 ]]; then
		return 1
	else
		return 0
	fi
}

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
	local pacquery="$1"
	echo "No packages called $pacquery. Searching AUR..."
	local json="$(curl -G -H "Accept: application/json" -d "v=5&type=search&by=name&arg=$pacquery" "https://aur.archlinux.org/rpc/")"
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

cd "/home/erik/build"
rm -rf ..?* .[!.]* *
if [[ -z "$1" ]]; then
	echo "No package name provided!"
	exit 1
else
	until [[ -z "$1" ]]; do
		pactest "$1"
		if [[ $? -eq 0 ]]; then
			pacinstall "$1"
		else
			pacselect "$1"
		shift
	done
fi
rm -rf ..?* .[!.]* *

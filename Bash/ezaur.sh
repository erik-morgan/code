#!/bin/bash

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

failures=()
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
			failures+=("$1")
		fi
		shift
	done
	if [[ ${#failures[@]} -eq 0 ]]; then
		echo "All packages were successfully installed!"
	else
		echo "Failed to install the following packages:"
		for fail in "${failures[@]}"; do
			echo "$fail"
		done
	fi
fi
rm -rf ..?* .[!.]* *

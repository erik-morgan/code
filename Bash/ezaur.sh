#!/bin/bash

cd "/home/erik/build"
pacquery="$1"

echo "There is more than 1 package containing the name: ${pacquery}."
echo "Select which package you want to install:"

json="$(curl -G -H "Accept: application/json" -d "v=5&type=search&by=name&arg=$pacquery" "https://aur.archlinux.org/rpc/")"
read -rd '\n' -a options < <(echo "$json" | jq -r '.results | .[] | .Name')

COLUMNS=12
PS3="Choose a package: "

select opt in "${options[@]}"; do
	echo "Installing package $opt from the AUR..."
	cd "/home/erik/build"
	rm -rf ..?* .[!.]* *
	git clone "https://aur.archlinux.org/$opt.git" .
	yes | sudo -u erik makepkg -sirc --needed
	break
done

rm -rf ..?* .[!.]* *

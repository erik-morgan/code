#!/bin/bash
set -e

logfile="/home/erik/scripts/AUR/update-logs/$(date +%F_%T)"

exec > >(tee "$logfile") 2>&1

builds='/home/erik/builds'
cd "$builds"
paclist="$(pacman -Qm)"

echo -e "pacname\t\tpacver\t\taurver"

while read -r line; do
	read -r pacname pacver <<< "$line"
	aurver=$(curl -s -G -d"v=5&type=info&arg[]=$pacname" 'https://aur.archlinux.org/rpc/' | grep -E -o 'Version":"[^"]+' | cut -d'"' -f3)
	echo -e "${pacname}\t\t${pacver}\t\t${aurver}"
	if [[ ! "$aurver" == "$pacver" ]]; then
		rm -rf ..?* .[!.]* *
		git clone "https://aur.archlinux.org/${pacname}.git" .
		yes | sudo -u erik makepkg -sirc --needed && echo "$pacname has been updated!"
		rm -rf ..?* .[!.]* *
	else
		echo "$pacname is up to date!"
	fi
done <<< "$paclist"

set +e
#!/bin/bash

cd "/home/erik/builds"

for aururl in "$@"; do
	rm -rf ..?* .[!.]* *
	git clone "$aururl" .
	yes | sudo -u erik makepkg -sirc --needed
done

rm -rf ..?* .[!.]* *
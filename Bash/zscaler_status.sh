#!/bin/sh
#
# Jamf EA to determine Zscaler logged in status
# 
# 

## IF Zscaler is installed the check for the zstatus file in both places

ztinfo=/Applications/Zscaler/Zscaler.app/Contents/Info.plist

if [[ -f "$ztinfo" ]]; then
	zversion=$(defaults read $ztinfo CFBundleShortVersionString)
	
	if [[ $zversion=3.2* ]]; then
		ztstatus=(/private/var/log/zscaler/ztstatus*)
	else
		ztstatus=(/Library/Application\ Support/zscaler/ztstatus*)
	fi
	
	if [[ -f "$ztstatus" ]]; then
		echo "<result>Logged In</result>"
	else
		echo "<result>Not Logged In</result>"
	fi

else
	echo "<result>Not Installed</result>"  
fi
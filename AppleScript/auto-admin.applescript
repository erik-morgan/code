on adding folder items to thisFolder after receiving addedItems
	repeat with addedItem in addedItems
		tell application "Finder"
			my packMaster(POSIX path of addedItem)
			--my sendToLaura(name of addedItem)
		end tell
	end repeat
end adding folder items to

on packMaster(folderPath)
	tell application "System Events"
		if class of (disk item folderPath) is folder then
			set projectFolder to folder folderPath
			set thisName to (name of projectFolder)
			set targetFolder to "/Users/HD6904/Desktop/Digital SM Bank/" & thisName
			do shell script ("mkdir '" & targetFolder & "'")
			set copyList to {}
			set end of copyList to (POSIX path of (folder "Orders" of projectFolder))
			set end of copyList to (POSIX path of (folder "Outlines" of projectFolder))
			set smID to (find text "^\\d{4}( V\\d| R\\d)?( V\\d| R\\d)?" in thisName with regexp and string result)
			set end of copyList to (POSIX path of (item 1 of (get files of folder ":Users:HD6904:Public:Erik's Dropbox:~ Recent Manuals:" whose name begins with smID)))
			repeat with copyItem in copyList
				do shell script ("cp -a '" & copyItem & "' '" & targetFolder & "'")
			end repeat
			do shell script ("cp -a '" & targetFolder & "' '/Volumes/share/SERVICE/DXF Files/Laura'")
		end if
	end tell
end packMaster

on sendToLaura(targetName)
	tell application "Microsoft Outlook"
		set newMessage to make new outgoing message with properties {subject:"New library folder ready!", content:"Folder " & targetName & " is now in DXF Files/Laura."}
		make new recipient at newMessage with properties {email address:{name:"Laura Marin", address:"laura_marin@dril-quip.com"}}
		send newMessage
	end tell
end sendToLaura
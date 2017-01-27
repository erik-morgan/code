--set AppleScript's text item delimiters to " "
tell application "Finder"
	set root to alias "/Users/ErikML/Public/Final PageMaker Folder"
	set folderList to (folders of entire contents of root) as alias list
	repeat with aFolder in folderList
		set fileList to (files of entire contents of aFolder whose name extension is "p65") as alias list
		repeat with aFile in fileList
			set fileName to name of aFile
			if (characters -7 thru -1 of fileName) as string is "p65.p65" then
				set name of aFile to (characters 1 thru -5 of fileName) as string
			end if
			(*
			set extension hidden of aFile to false
			set fileName to name of aFile as text
			set splitName to text items of fileName
			try
				set newName to ((item 1 of splitName) & ".p65")
				set name of aFile to newName
			on error
				try
					set newName to ((item 1 of splitName) & "_2.p65")
					set name of aFile to newName
				on error
					set newName to ((item 1 of splitName) & "_3.p65")
					set name of aFile to newName
				end try
			end try
			--if name extension of aFile is not "p65" then set name of aFile to (newName & ".p65")
*)
		end repeat
	end repeat
end tell
--set AppleScript's text item delimiters to ""
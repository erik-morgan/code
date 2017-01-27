tell application "Finder"
	set root to alias "/Users/ErikML/Public/Final PageMaker Folder"
	set folderList to (folders of entire contents of root) as alias list
	repeat with aFolder in folderList
		set logText to ""
		set fileList to (files of entire contents of aFolder whose name extension is "p65") as alias list
		repeat with aFile in fileList
			--try
			set logText to logText & (name of aFile) & return
			tell application "Adobe® PageMaker® 6.5"
				«event misceval» ("Open \"" & (aFile as text) & "\"")
				set fileLinks to «event misceval» ("GetLinks")
				«event misceval» ("Close")
			end tell
			set logText to logText & fileLinks & return
			(*
			on error
				tell application "Adobe® PageMaker® 6.5" to set numOpen to evaluate ("GetPubWindows")
				set AppleScript's text item delimiter to ","
				set numOpen to text items of numOpen
				if (item 1 of numOpen) as number is greater than 0 then
					tell application "Adobe® PageMaker® 6.5" to set numOpen to evaluate ("Close")
				end if
			end try
			*)
		end repeat
		make file at aFolder with properties {name:((name of aFolder) & ".txt")}
		set logFile to open for access (((aFolder as text) & (name of aFolder) & ".txt") as alias) with write permission
		write logText to logFile starting at eof
		close access logFile
	end repeat
end tell
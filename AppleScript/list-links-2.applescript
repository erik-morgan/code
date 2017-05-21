tell application "Finder"
	set root to ":Users:ErikML:Public:links-list:"
	set linkList to {}
	set theFiles to (files of entire contents of alias root whose name extension is "p65") as alias list
	repeat with theFile in theFiles
		try
			tell application "Adobe¨ PageMaker¨ 6.5" to evaluate ("Open \"" & (theFile as text) & "\"")
			set logText to name of theFile & tab
		on error
			move theFile to alias (root & "broken:")
		end try
		try
			tell application "Adobe¨ PageMaker¨ 6.5" to set logText to (logText & evaluate ("GetLinks"))
			tell application "Adobe¨ PageMaker¨ 6.5" to evaluate ("Close")
		on error
			move theFile to alias (root & "error:")
		end try
		tell application "Adobe¨ PageMaker¨ 6.5" to evaluate ("Close")
		set end of linkList to (logText)
	end repeat
	make file at alias root with properties {name:"links-list.txt"}
	set logFile to open for access alias (root & "links-list.txt") with write permission
	set AppleScript's text item delimiters to return
	write (linkList as string) to logFile starting at eof
	set AppleScript's text item delimiters to ""
	close access logFile
end tell
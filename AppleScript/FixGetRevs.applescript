set drawRevs to {}

tell application "Microsoft Excel"
	tell sheet "Sheet1" to tell used range to set drawURLS to value of cell "E1:E5"
end tell

repeat with i from 1 to (length of drawURLS)
	log (item i of drawURLS)
	if length of ((item i of drawURLS) as string) is not 0 then
		set cmd to "curl --anyauth -u morganel:Password17 " & (item i of drawURLS)
		set drawSource to do shell script cmd
		set drawRev to find text "(?<=RevisionNum\">)(.{1,2})(?=</span>)" in drawSource with regexp
		if (matchResult of drawRev) is "NR" then
			copy "NC" to end of drawRevs
		else
			copy (matchResult of drawRev) to end of drawRevs
		end if
	else
		copy "-" to end of drawRevs
	end if
	log (item i of drawRevs)
end repeat

tell application "Microsoft Excel"
	tell sheet "Sheet2"
		set value of cell "A1" to join {drawRevs, "\n"}
	end tell
end tell

on join {separateList, delim}
	set AppleScript's text item delimiters to delim
	set joinedList to separateList as string
	set AppleScript's text item delimiters to ""
	return joinedList
end join
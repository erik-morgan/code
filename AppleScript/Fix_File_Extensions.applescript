set root to ":Users:HD6904:Desktop:House Cleaning:Michael:Contents:"
tell script "getContents" to set fileList to getContents(root, true)
tell application "System Events"
	repeat with thisFile in fileList
		try
			set thisName to (name of thisFile)
			if "." is not in (characters -4 through -1 of thisName) then
				set AppleScript's text item delimiters to "."
				set ext to (item -1 of (text items of thisName))
				if ((name extension of thisFile) is "") or (ext is not in {"ai", "eps", "doc", "p65", "pdf", "xls", "xlsx"}) then
					set fileKind to (kind of thisFile)
					if fileKind contains "Illustrator" then
						set name of thisFile to (name of thisFile & ".ai")
					else if fileKind contains "Encapsulated" then
						set name of thisFile to (name of thisFile & ".eps")
					else if fileKind contains "Word" then
						set name of thisFile to (name of thisFile & ".doc")
					else if fileKind contains "InDesign" then
						set name of thisFile to (name of thisFile & ".p65")
					else if fileKind contains "PDF" then
						set name of thisFile to (name of thisFile & ".pdf")
					else if fileKind contains "Worksheet" then
						set name of thisFile to (name of thisFile & ".xls")
					else if fileKind contains "Spreadsheet" then
						set name of thisFile to (name of thisFile & ".xlsx")
					end if
				end if
				set AppleScript's text item delimiters to ""
			end if
		end try
	end repeat
end tell
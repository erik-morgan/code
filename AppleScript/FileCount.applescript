tell application "Microsoft Excel"
	set folderList to (first item of (get value of used range of worksheet "FOLDER PATHS"))
	repeat with i from 1 to (count of folderList)
		log "i = " & i
		set thisFolder to ((item i of folderList) as alias)
		tell application "Finder" to set pdfCount to (count of (files of entire contents of thisFolder whose name extension is "pdf"))
		set value of (cell 1 of column i of worksheet "FILE COUNT") to pdfCount
	end repeat
end tell
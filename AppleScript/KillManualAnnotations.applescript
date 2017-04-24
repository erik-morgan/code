tell application "Microsoft Excel"
	set fileList to (first item of (get value of used range of worksheet "MANUAL NAMES"))
end tell
repeat with x from 1 to (count of fileList)
	log "x = " & x
	tell application "Adobe Acrobat Pro"
		open ((item x of fileList) as alias)
		repeat with thisPage in pages
			tell thisPage to delete annotations
		end repeat
		set pageCount to (count of pages)
		close active doc with saving
	end tell
	tell application "Microsoft Excel"
		set value of (cell 1 of column x of worksheet "SM PAGE COUNT") to pageCount
	end tell
end repeat
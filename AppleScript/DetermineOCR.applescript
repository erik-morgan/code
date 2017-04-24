global smList
set smList to {}
set ocrList to {}
set root to ((path to desktop as text) & "Digital SM Bank:")
my getFiles(root)
set smCount to count of smList
repeat with i from 1 to smCount
	log "i = " & i & "/" & smCount
	tell application "Adobe Acrobat Pro"
		open ((item i of smList) as alias)
		tell active doc
			set needsOCR to do script "isBlank();function isBlank(){for(var i=0;i<this.numPages;i++){if(this.getPageNumWords(i)<1)return true;}return false;}"
			if needsOCR is "true" then
				set end of ocrList to {((item i of smList) as text)}
			end if
		end tell
		close active doc without saving
	end tell
end repeat
tell application "Microsoft Excel"
	tell active sheet
		set value of range ("A1:A" & (count of ocrList)) to ocrList
	end tell
end tell

on getFiles(parentFolder)
	tell application "System Events"
		set itemList to (disk items of folder parentFolder)
		repeat with thisItem in itemList
			if class of thisItem is folder then
				my getFiles(path of thisItem)
			else if (name extension of thisItem) is "pdf" then
				set thisName to (name of thisItem)
				if my testName(thisName) then
					set end of smList to (path of thisItem)
				end if
			end if
		end repeat
	end tell
end getFiles

on testName(itemName)
	set theChars to characters 1 through 4 of itemName
	repeat with aChar in theChars
		try
			set aChar to aChar as number
		on error
			return false
		end try
	end repeat
	return true
end testName
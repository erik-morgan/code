on getContents(parentFolder, excludeHidden)
	set fileList to {}
	tell application "System Events"
		if excludeHidden then
			set children to items of folder parentFolder whose visible is true
		else
			set children to items of folder parentFolder
		end if
		repeat with child in children
			if (class of child) is folder then
				set fileList to (fileList & my getContents(path of child, excludeHidden))
			else
				set end of fileList to child
			end if
		end repeat
	end tell
	return fileList
end getContents
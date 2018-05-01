property dest_dir : "/Volumes/share/SERVICE/Erik Morgan/Procedures/"
property from_dir : ""

on adding folder items to thisFolder after receiving addedItems
	tell application "Finder"
		set from_dir to POSIX path of thisFolder
		repeat with addedItem in addedItems
			my file_check(POSIX path of addedItem)
		end repeat
	end tell
	my dest2dash()
end adding folder items to

on file_check(file_path)
	tell application "System Events"
		set this_item to (disk item file_path)
		if class of this_item is file then
			set item_name to name of this_item
			set item_ext to (name extension of this_item)
			if item_ext is "indd" then
				set item_path to POSIX path of this_item
				set item_path to (characters 1 thru -6 of item_path as text) & "'.[ip]*"
				set cmd to "cp -f '" & item_path & " '" & my replace(dest_dir, "'", "\\'") & "'"
				do shell script cmd
			end if
		end if
	end tell
end file_check

on dest2dash()
	tell application "System Events"
		set dest_items to (files of folder dest_dir) whose name contains "/"
		repeat with dest_item in dest_items
			set name of dest_item to (my replace(name of dest_item, "/", "-"))
		end repeat
	end tell
end dest2dash

on replace(str, old_sub, new_sub)
	set {tid, AppleScript's text item delimiters} to {AppleScript's text item delimiters, old_sub}
	set {split_str, AppleScript's text item delimiters} to {text items of str, new_sub}
	set {str, AppleScript's text item delimiters} to {split_str as text, tid}
	return str
end replace

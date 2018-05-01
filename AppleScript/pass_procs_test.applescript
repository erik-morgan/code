property dest_dir : "/Volumes/share/SERVICE/Erik Morgan/Procedures/"
property from_dir : ""
global this_folder
set this_folder to alias ":Users:HD6904:Public:Eriks Dropbox:"

tell application "Finder"
	set file_list to (files of (folder this_folder) whose name extension is "indd") as alias list
	my main_test(file_list)
end tell

on main_test(addedItems)
	tell application "Finder"
		set from_dir to POSIX path of this_folder
		repeat with addedItem in addedItems
			my file_check(POSIX path of addedItem)
		end repeat
	end tell
	my dest2dash()
end main_test

on file_check(file_path)
	tell application "System Events"
		set this_item to (disk item file_path)
		if class of this_item is file then
			set item_name to (name of this_item)
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

-- on copyTo(file_list)
-- 	tell application "System Events"
-- 		set cmd to "cp -f "
-- 		repeat with copy_file in file_list
-- 			set cmd to cmd & (copy_file & ".[ip][nd]* ")
-- 		end repeat
-- 		set cmd to cmd & (my quoted(dest_dir))
-- 		do shell script cmd
-- 	end tell
-- end copyTo

-- on quoted(txt)
-- 	if (offset of "'" in txt) is 0 then
-- 		set qtxt to "'" & txt & "'"
-- 	else
-- 		set AppleScript's text item delimiters to "'"
-- 		set txt_parts to every text item of txt
-- 		set qtxt to "'" & item 1 of txt_parts
-- 		repeat with i from 2 to (count of txt_parts)
-- 			set qtxt to qtxt & "\\'" & item i of txt_parts
-- 		end repeat
-- 		set qtxt to qtxt & "'"
-- 	end if
-- 	return qtxt
-- end quoted
tell application "Microsoft Excel"
	set numCols to (count of columns of used range of worksheet "PATHS")
	repeat with x from 1 to numCols
		log "x = " & x
		set numRows to my colCellCount(column x of worksheet "PATHS")
		repeat with y from 1 to numRows
			set thePath to value of (cell y of column x of worksheet "PATHS")
			tell application "Adobe Acrobat Pro"
				open ((thePath as text) as alias)
				tell active doc to set bmCount to (count of bookmarks)
				close active doc without saving
			end tell
			if bmCount is 0 or bmCount > 2 then
				set color of interior object of (cell y of column x of worksheet "PATHS") to {255, 0, 0}
			end if
		end repeat
	end repeat
end tell

on colCellCount(col)
	tell application "Microsoft Excel"
		return first row index of (get end (last cell of col) direction toward the top)
	end tell
end colCellCount

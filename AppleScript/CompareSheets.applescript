set colCount to 1
tell application "Microsoft Excel"
	set numCols to my rowCellCount(1, "BOOKMARKS")
	repeat with i from 1 to numCols
		set bmRows to my colCellCount(i, "BOOKMARKS")
		set pathRows to my colCellCount(i, "PATHS")
		if bmRows is equal to pathRows then
			set value of cell i of row 1 of worksheet "COMPARISON" to bmRows
		else
			tell worksheet "BOOKMARKS" to set bmVals to value of range ((get address of (cell 1 of column i)) & ":" & (get address of (cell bmRows of column i)))
			tell worksheet "PATHS" to set pathVals to value of range ((get address of (cell 1 of column i)) & ":" & (get address of (cell pathRows of column i)))
			tell worksheet "Sheet13" to set value of range ((get address of (cell 1 of column colCount)) & ":" & (get address of (cell bmRows of column colCount))) to bmVals
			set colCount to (colCount + 1)
			tell worksheet "Sheet13" to set value of range ((get address of (cell 1 of column colCount)) & ":" & (get address of (cell pathRows of column colCount))) to pathVals
			set colCount to (colCount + 2)
		end if
	end repeat
end tell

on rowCellCount(rowNum, ws)
	tell application "Microsoft Excel"
		tell worksheet ws
			return first column index of (get end (last cell of row rowNum) direction toward the left)
		end tell
	end tell
end rowCellCount

on colCellCount(colNum, ws)
	tell application "Microsoft Excel"
		tell worksheet ws
			return first row index of (get end (last cell of column colNum) direction toward the top)
		end tell
	end tell
end colCellCount

on numToLetters(colNum)
	set colName to {}
	set dividend to colNum
	repeat while dividend > 0
		set modulo to ((dividend - 1) mod 26)
		set end of colName to ASCII character (65 + modulo)
		set dividend to ((dividend - modulo) div 26)
	end repeat
	return reverse of colName as text
end numToLetters
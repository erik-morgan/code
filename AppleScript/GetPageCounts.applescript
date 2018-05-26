tell application "Microsoft Excel"
    set numCols to (count of columns of used range of worksheet "PATHS")
    repeat with x from 1 to numCols
        log "x = " & x
        set numRows to my colCellCount(column x of worksheet "PATHS")
        repeat with y from 1 to numRows
            set thePath to value of (cell y of column x of worksheet "PATHS")
            tell application "Adobe Acrobat Pro"
                open ((thePath as text) as alias)
                set pageCount to (count of pages of active doc)
                if (name of active doc) is not "BIGTOC.pdf" and (name of active doc) is not "SS15TOC.pdf" then
                    tell active doc
                        set bms to {}
                        repeat with i from 1 to (count of bookmarks)
                            set beginning of bms to (name of (bookmark i))
                        end repeat
                        delete bookmarks
                        repeat with i from 1 to (count of bms)
                            make new bookmark with properties {name:(item i of bms), destination page number:1, fit type:fit page}
                        end repeat
                        close with saving
                    end tell
                else
                    close active doc without saving
                end if
            end tell
            set value of (cell y of column x of worksheet "PAGE COUNT") to pageCount
        end repeat
    end repeat
end tell

on colCellCount(col)
    tell application "Microsoft Excel"
        return first row index of (get end (last cell of col) direction toward the top)
    end tell
end colCellCount
set pathList to {}
set bmList to {}

tell application "Microsoft Excel"
    tell active sheet
        repeat with i from 1 to (count of rows of used range)
            set end of pathList to value of (cell i of column 1)
            set end of bmList to value of (cell i of column 2)
        end repeat
    end tell
end tell

set pathNum to (count of pathList)

repeat with x from 1 to pathNum
    log (x & "/" & pathNum)
    tell application "Adobe Acrobat Pro"
        open ((item x of pathList) as alias)
        tell active doc
            delete bookmarks
            set js to "var bmString='" & (item x of bmList) & "';bmArray=bmString.split('|');makeBookmarks(this.bookmarkRoot,0);"
            set js to js & "function makeBookmarks(bmParent,cnt){bmParent.createChild(bmArray[cnt]);cnt += 1;if(cnt==bmArray.length){return;}else{makeBookmarks(bmParent.children[0],cnt);}}"
            do script (js as text)
        end tell
        close active doc with saving
    end tell
end repeat
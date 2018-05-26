tell application "System Events"
    set rootAlias to "HD6904:Users:HD6904:Desktop:Drawings:Assembly Drawings:" as alias
    set dirList to (get the name of (every item of rootAlias whose name does not start with "."))
    repeat with x from 1 to (length of dirList)
        set dir to ((rootAlias as text) & (item x of dirList) & ":") as alias
        set docList to (name of (every item of dir whose name does not start with "."))
        repeat with y from 1 to (length of docList)
            try
                set doc to alias ((dir as text) & (item y of docList))
                set AppleScript's text item delimiters to "."
                set nameText to text items of (change "(.+)\\.pdf" in ((item y of docList) as string) into "\\1" with regexp)
                set AppleScript's text item delimiters to {""}
                if (length of nameText) is 2 then
                    set js to "this.info.Revision = '" & (item 2 of nameText) & "'"
                else if (length of nameText) is 3 then
                    set js to "this.info.DrawingRevision = '" & (item 2 of nameText) & "'\n"
                    set js to js & "this.info.SpecSheetRevision = '" & (item 3 of nameText) & "'"
                end if
                tell application "Adobe Acrobat Pro"
                    open doc
                    do script js
                    close active doc saving yes
                end tell
            on error
                log ((item y of docList) as string)
            end try
        end repeat
    end repeat
end tell

(*
            log (revs)
            log ("item 1 of revs = " & (item 1 of revs))
            log ("item 1 of (item 1 of revs) = " & (item 1 of (item 1 of revs)))
            log ("item 2 of (item 1 of revs) = " & (item 2 of (item 1 of revs)))
            log ("item 2 of revs = " & (item 2 of revs))
            log ("item 1 of (item 2 of revs) = " & (item 1 of (item 2 of revs)))
            log ("item 2 of (item 2 of revs) = " & (item 2 of (item 2 of revs)))
*)
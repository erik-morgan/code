set procList to {}
tell application "Microsoft Excel"
    set tocList to (first item of (get value of used range of worksheet "Sheet5"))
    repeat with i from 1 to (count of tocList)
        tell application "Adobe Acrobat Pro"
            open ((item i of tocList) as alias)
            tell active doc
                delete bookmarks
                set introPg to ((count of pages) - 1)
                make new bookmark with properties {name:"INTRODUCTION", destination page number:introPg, fit type:fit page}
                make new bookmark with properties {name:"TABLE OF CONTENTS", destination page number:3, fit type:fit page}
            end tell
            close active doc with saving
        end tell
    end repeat
end tell
#!/usr/bin/env osascript

on run (scriptArgs)
    tell application id "com.adobe.indesign"
        if count of scriptArgs = 1 then
            do script (quoted form of item 1 of scriptArgs) language javascript
        else
            do script (POSIX file (item 1 of scriptArgs) as alias) language javascript with arguments (rest of scriptArgs)
        end if
    end tell
end run

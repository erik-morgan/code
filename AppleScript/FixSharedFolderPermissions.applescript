on adding folder items to thisFolder after receiving addedItems
    set u to long user name of (system info)
    set p to ""
    repeat with thisItem in addedItems
        set itemPath to quoted form of POSIX path of thisItem
        do shell script ("sudo chown -R $(whoami):staff " & itemPath) user name u password p with administrator privileges
        do shell script ("sudo chmod -R 755 " & itemPath) user name u password p with administrator privileges
    end repeat
    --  do shell script ("chmod -R 777 \"" & POSIX path of thisFolder & "\"") user name u password p with administrator privileges
end adding folder items to
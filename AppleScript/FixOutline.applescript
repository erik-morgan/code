--on fixOutline
tell application "Microsoft Word"
	tell active document
		set theSystem to content of text object of paragraph 1
		set tabPosition to my getOffset(tab, theSystem)
		set systemName to characters 1 thru ((my getOffset(tab, theSystem)) - 1) of theSystem as string
		set content of text object of paragraph 1 to systemName & return
		set theCustomer to content of text object of paragraph 2
		set p1 to my getOffset("(", theCustomer)
		set p2 to my getOffset(")", theCustomer)
		set customerName to characters 11 thru (p1 - 1) as string
		set content of text object of paragraph 2 to customerName & return
		set projectName to text (p1 + 1) thru (p2 - 1) of theCustomer
		set theRig to content of text object of paragraph 3
		set content of text object of paragraph 3 to items 3 thru -1 of theRig
		set content of text object of paragraph 4 to projectName & return
	end tell
end tell
--end fixOutline

on getOffset(subString, mainString)
	return (offset of subString in mainString)
end getOffset
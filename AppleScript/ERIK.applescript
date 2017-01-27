set outlineFile to choose file with prompt "Select an Outline in Microsoft Word:" of type {"DOC", "DOCX"} default location (path to public folder)
tell application "Microsoft Word"
	open outlineFile
	tell active document
		repeat with l from 1 to (count of paragraphs)
			set thisLine to text object of paragraph l
			if (name of font object of text object of thisLine is "Tekton Pro") then
				repeat with d from (l + 1) to (count of paragraphs)
					set nextLine to text object of paragraph d
					set isBold to bold of font object of nextLine
					set isUnderline to underline of font object of nextLine
					if (isBold is false) and (isUnderline is "underline none") then
						
					end if
				end repeat
			end if
		end repeat
	end tell
end tell
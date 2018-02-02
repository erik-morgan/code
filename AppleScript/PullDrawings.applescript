set partsLists to {"2-413954-02", "2-413955-02", "2-414004-02", "2-415077-02", "2-500468-02", "2-503047-02", "2-503512-03", "2-503652-02", "2-503878-03", "2-504414-02", "2-504414-03", "2-504414-04", "2-504414-05", "2-504414-06", "2-504414-07", "2-504414-08", "2-504446-02", "2-504453-02", "2-504481-02", "2-504481-03", "2-504680-02", "2-504680-02", "2-608727-02", "2-608728-02", "2-608879-02", "2-608884-02", "2-608885-02", "2-608886-02", "2-608887-02", "2-608888-02", "2-608913-02", "2-608921-02", "2-609122-02", "2-609154-02", "2-609214-02", "2-609593-02", "2-610083-02", "2-610114-02", "2-610115-02", "2-905093-04", "4-502395-02", "4-502477-02", "6-501808-04", "6-501808-04", "6-502255-02", "6-502263-02", "6-502428-02", "6-502481-02", "6-700307-02"}
set baseURL to "http://houston/ErpWeb/PartDetails.aspx?PartNumber="

repeat with i from 3 to 49
    set webPage to baseURL & item i of partsLists
    tell application "Safari"
        set URL of document 1 to webPage
        set isLoaded to false
        repeat while isLoaded is false
            set readyState to (do JavaScript "document.readyState" in document 1)
            if (readyState is "complete") then
                set isLoaded to true
            end if
            delay 3
        end repeat
        -- do JavaScript "document.getElementById('viewSpecLink')[0].click();" in document 1
        do JavaScript "document.getElementsByName('documentLink')[0].click();" in document 1
    end tell
end repeat
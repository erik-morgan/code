function findChangeGrep(findPrefs, changePrefs, findChangeOptions){
    app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
    if (findChangeOptions !== undefined){
        app.findChangeGrepOptions.properties = findChangeOptions;
    }
    app.findGrepPreferences.properties = findPrefs;
    if (changePrefs == undefined){
        return doc.findGrep();
    }
    else {
        app.changeGrepPreferences.properties = changePrefs;
        doc.changeGrep();
    }
}
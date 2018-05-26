function bmToText(){
    var bmRoot = this.bookmarkRoot;
    var bmNames = [], bmLevels = [], count;
    count = 0;
    for (var i = 0; i < bmRoot.children.length; i++){
        var bm1 = bmRoot.children[i];
        bmLevels[count] = 0;
        bmNames[count] = bm1.name;
        count+=1;
        for (var j = 0; j < (bm1.children.length; j++){
            var bm2 = bm1.children[j];
            bmLevels[count] = 1;
            bmNames[count] = bm2.name;
            count+=1;
            for (var k = 0; k < (bm2.children.length; k++{
                var bm3 = bm2.children[k];
                bmLevels[count] = 2;
                bmNames[count] = bm3.name;
                count+=1;
                for (var m = 0; m < bm3.children.length; m++){
                    var bm4 = bm3.children[m];
                    bmLevels[count] = 3;
                    bmNames[count] = bm4.name;
                    count+=1;
                    for (var n = 0; n < bm4.children.length; n++){
                        var bm5 = bm4.children[n];
                        bmLevels[count] = 4;
                        bmNames[count] = bm5.name;
                        count+=1;
                        for (var p = 0; p < bm5.children.length; p++){
                            var bm6 = bm5.children[p];
                            bmLevels[count] = 5;
                            bmNames[count] = bm6.name;
                            count+=1;
                        }
                    }
                }
            }
        }
    }
    var filePath = "/c/Users/Erik/Desktop/File\ Structure/Active\ Files/A+/Bookmarks.txt";
    var bmLog = new File(filePath);
    var bmLogFile = filePath.open("w", undefined, undefined);
    bmLogFile.encoding = "UTF-8";
    bmLogFile.lineFeed = "Windows";
    for (var x = 0; x < bmNames.length; x++){
        tempString = bmNames[x];
        for (y = 0; y < bmLevels[x]; y++){
            tempString = "\t" & tempString;
        }
        bmLogFile.writeln(tempString & "\n");
    }
    bmLogFile.close();
}
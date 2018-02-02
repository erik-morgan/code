var testNum = 0;
var verticalGuides = [54, 162, 180, 209.55, 306, 360, 540, 684, 792, 810, 839.8, 918, 990, 1170];

var testAnswer = closest(testNum, verticalGuides);
$.writeln(testAnswer);

function closest(n, nArray){
    var answer = nArray[0];
    for (i = 1; i < nArray.length; i++){
        if (Math.abs(n - nArray[i]) < Math.abs(n - answer)){
            answer = nArray[i];
        }
    }
    return answer;
}
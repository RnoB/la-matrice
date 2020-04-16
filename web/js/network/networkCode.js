

var homeFolder = "/home/ubuntu/";
var networkCodePath = homeFolder+"la-matrice/web/data/networkCode.csv";

var result = $.csv.toArrays(networkPath);
console.log(result);
var elems = {};
for (var i = 0; i < result.length; i++)
{
    elems[result[i].name] = result[i].label;
}
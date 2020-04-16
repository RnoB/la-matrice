

var homeFolder = "/home/ubuntu/";
var networkCodePath = homeFolder+"la-matrice/web/data/networkCode.csv";

text = readTextFile(networkCodePath);
print(text);
var elems = {};
for (var i = 0; i < result.length; i++)
{
    elems[result[i].name] = result[i].label;
}


function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                alert(allText);
            }
        }
    }
    rawFile.send(null);
}
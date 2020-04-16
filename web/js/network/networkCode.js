


var networkCodePath = "./networkCode.csv";

fetch(networkCodePath)
  .then(response => response.text())
  .then(text => console.log(text));

print(text);
var elems = {};
for (var i = 0; i < result.length; i++)
{
    elems[result[i].name] = result[i].label;
}



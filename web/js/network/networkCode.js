


var networkCodePath = "./networkCode.csv";
var data;
fetch(networkCodePath)
  .then(response => response.text())
  .then(text => data = text);

console.log(data);
var elems = {};
for (var i = 0; i < result.length; i++)
{
    elems[result[i].name] = result[i].label;
}



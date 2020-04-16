


var networkCodePath = "./networkCode.csv";
var data;
fetch(networkCodePath)
  .then(response => response.text())
  .then(text => data = text);
var networkCode = {};
console.log(data);
var lines = data.split("\n");
for (var line of lines)
{	
	var elements = line.split(",");

	if(elements[0].length !==0)
	{
		console.log(!(elements[0].length !==0));
		console.log(elements[0]);
    	networkCode[elements[0]] = parseInt(elements[1]);
	}

}
console.log(networkCode);


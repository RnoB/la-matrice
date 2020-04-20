


function getNetworkCode(path)
{
    var allText
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", path, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                allText = rawFile.responseText;
                
            }
        }
    }
    rawFile.send(null);



    var networkCode = {};

    var lines = allText.split("\n");
    for (var line of lines)
    {   
        var elements = line.split(",");

        if(elements[0].length !==0)
        {

            networkCode[elements[0]] = parseInt(elements[1]);
        }

    }

    return networkCode

}
export function getCodes()
{
	var networkCode = getNetworkCode("./networkCode.csv");
	var objectsType = getNetworkCode("./objectType.csv");
	return [networkCode,objectsType];
}

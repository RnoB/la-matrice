

homeFolder = "/home/ubuntu/";
networkCodePath = homeFolder+"la-matrice/web/data/networkCode.csv";

(function () {
  var fileInput = document.querySelector('#file');
  var reader = new FileReader ();
  fileInput.addEventListener('change', readCSVFile);
  reader.addEventListener('loadend', processData);
  
  function readCSVFile (e) {
    reader.readAsText(e.target.files[0]);
  }
  
  
  
  function processData() {
    var allTextLines = reader.result.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = [];

    for (var i=1; i<allTextLines.length; i++) {
        
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {
            var row = {};
            for (var j=0; j< headers.length; j++) {
               row[headers[j].trim()] = data[j].trim();
               
            }
            lines.push(row);
        }
    }
    console.log(lines);
  }
  
})();
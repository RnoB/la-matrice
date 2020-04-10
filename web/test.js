import "./js/three.min.js";
import { VRButton } from './js/webxr/VRButton.js';

//import { WebXRButton } from './js/webxr/webxr-button.js';

var scene;
var camera;
var renderer = null;
var polyfill = new WebXRPolyfill();

var ws;


var startDate = new Date();
var startTime = startDate.getTime()


function connect()
{


    ws = new WebSocket('wss://matricematrice.xyz:6785'); 
}

function messageJSON()
{
      var msg = {
    action: "minus",
    text: "fuck",
    id:   234235,
    date: Date.now()
  };

  // Send the msg object as a JSON-formatted string.
  ws.onopen =  function(event){ws.send(JSON.stringify(msg))};
  
  
  // Blank the text input element, ready to receive the next line of text from the user.
  //document.getElementById("text").value = "";
}
function setup()
{
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xff0000);

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 10000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.xr.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    document.body.appendChild(VRButton.createButton(renderer));

}

setup();

function testNetwork()
{
    connect();
    //ws.onopen =  function(event){ws.send([10,2,3]); }
    messageJSON();
    ws.onmessage = function (event) {console.log(event.data);}
}
testNetwork();










//setup();

function animate() {
    renderer.setAnimationLoop(render);
}
function render() {
    var t = new Date().getTime();




    renderer.render(scene, camera);
}

 
animate();
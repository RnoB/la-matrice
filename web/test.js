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

function receiver(data)
{
  console.log(data);
}
function messageJSON()
{
    var msg = {
    action: "minus",
    text: "fuck",
    id:   234235,
    date: Date.now()
  };
  ws.onopen =  function(event){ws.send(JSON.stringify(msg))};
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
    ws.onmessage = function (event) {receiver(event.data);}
    //ws.onopen =  function(event){ws.send([10,2,3]); }
    
}
testNetwork();










//setup();

function animate() {
    renderer.setAnimationLoop(render);
}
function render() {
    var t = new Date().getTime();


    ws.onopen =  function(event){ws.send([10,2,3]); }

   renderer.render(scene, camera);
}

 
animate();
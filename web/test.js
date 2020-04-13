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

var id = Math.random();


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function connect()
{
    ws = new WebSocket('wss://matricematrice.xyz:6785'); 
}

function receiver(msg)
{
    var data = JSON.parse(msg);
    console.log(data);
    console.log(typeof data):
    if('world' in data)
    {
        id = data.id;
    }
}
async function sender()
{
    while(true)
    {
        var msg = {
            id: id,
            position: camera.position,
            rotation: camera.rotation
        };
        ws.send(JSON.stringify(msg));
        await sleep(2000);
    }
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
    ws.onopen =  function(event){sender(); }
    
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
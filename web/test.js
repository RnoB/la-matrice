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

var connected = false;

var listPlayers = [];


var geometry = new THREE.BoxGeometry();

            //var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var material = new THREE.MeshStandardMaterial();


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function connect()
{
    ws = new WebSocket('wss://matricematrice.xyz:6785'); 
    connected = true;
}

function receiver(msg)
{
    var data = JSON.parse(msg);
    console.log(data);
    if('world' in data)
    {
        id = data.id;
        console.log(data.playerIds);
        for (const player of data.playerIds)
        {
            console.log(player);

            var cube = new THREE.Mesh(geometry, material);
            scene.add(cube);
            listPlayers.push({"id" : player,
            "position" : {"x":0,"y":0,"z":0},
            "rotation" : {"_x":0,"_y":0,"_z":0,"_order":"XYZ"},
            "mesh" : cube});
        }
        setUpWorld();
    }
    else if('newPlayer' in data)
    {
            var cube = new THREE.Mesh(geometry, material);
            scene.add(cube);
            listPlayers.push({"id" : data.newPlayer,
            "position" : {"x":0,"y":0,"z":0},
            "rotation" : {"_x":0,"_y":0,"_z":0,"_order":"XYZ"},
            "mesh" : cube});
    }
    else
    {
        var idx = listPlayers.findIndex(x => x.id == data.id);
        console.log(idx);
        console.log(listPlayers);
        if (idx>-1)
        {
            listPlayers[idx].position = data.position;
            listPlayers[idx].rotation = data.rotation;
            listPlayers[idx].mesh.position = data.position;
            listPlayers[idx].mesh.rotation = data.rotation;
        }
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

function setUpWorld()
{
    console.log("Setting up World")
    var light = new THREE.PointLight(0x00ff00, 1, 1000);
    light.position.set(50, 50, 50);
    var light2 = new THREE.PointLight(0x00ff, 1, 1000);
    light2.position.set(0, 50, 50);
    scene.add(light2);
    scene.add(light);
}


var xSpeed = 0.1;
var ySpeed = 0.1;

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;

    if (keyCode == 87) {
        camera.position.z += ySpeed;
    } else if (keyCode == 83) {
        camera.position.z -= ySpeed;
    } else if (keyCode == 65) {
        camera.position.x -= xSpeed;
    } else if (keyCode == 68) {
        camera.position.x += xSpeed;
    } else if (keyCode == 32) {
        camera.position.set(0, 0, 0);
    }
    console.log(camera.position);
};

function testNetwork()
{
    connect();
    ws.onmessage = function (event) {receiver(event.data);}
    ws.onopen =  function(event){sender(); }
    
}
testNetwork();










//setup();

function animate() {
    for (player of listPlayers)
    {
        player.mesh.position = player.position;
        player.mesh.rotation = player.rotation;
    }
    renderer.setAnimationLoop(render);
    
}
function render() {
    var t = new Date().getTime();

    
    

   renderer.render(scene, camera);
}

 
animate();
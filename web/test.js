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

var frame = 0

var geometry = new THREE.BoxGeometry();

//var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var material = new THREE.MeshStandardMaterial();
var cameraBox = new THREE.Mesh(geometry, material);

var geometryPlane = new THREE.PlaneGeometry( 200, 200, 8,8 );
var materialPlane = new THREE.MeshBasicMaterial( {color: 0xffff00} );
var plane = new THREE.Mesh( geometryPlane, materialPlane );
    console.log(plane);
    plane.rotateY(Math.PI / 2); 
    plane.UpdateLatrixWorld();





function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function setup()
{
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xff0000);

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 10000);
    
    cameraBox.visible = false;
    camera.add(cameraBox);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.xr.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    document.body.appendChild(VRButton.createButton(renderer));
    scene.add(plane);

    console.log(plane);

}
setup();


function connect()
{
    ws = new WebSocket('wss://matricematrice.xyz:6785'); 
    connected = true;

}




function receiver(msg)
{
    var data = JSON.parse(msg);

    if('world' in data)
    {
        id = data.id;

        for (const player of data.playerIds)
        {



            listPlayers.push({"id" : player,
            "position" : {"x":0,"y":0,"z":0},
            "rotation" : {"_x":0,"_y":0,"_z":0,"_order":"XYZ"},
            "mesh" : new THREE.Mesh(geometry, material)});
            listPlayers[listPlayers.length-1].mesh.scale.set(.3,.3,.3);
            
            scene.add(listPlayers[listPlayers.length-1].mesh);
        }
        setUpWorld();
    }
    else if('newPlayer' in data)
    {

            listPlayers.push({"id" : data.newPlayer,
            "position" : {"x":0,"y":0,"z":0},
            "rotation" : {"_x":0,"_y":0,"_z":0,"_order":"XYZ"},
            "mesh" : new THREE.Mesh(geometry, material)});
            listPlayers[listPlayers.length-1].mesh.scale.set(.3,.3,.3);
            scene.add(listPlayers[listPlayers.length-1].mesh);
    }
    else
    {
        var idx = listPlayers.findIndex(x => x.id == data.id);
        if (idx>-1)
        {

            listPlayers[idx].position = data.position;
            listPlayers[idx].rotation = data.rotation;

        }
    }
}

async function sender()
{
    var direction = new THREE.Vector3();
    var rotation = new THREE.Quaternion();
        
    while(true)
    {
        camera.children[0].getWorldPosition( direction );
        camera.children[0].getWorldQuaternion( rotation );

        var msg = {
            id: id,
            position: direction,
            rotation: rotation
        };
        ws.send(JSON.stringify(msg));
        await sleep(10);
    }
}



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
    
};

function testNetwork()
{
    connect();
    ws.onmessage = function (event) {receiver(event.data);}
    ws.onopen =  function(event){sender(); }
    
}
testNetwork();







var meshPlayer = new THREE.Mesh(geometry, material);


//setup();

function animate() {
    renderer.setAnimationLoop(render);    
}
function render() {
    var t = new Date().getTime();





    for (var player of listPlayers)
    {

        if (player.id !== id)
        {
            player.mesh.position.set(player.position.x,player.position.y,player.position.z);
            player.mesh.quaternion.set(player.rotation._x,player.rotation._y,player.rotation._z,player.rotation._w);
            
        }
    }
    
    
   renderer.render(scene, camera);
   frame++;
}

 
animate();
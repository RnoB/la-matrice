import "./js/three.min.js";
import { VRButton } from './js/webxr/VRButton.js';


import { GUI } from './jsm/libs/dat.gui.module.js';

import { Sky } from './jsm/objects/Sky.js';

import './js/controls/PointerLockControls.js'
var camera, controls, scene, renderer;

var sky, sunSphere;

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
var materialPlane = new THREE.MeshStandardMaterial( {color: 0xff00ff} );
var plane = new THREE.Mesh( geometryPlane, materialPlane );
console.log(plane.rotation);


plane.rotateX(-Math.PI/2.0);
console.log(plane.rotation);

var simuTime = 0;


var controllers = [];

var networkCode;


function getNetworkCode()
{
    var allText
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", "./js/network/networkCode.csv", false);
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

var networkCode = getNetworkCode();



function initSky(turbidity = 10,
        rayleigh = 2,
        mieCoefficient = 0.005,
        mieDirectionalG = 0.8,
        luminance = 1,
        inclination = 0.49, // elevation / inclination
        azimuth = 0.25, // Facing front,
        colorR = 0, // Facing front,
        colorG = 0, // Facing front,
        colorB = 0, // Facing front,
        sun =  ! true) {

    // Add Sky
    sky = new Sky();
    sky.scale.setScalar( 450000 );
    scene.add( sky );

    // Add Sun Helper
    sunSphere = new THREE.Mesh(
        new THREE.SphereBufferGeometry( 20000, 16, 8 ),
        new THREE.MeshBasicMaterial( { color: 0xffffff } )
    );
    sunSphere.position.y = - 700000;
    sunSphere.visible = false;
    scene.add( sunSphere );

    /// GUI



    var distance = 400000;

    var uniforms = sky.material.uniforms;
    uniforms[ "turbidity" ].value = turbidity;
    uniforms[ "rayleigh" ].value = rayleigh;
    uniforms[ "mieCoefficient" ].value = mieCoefficient;
    uniforms[ "mieDirectionalG" ].value = mieDirectionalG;
    uniforms[ "luminance" ].value = luminance;
    uniforms[ "colorR" ].value = colorR;
    uniforms[ "colorG" ].value = colorG;
    uniforms[ "colorB" ].value = colorB;

    var theta = Math.PI * ( inclination - 0.5 );
    var phi = 2 * Math.PI * ( azimuth - 0.5 );

    sunSphere.position.x = distance * Math.cos( phi );
    sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
    sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );

    sunSphere.visible = sun;

    uniforms[ "sunPosition" ].value.copy( sunSphere.position );







}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var controls
function setup()
{
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 10000);
    
    cameraBox.visible = false;
    camera.add(cameraBox);
    camera.position.y = 1.5
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.xr.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    document.body.appendChild(VRButton.createButton(renderer));
    scene.add(plane);


    var turbidity = 10;
    var rayleigh = 2;
    var mieCoefficient = 0.005;
    var mieDirectionalG = 0.8;
    var luminance = 1;
    var inclination = 0.49; // elevation / inclination
    var azimuth = 0.25; // Facing front;
    var colorR = 5; // Facing front;
    var colorG = 0.098; // Facing front;
    var colorB = 4.81; // Facing front;
    var sun =  ! true;

    initSky(turbidity,rayleigh,
        mieCoefficient,
        mieDirectionalG ,
        luminance,
        inclination , // elevation / inclination
        azimuth , // Facing front,
        colorR , // Facing front,
        colorG , // Facing front,
        colorB, // Facing front,
        sun )

    controls = new THREE.PointerLockControls( camera, document.body );
    controls.lock = true;
    for (let i = 0; i < 2; ++i) {
        const controller = renderer.xr.getController(i);
        var controllerMesh = new THREE.Mesh( geometry, material );
        controllerMesh.scale.set(.01,.1,.1);
        controller.add( controllerMesh);
        scene.add(controller);
        controllers.push(controller);

    }
}



function connect()
{
    ws = new WebSocket('wss://matricematrice.xyz:6785'); 
    ws.binaryType = "arraybuffer";
    connected = true;

}




function receiver(msg)
{

    var data = new DataView(msg);
    console.log(data);
    var code = data.getUint8(0,true);
    console.log(code);



    switch(code)
    {


        case networkCode['ObjectPosition']:
            objectId = data.getInt32(1,true);
            var idx = listPlayers.findIndex(x => x.id == objectId);
            if (idx>-1)
            {

                listPlayers[idx].position = new Vector3(data.getFloat(5),
                                                        data.getFloat(9),
                                                        data.getFloat(13));
                listPlayers[idx].rotation = new Quaternion(data.getFloat(17),
                                                            data.getFloat(21),
                                                            data.getFloat(25),
                                                            data.getFloat(29));
                for (let k = 0; k < listPlayers[idx].controllers; ++k) 
                {
                    
                    listPlayers[idx]["controller"+k.toString()+"Position"] = new Vector3(data.getFloat(33+28*j),
                                                                                        data.getFloat(37+28*j),
                                                                                        data.getFloat(41+28*j));
                    listPlayers[idx]["controller"+k.toString()+"Rotation"] = new Quaternion(data.getFloat(45+28*j),
                                                                                            data.getFloat(49+28*j),
                                                                                            data.getFloat(53+28*j),
                                                                                            data.getFloat(57+28*j));
                    
                }

            }
        case networkCode['world']:
            id = data.getInt32(1,true);

            var Nplayers = (data.byteLength-5)/5.0;

            for (let j = 0; j < Nplayers; ++j) 
            {
                controllers = data.getUint8(5*(1+j)+4,true);
                var playerInfo = {"id" : data.getInt32(5*(1+j)),
                "position" : new THREE.Vector3(),
                "rotation" : new THREE.Quaternion(),
                "mesh" : new THREE.Mesh(geometry, material),
                "controllers" : controllers};
                
                for (let k = 0; k < controllers; ++k) 
                {
                    var controllerMesh = new THREE.Mesh( geometry, material );
                    controllerMesh.scale.set(.01,.1,.1);
                    playerInfo["controller"+k.toString()+"Position"] = new THREE.Vector3();
                    playerInfo["controller"+k.toString()+"Rotation"] = new THREE.Quaternion();
                    playerInfo["controller"+k.toString()+"Mesh"] = controllerMesh;
                    scene.add(controllerMesh);
                }
                
                listPlayers.push(playerInfo);
                listPlayers[listPlayers.length-1].mesh.scale.set(.3,.3,.3);
                
                scene.add(listPlayers[listPlayers.length-1].mesh);
            }
            break;
        case networkCode['newPlayer']:
            controllers = data.getUint8(9,true);
            playerInfo = {"id" : data.getInt32(5,true),
            "position" : new THREE.Vector3(),
            "rotation" : new THREE.Quaternion(),
            "mesh" : new THREE.Mesh(geometry, material),
            "controllers" : controllers};

            for (let k = 0; k < controllers; ++k) 
            {
                var controllerMesh = new THREE.Mesh( geometry, material );
                controllerMesh.scale.set(.01,.1,.1);
                playerInfo["controller"+k.toString()+"Position"] = new THREE.Vector3();
                playerInfo["controller"+k.toString()+"Rotation"] = new THREE.Quaternion();
                playerInfo["controller"+k.toString()+"Mesh"] = controllerMesh;
                scene.add(controllerMesh);
            }

            listPlayers.push(playerInfo);
            listPlayers[listPlayers.length-1].mesh.scale.set(.3,.3,.3);
            scene.add(listPlayers[listPlayers.length-1].mesh);
            console.log(playerInfo);
            break;
        case networkCode["removePlayer"]:
            remPlayer = data.getInt32(1,true);
            var idx = listPlayers.findIndex(x => x.id == data.remPlayer);

            if (idx>-1)
            {

                scene.remove(listPlayers[idx].mesh);
                for (let k = 0; k < listPlayers[idx].controllers; ++k) 
                {
                    scene.remove(listPlayers[idx]["controller"+k.toString()+"Mesh"]);
                }
                listPlayers.splice(idx);


            }



    }

}

async function sender()
{
    var direction = new THREE.Vector3();
    var rotation = new THREE.Quaternion();
    var msg = new Uint8Array(2);
    msg[0] = networkCode["connect"];
    msg[1] = controllers.length;
    
    ws.send(msg.buffer);
    while(true)
    {   

        var msgArray = new ArrayBuffer(1+4+28*(1+controllers.length));
        var msgView = new DataView(msgArray);
        camera.children[0].getWorldPosition( direction );
        camera.children[0].getWorldQuaternion( rotation );
        msgView.setUint8(0, networkCode['playerPosition']);
        msgView.setInt32(1, id,true);
        msgView.setFloat32(5, direction.x, true);
        msgView.setFloat32(9, direction.y, true);
        msgView.setFloat32(13, direction.z, true);
        msgView.setFloat32(17, rotation._x, true);
        msgView.setFloat32(21, rotation._y, true);
        msgView.setFloat32(25, rotation._z, true);
        msgView.setFloat32(29, rotation._w, true);

        for (let k = 0; k < controllers.length; ++k) 
        {
            msgView.setFloat32(33+k*28, controllers[k].position.x, true);
            msgView.setFloat32(37+k*28, controllers[k].position.y, true);
            msgView.setFloat32(41+k*28, controllers[k].position.z, true);
            msgView.setFloat32(45+k*28, controllers[k].quaternion._x, true);
            msgView.setFloat32(49+k*28, controllers[k].quaternion._y, true);
            msgView.setFloat32(53+k*28, controllers[k].quaternion._z, true);
            msgView.setFloat32(57+k*28, controllers[k].quaternion._w, true);
            
        }
        console.log(msgView.buffer);
        ws.send(new Uint8Array(msgArray));
        await sleep(10);
    }
}



function setUpWorld()
{
    console.log("Setting up World")
    var light = new THREE.PointLight(0xab0000, 1, 1000);
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

function network()
{
    connect();
    ws.onmessage = function (event) {receiver(event.data);}
    ws.onopen =  function(event){sender(); }
    
}











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
            for (let k = 0; k < player.controllers; ++k) 
            {

                player["controller"+k.toString()+"Mesh"].position.set(player["controller"+k.toString()+"Position"].x,
                                                                    player["controller"+k.toString()+"Position"].y,
                                                                    player["controller"+k.toString()+"Position"].z,);
                player["controller"+k.toString()+"Mesh"].quaternion.set(player["controller"+k.toString()+"Rotation"]._x,
                                                                    player["controller"+k.toString()+"Rotation"]._y,
                                                                    player["controller"+k.toString()+"Rotation"]._z,
                                                                    player["controller"+k.toString()+"Rotation"]._w);

            }
            
            
        }
    }
    
    
    renderer.render(scene, camera);
    frame++;
}

setup();
network();
animate();
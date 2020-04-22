import "./js/three.min.js";
import { VRButton } from './js/webxr/VRButton.js';

import { networkCode,objectsType } from "./js/network/networkCode.js"
import {InputKey} from "./js/controls/inputKey.js" 
import {sleep,InitSky,InitFloor} from "./js/controls/world.js" 


var camera, controls, scene, renderer;

var sky, floor;


var scene;
var camera;
var renderer = null;
var polyfill = new WebXRPolyfill();

var ws;


var startDate = new Date();
var startTime = startDate.getTime()

var id = -1;

var connected = false;

var listPlayers = [];
var listObjects = [];

var frame = 0

var geometry = new THREE.BoxGeometry();

//var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var material = new THREE.MeshStandardMaterial();
var cameraBox = new THREE.Mesh(geometry, material);



var simuTime = 0;


var controllers = [];


var inputs = new InputKey();

var updateFrequency = 50;





/* Setup World */
function setUpWorld()
{
    console.log("Setting up World")
    var light = new THREE.DirectionalLight(0xab0000, 1, 1000);
    light.position.set(50, 50, 50);
    light.castShadow = true;
    var light2 = new THREE.PointLight(0x00ff, 1, 1000);
    light2.position.set(0, 50, 50);
    scene.add(light2);
    scene.add(light);

    sky = new InitSky();
    sky.addToScene(scene);    
    floor = new InitFloor();
    floor.addToScene(scene);

    for (let i = 0; i < 2; ++i) {
        const controller = renderer.xr.getController(i);
        var controllerMesh = new THREE.Mesh( geometry, material );
        controllerMesh.scale.set(.01,.1,.1);
        controller.add( controllerMesh);
        scene.add(controller);
        controllers.push(controller);

    }
    
}

function setup()
{
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 10000);
    
    cameraBox.visible = false;
    camera.add(cameraBox);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.xr.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    document.body.appendChild(VRButton.createButton(renderer));

    setUpWorld()
}





/* Network */

function network()
{
    connect();
    ws.onmessage = function (event) {receiver(event.data);}
    ws.onopen =  function(event){sender(); }
    
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

    var code = data.getUint8(0,true);
    var t1 = new Date().getTime();


    //console.log(code);
    switch(code)
    {

    
        case networkCode['objectPosition'] :
        case networkCode['playerPosition'] :

           
            var objectId = data.getInt32(1,true);

            var idx = listPlayers.findIndex(x => x.id == objectId);
            if (idx>-1)
            {

                listPlayers[idx].position = new THREE.Vector3(data.getFloat32(5,true),
                                                        data.getFloat32(9,true),
                                                        data.getFloat32(13,true));
                listPlayers[idx].rotation = new THREE.Quaternion(data.getFloat32(17,true),
                                                            data.getFloat32(21,true),
                                                            data.getFloat32(25,true),
                                                            data.getFloat32(29,true));
                for (let k = 0; k < listPlayers[idx].controllers; ++k) 
                {
                    
                    listPlayers[idx]["controller"+k.toString()+"Position"] = new THREE.Vector3(data.getFloat32(33+28*k,true),
                                                                                        data.getFloat32(37+28*k,true),
                                                                                        data.getFloat32(41+28*k,true));
                    listPlayers[idx]["controller"+k.toString()+"Rotation"] = new THREE.Quaternion(data.getFloat32(45+28*k,true),
                                                                                            data.getFloat32(49+28*k,true),
                                                                                            data.getFloat32(53+28*k,true),
                                                                                            data.getFloat32(57+28*k,true));
                    
                }

 
            }
            break;
        case networkCode['world']:
        console.log(data.byteLength);
            id = data.getInt32(1,true);
            camera.position.set(data.getFloat32(5,true),
                                data.getFloat32(9,true),
                                data.getFloat32(13,true));
            camera.quaternion.set(data.getFloat32(17,true),
                                    data.getFloat32(21,true),
                                    data.getFloat32(25,true),
                                    data.getFloat32(29,true));
            console.log(camera.rotation);
            console.log(camera.position);
            var Nplayers = (data.byteLength-33)/5.0;

            for (let j = 0; j < Nplayers; ++j) 
            {

                var contrlers = data.getUint8(28+5*(2+j)-1,true);
                var playerInfo = {"id" : data.getInt32(28+5*(1+j),true),
                "position" : new THREE.Vector3(),
                "rotation" : new THREE.Quaternion(),
                "mesh" : new THREE.Mesh(geometry, material),
                "controllers" : contrlers};

                for (let k = 0; k < contrlers; ++k) 
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
            var contrlers = data.getUint8(9,true);
            playerInfo = {"id" : data.getInt32(5,true),
            "position" : new THREE.Vector3(),
            "rotation" : new THREE.Quaternion(),
            "mesh" : new THREE.Mesh(geometry, material),
            "controllers" : contrlers};

            for (let k = 0; k < contrlers; ++k) 
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

            break;
        case networkCode["removePlayer"]:
            var remPlayer = data.getInt32(1,true);
            var idx = listPlayers.findIndex(x => x.id == remPlayer);

            if (idx>-1)
            {

                scene.remove(listPlayers[idx].mesh);
                for (let k = 0; k < listPlayers[idx].controllers; ++k) 
                {
                    scene.remove(listPlayers[idx]["controller"+k.toString()+"Mesh"]);
                }
                listPlayers.splice(idx);


            }
        case networkCode['newObject']:
            
            var objectInfo = {"id" : data.getInt32(1,true),
            "type" : data.getInt32(5,true),
            "position" : new THREE.Vector3(data.getFloat32(9,true),
                                            data.getFloat32(13,true),
                                            data.getFloat32(17,true)),
            "rotation" : new THREE.Quaternion(data.getFloat32(21,true),
                                            data.getFloat32(25,true),
                                            data.getFloat32(29,true),
                                            data.getFloat32(33,true) ),
            "mesh" : new THREE.Mesh(geometry, material)};
            console.log(objectInfo.id);
            objectInfo.mesh.position.set(objectInfo.position.x,
                                        objectInfo.position.y,
                                        objectInfo.position.z)
            objectInfo.mesh.quaternion.set(objectInfo.rotation._x,
                                        objectInfo.rotation._y,
                                        objectInfo.rotation._z,
                                        objectInfo.rotation._w)
            objectInfo.mesh.scale.set(.2,.2,.2);
            scene.add(objectInfo.mesh);

            listObjects.push(objectInfo);
            console.log(listObjects);

            break;
        case networkCode["removeObject"]:
            
            var remObject = data.getInt32(1,true);
            var idx = listObjects.findIndex(x => x.id == remObject);
            if (idx>-1)
            {

                scene.remove(listObjects[idx].mesh);

                //listObjects.splice(idx);


            }
            
            break;

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
    var t1 = new Date().getTime();
    while(true)
    {   

        var msgArray = new ArrayBuffer(1+28*(1+controllers.length));
        //var msgArray = new ArrayBuffer(1+0*(1+controllers.length));
        
        var msgView = new DataView(msgArray);
        camera.children[0].getWorldPosition( direction );
        camera.children[0].getWorldQuaternion( rotation );
        msgView.setUint8(0, networkCode['playerPosition']);

        msgView.setFloat32(1, direction.x, true);
        msgView.setFloat32(5, direction.y, true);
        msgView.setFloat32(9, direction.z, true);
        msgView.setFloat32(13, rotation._x, true);
        msgView.setFloat32(17, rotation._y, true);
        msgView.setFloat32(21, rotation._z, true);
        msgView.setFloat32(25, rotation._w, true);

        for (let k = 0; k < controllers.length; ++k) 
        {
            msgView.setFloat32(29+k*28, controllers[k].position.x, true);
            msgView.setFloat32(33+k*28, controllers[k].position.y, true);
            msgView.setFloat32(37+k*28, controllers[k].position.z, true);
            msgView.setFloat32(41+k*28, controllers[k].quaternion._x, true);
            msgView.setFloat32(45+k*28, controllers[k].quaternion._y, true);
            msgView.setFloat32(49+k*28, controllers[k].quaternion._z, true);
            msgView.setFloat32(53+k*28, controllers[k].quaternion._w, true);
            
        }
        
        ws.send(msgView.buffer);
        var t2 = new Date().getTime();
        await sleep(1000.0/updateFrequency);
        t1=t2;
    }
}



/* rendering */

function animate() {
    renderer.setAnimationLoop(render);    
}

function render() {
    var t = new Date().getTime();



    inputs.inputPlayer(camera);

    for (var player of listPlayers)
    {

        if (player.id !== id)
        {
            //console.log(player.mesh.position);
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


/*Program Start*/
setup();
network();
animate();
import "../three.min.js";
import { networkCode,objectsType } from "./networkCode.js"
import {sleep} from "../controls/world.js" 

export class Client
{

    constructor(ip = "matricematrice.xyz",port = 6785,updateFrequency = 20,scene = {},camera = {},controllers = {})
    {
        this.ws = new WebSocket('wss://'+ip+':'+port.toString()); 
        this.ws.onmessage = function (event) {this.receiver(event.data);}
        this.ws.onopen =  function(event){this.sender(); }
        this.ws.binaryType = "arraybuffer";
        this.connected = true;

        this.updateFrequency = updateFrequency;
        this.camera = camera;
        this.controllers = controllers;
        this.controllersNumber = controllers.length;
        this.scene = scene;

        this.listPlayers = [];
        this.listObjects = [];

    }


    async sender()
    {
        var direction = new THREE.Vector3();
        var rotation = new THREE.Quaternion();
        var msg = new Uint8Array(2);
        msg[0] = this.networkCode["connect"];
        msg[1] = this.controllersNumber;
        
        ws.send(msg.buffer);
        var t1 = new Date().getTime();
        while(true)
        {   

            var msgArray = new ArrayBuffer(1+28*(1+controllers.length));
            //var msgArray = new ArrayBuffer(1+0*(1+controllers.length));
            
            var msgView = new DataView(msgArray);
            this.camera.getWorldPosition( direction );
            this.camera.getWorldQuaternion( rotation );
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
                msgView.setFloat32(29+k*28, this.controllers[k].position.x, true);
                msgView.setFloat32(33+k*28, this.controllers[k].position.y, true);
                msgView.setFloat32(37+k*28, this.controllers[k].position.z, true);
                msgView.setFloat32(41+k*28, this.controllers[k].quaternion._x, true);
                msgView.setFloat32(45+k*28, this.controllers[k].quaternion._y, true);
                msgView.setFloat32(49+k*28, this.controllers[k].quaternion._z, true);
                msgView.setFloat32(53+k*28, this.controllers[k].quaternion._w, true);
                
            }
            
            ws.send(msgView.buffer);
            var t2 = new Date().getTime();
            await sleep(1000.0/this.updateFrequency);
            t1=t2;
        }
    }

    async receiver(msg)
    {   
        var data = new DataView(msg);

        var code = data.getUint8(0,true);
        var t1 = new Date().getTime();



        switch(code)
        {

        
            case networkCode['objectPosition'] :


                var objectInfo = positionReader(data,1,0);

                var idx = this.listObjects.findIndex(x => x.id == objectInfo.id);

                if (idx>-1)
                {

                    this.listObjects[idx].position = objectInfo.position;
                    this.listObjects[idx].rotation = objectInfo.rotation;


     
                }

                break;
            case networkCode['playerPosition'] :

               
                var objectInfo = positionReader(data,1,2);

                var idx = this.listPlayers.findIndex(x => x.id == objectInfo.id);
                if (idx>-1)
                {

                    this.listPlayers[idx].position =  objectInfo.position;
                    this.listPlayers[idx].rotation =  objectInfo.rotation;
                    for (let k = 0; k < this.listPlayers[idx].controllers; ++k) 
                    {
                        
                        this.listPlayers[idx]["con"+k.toString()+"Pos"] = objectInfo["con"+k.toString()+"Pos"];
                        this.listPlayers[idx]["con"+k.toString()+"Rot"] = objectInfo["con"+k.toString()+"Rot"];
                        
                    }

     
                }
                break;
            case networkCode['world']:
                
                world = data.getInt32(1,true);
                var Nplayers = data.getInt32(5,true);
                var Nobjects = data.getInt32(9,true);
                var objectInfo = positionReader(data,13,0);
                id = objectInfo.id;
                console.log("world : "+world.toString()+" id : "+id.toString()+" Nplayers : "+Nplayers.toString()+" Nobjects : "+Nobjects.toString());
                camera.position.set(objectInfo.position.x,
                                    objectInfo.position.y,
                                    objectInfo.position.z);
                camera.quaternion.set(objectInfo.rotation.x,
                                        objectInfo.rotation.y,
                                        objectInfo.rotation.z,
                                        objectInfo.rotation.w);

                

                for (let j = 0; j < Nplayers; ++j) 
                {

                    var contrlers = data.getUint8(45+5*(1+j)-1,true);
                    var playerInfo = {"id" : data.getInt32(45+5*(j),true),
                    "position" : new THREE.Vector3(),
                    "rotation" : new THREE.Quaternion(),
                    "mesh" : new THREE.Mesh(geometry, material),
                    "controllers" : contrlers};

                    for (let k = 0; k < contrlers; ++k) 
                    {
                        var controllerMesh = new THREE.Mesh( geometry, material );
                        controllerMesh.scale.set(.01,.1,.1);
                        playerInfo["con"+k.toString()+"Pos"] = new THREE.Vector3();
                        playerInfo["con"+k.toString()+"Rot"] = new THREE.Quaternion();
                        playerInfo["con"+k.toString()+"Mesh"] = controllerMesh;
                        controllerMesh.castShadow = true;
                        scene.add(controllerMesh);
                    }
                    
                    this.listPlayers.push(playerInfo);
                    this.listPlayers[this.listPlayers.length-1].mesh.scale.set(.3,.3,.3);
                    this.listPlayers[this.listPlayers.length-1].mesh.castShadow = true;
                    scene.add(this.listPlayers[this.listPlayers.length-1].mesh);
                }
                for (let j = 0; j < Nobjects; ++j) 
                {

                    var objectInfo = {"id" : data.getInt32(49+5*Nplayers+j*48,true),
                                "type" : data.getInt32(45+5*Nplayers+j*48,true),
                                "position" : new THREE.Vector3(data.getFloat32(53+5*Nplayers+j*48,true),
                                                data.getFloat32(57+5*Nplayers+j*48,true),
                                                data.getFloat32(61+5*Nplayers+j*48,true)),
                                "rotation" : new THREE.Quaternion(data.getFloat32(65+5*Nplayers+j*48,true),
                                                data.getFloat32(69+5*Nplayers+j*48,true),
                                                data.getFloat32(73+5*Nplayers+j*48,true),
                                                data.getFloat32(77+5*Nplayers+j*48,true) ),
                                "scale" : new THREE.Vector3(data.getFloat32(81+5*Nplayers+j*48,true),
                                                data.getFloat32(85+5*Nplayers+j*48,true),
                                                data.getFloat32(89+5*Nplayers+j*48,true)),
                                "mesh" : new THREE.Mesh(geometry, material)};
                objectInfo.mesh.position.set(objectInfo.position.x,
                                            objectInfo.position.y,
                                            objectInfo.position.z)
                objectInfo.mesh.quaternion.set(objectInfo.rotation._x,
                                            objectInfo.rotation._y,
                                            objectInfo.rotation._z,
                                            objectInfo.rotation._w)
                objectInfo.mesh.scale.set(objectInfo.scale.x,
                                            objectInfo.scale.y,
                                            objectInfo.scale.z)
                objectInfo.mesh.castShadow = true;
                scene.add(objectInfo.mesh);

                this.listObjects.push(objectInfo);
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
                    playerInfo["con"+k.toString()+"Pos"] = new THREE.Vector3();
                    playerInfo["con"+k.toString()+"Rot"] = new THREE.Quaternion();
                    playerInfo["con"+k.toString()+"Mesh"] = controllerMesh;
                    controllerMesh.castShadow = true;
                    scene.add(controllerMesh);
                }

                this.listPlayers.push(playerInfo);
                this.listPlayers[this.listPlayers.length-1].mesh.scale.set(.3,.3,.3);
                this.listPlayers[this.listPlayers.length-1].mesh.castShadow = true;
                scene.add(this.listPlayers[this.listPlayers.length-1].mesh);

                break;
            case networkCode["removePlayer"]:
                var remPlayer = data.getInt32(1,true);
                var idx = this.listPlayers.findIndex(x => x.id == remPlayer);

                if (idx>-1)
                {

                    scene.remove(this.listPlayers[idx].mesh);
                    for (let k = 0; k < this.listPlayers[idx].controllers; ++k) 
                    {
                        scene.remove(this.listPlayers[idx]["con"+k.toString()+"Mesh"]);
                    }
                    this.listPlayers.splice(idx,1);


                }
                break;
            case networkCode['newObject']:
                console.log(data.byteLength);
                var objectInfo = {"id" : data.getInt32(1,true),
                "type" : data.getInt32(5,true),
                "position" : new THREE.Vector3(data.getFloat32(9,true),
                                                data.getFloat32(13,true),
                                                data.getFloat32(17,true)),
                "rotation" : new THREE.Quaternion(data.getFloat32(21,true),
                                                data.getFloat32(25,true),
                                                data.getFloat32(29,true),
                                                data.getFloat32(33,true) ),
                "scale" : new THREE.Vector3(data.getFloat32(37,true),
                                                data.getFloat32(41,true),
                                                data.getFloat32(45,true)),
                "mesh" : new THREE.Mesh(geometry, material)};

                objectInfo.mesh.position.set(objectInfo.position.x,
                                            objectInfo.position.y,
                                            objectInfo.position.z)
                objectInfo.mesh.quaternion.set(objectInfo.rotation._x,
                                            objectInfo.rotation._y,
                                            objectInfo.rotation._z,
                                            objectInfo.rotation._w)
                objectInfo.mesh.scale.set(objectInfo.scale.x,
                                            objectInfo.scale.y,
                                            objectInfo.scale.z)
                objectInfo.mesh.castShadow = true;
                scene.add(objectInfo.mesh);

                this.listObjects.push(objectInfo);


                break;
            case networkCode["removeObject"]:
                
                var remObject = data.getInt32(1,true);
                var idx = this.listObjects.findIndex(x => x.id == remObject);
                if (idx>-1)
                {

                    scene.remove(this.listObjects[idx].mesh);

                    this.listObjects.splice(idx,1);


                }
                
                break;

        }

    }

}
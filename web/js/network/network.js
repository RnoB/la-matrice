import { networkCode,objectsType } from "./networkCode.js"
import {sleep,worldGeometry} from "../controls/world.js" 



function readVector3(data,offset)
{
    var vec = new THREE.Vector3(data.getFloat32(offset,true),
                                data.getFloat32(offset+4,true),
                                data.getFloat32(offset+8,true));
    return vec;
}

function readQuaternion(data,offset)
{
    var quat = new THREE.Quaternion(data.getFloat32(offset,true),
                                    data.getFloat32(offset+4,true),
                                    data.getFloat32(offset+8,true),
                                    data.getFloat32(offset+12,true));
    return quat;
    
}

function readPosition(data,player,offset = 0,controllers  = 0,noRotation=false,noControllers = false)
{

    player['position'] = new THREE.Vector3(data.getFloat32(offset,true),
                                                data.getFloat32(offset+4,true),
                                                data.getFloat32(offset+8,true));
    offset += 12;
    if(!noRotation)
    {
        player['rotation'] = new THREE.Quaternion(data.getFloat32(offset,true),
                                                data.getFloat32(offset+4,true),
                                                data.getFloat32(offset+8,true),
                                                data.getFloat32(offset+12,true));
        offset += 16;
    }

    for (let k = 0; k < player['controllers']; ++k) 
    {
        
        player["posC"+k.toString()] = new THREE.Vector3(data.getFloat32(offset,true),
                                                data.getFloat32(offset+4,true),
                                                data.getFloat32(offset+8,true))
        offset += 12;
        if(!noRotation)
        {
            player["rotC"+k.toString()] = new THREE.Quaternion(data.getFloat32(offset,true),
                                                data.getFloat32(offset+4,true),
                                                data.getFloat32(offset+8,true),
                                                data.getFloat32(offset+12,true));
            offset += 16;
        }
    }

    return player

}

function readId(data,offset)
{
    return  data.getInt32(offset,true);
}

function newPlayer(data,scene,offset,geometry)
{
    var playerInfo = {"id" : data.getInt32(offset+4,true),
    "type" : data.getInt32(offset,true),
    "position" : new THREE.Vector3(),
    "rotation" : new THREE.Quaternion(),
    "controllers" : data.getUint8(offset+8,true)};

    var idx = geometry.findIndex(x => x.type == playerInfo['type']);
    playerInfo["mesh"] = new THREE.Mesh(geometry[idx].geometry, geometry[idx].material);

    for (let k = 0; k < playerInfo['controllers']; ++k) 
    {
        var controllerMesh = new THREE.Mesh( geometry[idx].geometryController, geometry[idx].materialController );
        controllerMesh.scale.set(.01,.1,.1);
        playerInfo["posC"+k.toString()] = new THREE.Vector3();
        playerInfo["rotC"+k.toString()] = new THREE.Quaternion();
        playerInfo["meshC"+k.toString()] = controllerMesh;
        controllerMesh.castShadow = true;
        scene.add(controllerMesh);
    }
    
    playerInfo.mesh.scale.set(.3,.3,.3);
    playerInfo.mesh.castShadow = true;
    scene.add(playerInfo.mesh);
    return playerInfo;
}


function removePlayer(data,scene,listPlayers,offset)
{
    var remPlayer = data.getInt32(offset,true);
    var idx = listPlayers.findIndex(x => x.id == remPlayer);
 
    if (idx>-1)
    {

        scene.remove(listPlayers[idx].mesh);
        for (let k = 0; k < listPlayers[idx].controllers; ++k) 
        {
            scene.remove(listPlayers[idx]["meshC"+k.toString()]);
        }
        listPlayers.splice(idx,1);


    }
}
function newObject(data,scene,offset,geometry)
{

        var objectInfo = {"id" : data.getInt32(offset+4,true),
                "type" : data.getInt32(offset,true),
                "position" : new THREE.Vector3(data.getFloat32(offset+8,true),
                                data.getFloat32(offset+12,true),
                                data.getFloat32(offset+16,true)),
                "scale" : new THREE.Vector3(data.getFloat32(offset+36,true),
                                data.getFloat32(offset+40,true),
                                data.getFloat32(offset+44,true))};
        if (!this.noRotation)
        {
            objectInfo["rotation"] = new THREE.Quaternion(data.getFloat32(offset+20,true),
                                data.getFloat32(offset+24,true),
                                data.getFloat32(offset+28,true),
                                data.getFloat32(offset+32,true) )
        }
        var idx = geometry.findIndex(x => x.type == objectInfo['type']);
        console.log(idx);
        console.log(geometry);
        console.log(objectInfo);
        objectInfo["mesh"] = new THREE.Mesh(geometry[idx].geometry, geometry[idx].material);
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
        return objectInfo
}

function removeObject()
{
    var remObject = data.getInt32(1,true);
    var idx = listObjects.findIndex(x => x.id == remObject);
    if (idx>-1)
    {

        scene.remove(listObjects[idx].mesh);

        listObjects.splice(idx,1);


    }
}
function readWorld(data,scene)
{
    var worldInfo = {"world" : data.getInt32(1,true),
                            'Nplayers' : data.getInt32(5,true),
                            'Nobjects' : data.getInt32(9,true),
                            'id' : data.getInt32(13,true),
                            'noRotation' : data.getUint8(17,true),
                            'noControllers' : data.getUint8(18,true),
                            'playerInfo' : {}};
    worldInfo['geometry'] = worldGeometry(worldInfo['world']);

    var offset = 19;
    readPosition(data,worldInfo['playerInfo'],offset,0);
    
    console.log(worldInfo)

    
    worldInfo['listPlayers'] = [];
    offset+=28;
    for (let j = 0; j < worldInfo['Nplayers']; ++j) 
    {


        var playerInfo = newPlayer(data,scene,offset,worldInfo['geometry']);
        
        
        worldInfo['listPlayers'].push(playerInfo);
        offset+=9;
    }
    worldInfo['listObjects'] = [];
    for (let j = 0; j < worldInfo['Nobjects']; ++j) 
    {

        var objectInfo = newObject(data,scene,offset,worldInfo['geometry'])
        console.log(objectInfo);
        worldInfo['listObjects'].push(objectInfo);
        offset+=48;
    }
    return worldInfo;
}


function sendMessage(camera,controllers,noRotation = false,noScale = false)
{
    if (noRotation)
    {
        var msgArray = new ArrayBuffer(1+12*(1+ controllers.length));
    }
    else
    {
        var msgArray = new ArrayBuffer(1+28*(1+ controllers.length));
    }

    //var msgArray = new ArrayBuffer(1+0*(1+controllers.length));
    var direction = new THREE.Vector3();
    var rotation = new THREE.Quaternion();
    var msgView = new DataView(msgArray);
    camera.getWorldPosition( direction );
    camera.getWorldQuaternion( rotation );

    msgView.setUint8(0, networkCode['playerPosition']);
    var offset = 1;
    msgView.setFloat32(offset, direction.x, true);
    msgView.setFloat32(offset+4, direction.y, true);
    msgView.setFloat32(offset+8, direction.z, true);
    offset+=12;
    if (!noRotation)
    {
        msgView.setFloat32(offset, rotation._x, true);
        msgView.setFloat32(offset+4, rotation._y, true);
        msgView.setFloat32(offset+8, rotation._z, true);
        msgView.setFloat32(offset+12, rotation._w, true);
    }
    offset+=16;

    for (let k = 0; k < controllers.length; ++k) 
    {

        msgView.setFloat32(offset, controllers[k].position.x, true);
        msgView.setFloat32(offset+4, controllers[k].position.y, true);
        msgView.setFloat32(offset+8, controllers[k].position.z, true);
        offset+=12;
        if (!noRotation)
        {
            msgView.setFloat32(offset, controllers[k].quaternion._x, true);
            msgView.setFloat32(offset+4, controllers[k].quaternion._y, true);
            msgView.setFloat32(offset+8, controllers[k].quaternion._z, true);
            msgView.setFloat32(offset+12, controllers[k].quaternion._w, true);
            offset+=16;
        }
        
    }

    return msgView.buffer;
             
}


export class Client
{




    async sender()
    {

        var msg = new Uint8Array(2);
        msg[0] = networkCode["connect"];
        msg[1] = this.controllers.length;
        
        this.ws.send(msg.buffer);
        var t1 = new Date().getTime();
        while(true)
        {   

            var msgSend = sendMessage(this.cameraPosition,this.controllers,this.noRotation)
            
            this.ws.send(msgSend);
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


                var idx = this.listObjects.findIndex(x => x.id == readId(data,1));


                if (idx>-1)
                {

                    readPosition(data,this.listObjects[idx],5,this.noRotation);
                }

                break;
            case networkCode['playerPosition']:


                var idx = this.listPlayers.findIndex(x => x.id == readId(data,1));


                if (idx>-1)
                {

                    readPosition(data,this.listPlayers[idx],5,this.listPlayers[idx].controllers,this.noRotation);
                }
                break;

            case networkCode['world']:
                
                this.worldInfo = readWorld(data,this.scene);
                this.noRotation = !!this.worldInfo['noRotation'];
                this.noControllers = !!this.worldInfo['noControllers'];
                if(this.noControllers)
                {
                    controllers = [];
                }
                this.listObjects = this.worldInfo["listObjects"];
                this.listPlayers = this.worldInfo["listPlayers"];
                var playerInfo = this.worldInfo.playerInfo;
                this.camera.position.set(playerInfo.position.x,
                                        playerInfo.position.y,
                                        playerInfo.position.z)
                this.camera.quaternion.set(playerInfo.rotation._x,
                                        playerInfo.rotation._y,
                                        playerInfo.rotation._z,
                                        playerInfo.rotation._w)
                break;

            case networkCode['newPlayer']:
                var playerInfo = newPlayer(data,this.scene,1,this.worldInfo['geometry'])
                this.listPlayers.push(playerInfo);
                console.log(playerInfo);

                break;
            case networkCode["removePlayer"]:
                removePlayer(data,this.scene,this.listPlayers,1)
                break;
            case networkCode['newObject']:
                var objectInfo = newObject(data,this.scene,1,this.worldInfo['geometry'])

                this.listObjects.push(objectInfo);


                break;
            case networkCode["removeObject"]:
                removeObject(data,this.scene,this.listObjects,1)
                break;
                
                
                break;

        }

    }

    constructor(ip = "matricematrice.xyz",port = 6785,updateFrequency = 20,scene = {},camera = {},controllers = {})
    {

        var self = this;
        var world = -1;
        this.updateFrequency = updateFrequency;
        this.camera = camera;
        this.cameraPosition = camera.children[0]
        this.controllers = controllers;


        this.scene = scene;

        this.listPlayers = [];
        this.listObjects = [];

        this.worldInfo = {};



        this.ws = new WebSocket('wss://'+ip+':'+port.toString()); 
        this.ws.onmessage = function (event) {self.receiver(event.data);}
        this.ws.onopen =  function(event){self.sender(); }
        this.ws.binaryType = "arraybuffer";
        this.connected = true;

    }

}
import { networkCode,objectsType } from "./networkCode.js"
import {sleep} from "../controls/world.js" 



var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshStandardMaterial();






function readPosition(data,player,offset = 0,controllers  = 0)
{

    player['position'] = new THREE.Vector3(data.getFloat32(offset,true),
                                                data.getFloat32(offset+4,true),
                                                data.getFloat32(offset+8,true));
    player['rotation'] = new THREE.Quaternion(data.getFloat32(offset+12,true),
                                                data.getFloat32(offset+16,true),
                                                data.getFloat32(offset+20,true),
                                                data.getFloat32(offset+24,true));
    for (let k = 0; k < player['controllers']; ++k) 
    {
        player["posC"+k.toString()] = new THREE.Vector3(data.getFloat32(offset+28,true),
                                                data.getFloat32(offset+32,true),
                                                data.getFloat32(offset+36,true))
        player["rotC"+k.toString()] = new THREE.Quaternion(data.getFloat32(offset+40,true),
                                                data.getFloat32(offset+44,true),
                                                data.getFloat32(offset+48,true),
                                                data.getFloat32(offset+52,true));
    }
    return player

}

function readId(data,offset)
{
    return  data.getInt32(offset,true);
}

function newPlayer(data,scene,offset)
{
    var playerInfo = {"id" : data.getInt32(offset,true),
    "position" : new THREE.Vector3(),
    "rotation" : new THREE.Quaternion(),
    "mesh" : new THREE.Mesh(geometry, material),
    "controllers" : data.getUint8(offset+4,true)};

    for (let k = 0; k < playerInfo['controllers']; ++k) 
    {
        var controllerMesh = new THREE.Mesh( geometry, material );
        controllerMesh.scale.set(.01,.1,.1);
        playerInfo["con"+k.toString()+"Pos"] = new THREE.Vector3();
        playerInfo["con"+k.toString()+"Rot"] = new THREE.Quaternion();
        playerInfo["con"+k.toString()+"Mesh"] = controllerMesh;
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
            scene.remove(listPlayers[idx]["con"+k.toString()+"Mesh"]);
        }
        listPlayers.splice(idx,1);


    }
}
function newObject(data,scene,offset)
{
    console.log("size : "+(data.byteLength).toString());
        var objectInfo = {"id" : data.getInt32(offset+4,true),
                "type" : data.getInt32(offset,true),
                "position" : new THREE.Vector3(data.getFloat32(offset+8,true),
                                data.getFloat32(offset+12,true),
                                data.getFloat32(offset+16,true)),
                "rotation" : new THREE.Quaternion(data.getFloat32(offset+20,true),
                                data.getFloat32(offset+24,true),
                                data.getFloat32(offset+28,true),
                                data.getFloat32(offset+32,true) ),
                "scale" : new THREE.Vector3(data.getFloat32(offset+36,true),
                                data.getFloat32(offset+40,true),
                                data.getFloat32(offset+44,true)),
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
        return objectInfo
}
function readWorld(data,scene)
{
    var worldInfo = {"world" : data.getInt32(1,true),
                            'Nplayers' : data.getInt32(5,true),
                            'Nobjects' : data.getInt32(9,true),
                            'id' : data.getInt32(13,true),
                            'playerInfo' : {}};
    
    readPosition(data,worldInfo['playerInfo'],17,0);
    
    console.log("world : "+worldInfo['world'].toString()+" id : "+worldInfo['id'].toString()+" Nplayers : "+worldInfo['Nplayers'].toString()+" Nobjects : "+worldInfo['Nobjects'].toString());
    

    
    worldInfo['listPlayers'] = [];
    for (let j = 0; j < worldInfo['Nplayers']; ++j) 
    {


        var playerInfo = newPlayer(data,scene,45+5*(j));
        
        
        worldInfo['listPlayers'].push(playerInfo);
    }
    worldInfo['listObjects'] = [];
    for (let j = 0; j < worldInfo['Nobjects']; ++j) 
    {

        var objectInfo = newObject(data,scene,45+5*worldInfo['Nplayers']+j*48)
        console.log(objectInfo);
        worldInfo['listObjects'].push(objectInfo);
    }
    return worldInfo;
}

export class Client
{




    async sender()
    {
        var direction = new THREE.Vector3();
        var rotation = new THREE.Quaternion();
        var msg = new Uint8Array(2);
        msg[0] = networkCode["connect"];
        msg[1] = this.controllersNumber;
        
        this.ws.send(msg.buffer);
        var t1 = new Date().getTime();
        while(true)
        {   

            var msgArray = new ArrayBuffer(1+28*(1+ this.controllersNumber));
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
            
            this.ws.send(msgView.buffer);
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

                    readPosition(data,this.listObjects[idx],5);
                }

                break;
            case networkCode['playerPosition']:

               

                var idx = this.listPlayers.findIndex(x => x.id == readId(data,1));
                console.log(readId(data,1));
                console.log(idx);
                if (idx>-1)
                {

                    readPosition(data,this.listPlayers[idx],5,this.listPlayers[idx].controllers);
                }
                break;

            case networkCode['world']:
                
                this.worldInfo = readWorld(data,this.scene);
                this.listObjects = this.worldInfo["listObjects"];
                this.listPlayers = this.worldInfo["listPlayers"];

                break;

            case networkCode['newPlayer']:
                var playerInfo = newPlayer(data,this.scene,1)
                this.listPlayers.push(playerInfo);

                break;
            case networkCode["removePlayer"]:
                removePlayer(data,this.scene,this.listPlayers,1)
                break;
            case networkCode['newObject']:
                var objectInfo = newObject(data,this.scene,1)

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

    constructor(ip = "matricematrice.xyz",port = 6785,updateFrequency = 20,scene = {},camera = {},controllers = {})
    {

        var self = this;
        var world = -1;
        this.updateFrequency = updateFrequency;
        this.camera = camera;
        this.controllers = controllers;
        this.controllersNumber = controllers.length;
        this.scene = scene;

        this.listPlayers = [];
        this.listObjects = [];

        this.worldInfo = {};

        console.log("scene : "+this.scene.toString())
        this.ws = new WebSocket('wss://'+ip+':'+port.toString()); 
        this.ws.onmessage = function (event) {self.receiver(event.data);}
        this.ws.onopen =  function(event){self.sender(); }
        this.ws.binaryType = "arraybuffer";
        this.connected = true;

    }

}
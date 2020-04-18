
import asyncio
import pathlib
import ssl
import websockets
import socket
import logging
import time
import threading
import struct
import csv
import time
import numpy as np
homeFolder = "/home/ubuntu/"
networkCodePath = homeFolder+"la-matrice/web/js/network/networkCode.csv"
certFolder = "cert/"

networkCode = []

playersSocket = []
playersPosition = []
playerIds = []
playerId = 0
playerNumber = 0
nextPlayer = 0
playersPosition = []
playersRotation = []
playersList = []


t0 = time.time()
#logger = logging.getLogger('websockets')
#logger.setLevel(logging.INFO)
#logger.addHandler(logging.StreamHandler())

def euler_to_quaternion(roll, pitch, yaw):

    qx = np.sin(roll/2) * np.cos(pitch/2) * np.cos(yaw/2) - np.cos(roll/2) * np.sin(pitch/2) * np.sin(yaw/2)
    qy = np.cos(roll/2) * np.sin(pitch/2) * np.cos(yaw/2) + np.sin(roll/2) * np.cos(pitch/2) * np.sin(yaw/2)
    qz = np.cos(roll/2) * np.cos(pitch/2) * np.sin(yaw/2) - np.sin(roll/2) * np.sin(pitch/2) * np.cos(yaw/2)
    qw = np.cos(roll/2) * np.cos(pitch/2) * np.cos(yaw/2) + np.sin(roll/2) * np.sin(pitch/2) * np.sin(yaw/2)

    return [qx, qy, qz, qw]

def quaternion_to_euler(x, y, z, w):

    t0 = +2.0 * (w * x + y * z)
    t1 = +1.0 - 2.0 * (x * x + y * y)
    roll = math.atan2(t0, t1)
    t2 = +2.0 * (w * y - z * x)
    t2 = +1.0 if t2 > +1.0 else t2
    t2 = -1.0 if t2 < -1.0 else t2
    pitch = math.asin(t2)
    t3 = +2.0 * (w * z + x * y)
    t4 = +1.0 - 2.0 * (y * y + z * z)
    yaw = math.atan2(t3, t4)
    return [yaw, pitch, roll]

with open(networkCodePath, mode='r') as infile:
    reader = csv.reader(infile)
    networkCode = {rows[0]:int(rows[1]) for rows in reader}
    print(networkCode)


def getLocalIP():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(('8.8.8.8', 1))  # connect() for UDP doesn't send packets
    localIP = s.getsockname()[0]
    s.close()
    return localIP


def initialPosition():
    if len(playersPosition)==0:
        position = np.array([0,1.5,0])
        rotation = np.array([0,0,0,1])
    else:
        mn = np.mean(playersPosition,axis = 0)
        dist = 1+np.random.rand()
        theta = 2*np.pi*np.random.rand()
        position = mn+[dist*np.cos(theta),-mn[1]+1.5,dist*np.sin(theta)]
        theta = np.arctan2(position[0]-mn[0],position[2]-mn[2])
        
        rotation = euler_to_quaternion(0, theta, 0)

    return position, rotation

async def register(websocket):
    global playerNumber
    global playerIds
    global playerId
    global players
    playerId+=1
    try:
        playerData = await websocket.recv()
    except:
        pass
    print(playerData)
    playerInfo = struct.unpack('BB',playerData)
    
    print(playerInfo)
    if playerInfo[0] == networkCode['connect']:
        position0,rotation0 = initialPosition()
        controllers = playerInfo[1]


        for player in playersSocket:
        
            dataWorld = struct.pack('<BiiB', networkCode['newPlayer'],0, playerId,controllers)
            
            print(dataWorld);
            try:
                await player.send( dataWorld)
            except:
                pass
        
            
                    
        playersSocket.append(websocket)
        dataWorld = struct.pack('B', networkCode['world'])
        dataWorld += struct.pack('<i',playerId)
        dataWorld += struct.pack('<fffffff',position0[0],position0[1],position0[2],\
                                    rotation0[0],rotation0[1],rotation0[2],rotation0[3])

        for k in range(0,len(playerIds)):
            dataWorld += struct.pack('<i', playerIds[k])
            dataWorld += struct.pack('B', controllers)

        #world = json.dumps({"world" : 1, "objects" : [2,3],"id" : playerId,"playerIds" : playerIds,"playerControllers" : playerControllers})
        playerIds.append(playerId)
        playersPosition.append(position0)
        playersRotation.append(rotation0)
        playerDict = {"id" : playerId,"controllers" : controllers,"position" : playersPosition[-1],"rotation" : playersRotation[-1]}
        for k in range(0,controllers):
            playerDict["posC"+str(k)] = (0,0,0)
            playerDict["rotC"+str(k)] = (0,0,0,1)
        playersList.append(playerDict)

        playerNumber+=1
        
        try:
            await playersSocket[-1].send(dataWorld)
        except:
            pass
        return playerId



async def unregister(idPlayer,websocket):
    global playersSocket
    global playersList
    global playersIds
    global playerNumber
    global playerIds
    register = True
    while register:
        try:
            playersSocket.remove(websocket)
            register = False
        except:
            pass
    del playersList[playerIds.index(idPlayer)]
    playerIds.remove(idPlayer)
    playerNumber -= 1
    for player in playersSocket:
        try:
            remPlayer = struct.pack('B', networkCode['removePlayer'])
            remPlayer += struct.pack('<i',idPlayer)

            await player.send(remPlayer)
        except:
            pass

async def send(websocket,message):

    
    for player in playersSocket:
        if player is not websocket:
            try:
                await player.send(message)
            except:
                pass
        

def storePosition(code,idPlayer,message):
    #print(len(message))
    idx = playerIds.index(idPlayer)
    #print(playersPosition[playerIds.index(idPlayer)])
    #print(struct.unpack('<fffffff',message[1:29]))

    #print(playersList[idx]['position'])
    playersList[idx]['position'] = struct.unpack('<fff',message[1:13])
    playersList[idx]['rotation'] = struct.unpack('<ffff',message[13:29])
    for k in range(0,playersList[idx]['controllers']):
        playersList[idx]["posC"+str(k)] = struct.unpack('<fff',message[29+k*28:41+k*28])
        playersList[idx]["rotC"+str(k)] = struct.unpack('<ffff',message[41+k*28:57+k*28])
    playersPosition[idx] = playersList[idx]['position']
    playersRotation[idx] = playersList[idx]['rotation']

    player = playersList[idx]

    message = struct.pack('B', networkCode['objectPosition'])
    message += struct.pack('<i', idPlayer)
    message += struct.pack('<fff',player['position'][0],\
                                    player['position'][1],\
                                    player['position'][2])
    message += struct.pack('<ffff',player['rotation'][0],\
                                    player['rotation'][1],\
                                    player['rotation'][2],\
                                    player['rotation'][3])

    for k in range(0,player['controllers']):
        message += struct.pack('<fff',player["posC"+str(k)][0],\
                                        player["posC"+str(k)][1],\
                                        player["posC"+str(k)][2])
        message += struct.pack('<ffff',player["rotC"+str(k)][0],\
                                        player["rotC"+str(k)][1],\
                                        player["rotC"+str(k)][2],\
                                        player["rotC"+str(k)][3])
    #print(message)
    return message


    


async def manager(websocket, path):
    global nextPlayer
    print("ws : "+str(websocket))
    print("pa : "+str(path))
    idPlayer = await register(websocket)
    tSend=time.time()

    try:
        async for message in websocket:

                
            
            code = message[0]
            #print(code)
            try:
                if code == networkCode['playerPosition'] and len(websocket.messages) == 0 and idPlayer == playerIds[nextPlayer] and playerNumber>0:
                    messageSend = storePosition(code,idPlayer,message)
                    #t1=time.time()
                    #print("id : "+str(idPlayer)+" t :"+str(1/(t1-t0)))
                    #t0=t1
                    await send(websocket,messageSend)
                    nextPlayer = ((nextPlayer+1)%playerNumber)
                    tSend = time.time()
            except Exception as e:
                print(e)
                nextPlayer = ((nextPlayer+1)%playerNumber)
            if time.time()-tSend>0.05:
                nextPlayer = ((nextPlayer+1)%playerNumber)
                
    finally:
        await unregister(idPlayer,websocket)
        print("unregistered")




def main():
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_context.load_cert_chain(homeFolder+certFolder+"cert.pem",keyfile=homeFolder+certFolder+"privkey.pem")

    start_server = websockets.serve(
        manager, getLocalIP(), 6785, ssl=ssl_context,max_queue = None
    )

    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()




if __name__ == "__main__":
    main()
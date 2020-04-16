
import asyncio
import pathlib
import ssl
import websockets
import socket
import logging
import time
import json
import threading
import struct
import csv

homeFolder = "/home/ubuntu/"
networkCodePath = homeFolder+"la-matrice/web/js/network/networkCode.csv"
certFolder = "cert/"

networkCode = []

playersSocket = []
playersPosition = []
playerIds = []
playerId = 0
playerNumber = 0

#logger = logging.getLogger('websockets')
#logger.setLevel(logging.INFO)
#logger.addHandler(logging.StreamHandler())


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




async def register(websocket):
    global playerNumber
    global playerIds
    global playerId
    global players
    playerNumber+=1
    playerId+=1
    try:
        playerData = await websocket.recv()
    except:
        pass
    print(playerData)
    playerInfo = struct.unpack('BB',playerData)
    
    print(playerInfo)
    if playerInfo[0] == networkCode['connect']:
        controllers = playerInfo[1]


        for player in playersSocket:
        
            dataWorld = struct.pack('<BiiB', networkCode['newPlayer'],0, playerId,controllers)
            
            print(dataWorld);
            await player.send( dataWorld)
        
            
                    
        playersSocket.append(websocket)
        dataWorld = struct.pack('B', networkCode['world'])
        dataWorld += struct.pack('<i',playerId)

        for k in range(0,len(playerIds)):
            dataWorld += struct.pack('<i', playerIds[k])
            dataWorld += struct.pack('B', controllers)

        #world = json.dumps({"world" : 1, "objects" : [2,3],"id" : playerId,"playerIds" : playerIds,"playerControllers" : playerControllers})
        playerIds.append(playerId)
        playerDict = {"id" : playerId,"controllers" : controllers,"position" : (0,0,0),"rotation" : (0,0,0,0)}
        for k in range(0,controllers):
            playerDict["posC"+str(k)] = (0,0,0)
            playerDict["rotC"+str(k)] = (0,0,0,0)
        playersPosition.append(playerDict)
        
        try:
            await playersSocket[-1].send(dataWorld)
        except:
            pass
        return playerId



async def unregister(idPlayer,websocket):
    global playersSocket
    global playersPosition
    global playersId
    global playerNumber
    global playerIds
    register = True
    while register:
        try:
            playersSocket.remove(websocket)
            register = False
        except:
            pass
    del playersPosition[playerIds.index(idPlayer)]
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
                await player.send(str(message))
            except:
                pass
        

def storePosition(code,idPlayer,message):
    print(len(message))
    print(playersPosition[playerIds.index(idPlayer)])
    print(struct.unpack('<fffffff',message[1:29]))
    playersPosition[playerIds.index(idPlayer)]['position'] = struct.unpack('<fff',message[1:13])
    playersPosition[playerIds.index(idPlayer)]['rotation'] = struct.unpack('<ffff',message[13:29])
    for k in range(0,playersPosition[playerIds.index(idPlayer)]['controllers']):
        playersPosition[playerIds.index(idPlayer)]["posC"+str(k)] = struct.unpack('<fff',message[29+k*28:41+k*28])
        playersPosition[playerIds.index(idPlayer)]["rotC"+str(k)] = struct.unpack('<ffff',message[41+k*28:57+k*28])

    message = struct.pack('B', networkCode['objectPosition'])
    message += struct.pack('<i', idPlayer)
    message += struct.pack('<fff',playersPosition[playerIds.index(idPlayer)]['position'][0],\
                                    playersPosition[playerIds.index(idPlayer)]['position'][1],\
                                    playersPosition[playerIds.index(idPlayer)]['position'][2])
    message += struct.pack('<ffff',playersPosition[playerIds.index(idPlayer)]['rotation'][0],\
                                    playersPosition[playerIds.index(idPlayer)]['rotation'][1],\
                                    playersPosition[playerIds.index(idPlayer)]['rotation'][2],\
                                    playersPosition[playerIds.index(idPlayer)]['rotation'][3])
    for k in range(0,playersPosition[playerIds.index(idPlayer)]['controllers']):
        message += struct.pack('<fff',playersPosition["posC"+str(k)]['position'][0],\
                                        playersPosition["posC"+str(k)]['position'][1],\
                                        playersPosition["posC"+str(k)]['position'][2])
        message += struct.pack('<ffff',playersPosition["rotC"+str(k)]['rotation'][0],\
                                        playersPosition["rotC"+str(k)]['rotation'][1],\
                                        playersPosition["rotC"+str(k)]['rotation'][2],\
                                        playersPosition["rotC"+str(k)]['rotation'][3])
    return message


    


async def manager(websocket, path):
    print("ws : "+str(websocket))
    print("pa : "+str(path))
    idPlayer = await register(websocket)
    try:
        async for message in websocket:
            code = message[0]
            #print("code : "+str(code))
            if code == networkCode['playerPosition']:
                storePosition(code,idPlayer,message)
            await send(websocket,message)
    finally:
        await unregister(idPlayer,websocket)
        print("unregistered")




def main():
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_context.load_cert_chain(homeFolder+certFolder+"cert.pem",keyfile=homeFolder+certFolder+"privkey.pem")

    start_server = websockets.serve(
        manager, getLocalIP(), 6785, ssl=ssl_context
    )

    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()




if __name__ == "__main__":
    main()
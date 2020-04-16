
import asyncio
import pathlib
import ssl
import websockets
import socket
import logging
import time
import json
import threading
import networkCode
import struct

homeFolder = "/home/ubuntu/"
certFolder = "cert/"

players = []
playersPosition = []
playersRotation = []
playerIds = []
playerControllers = []
playerId = 0
playerNumber = 0

#logger = logging.getLogger('websockets')
#logger.setLevel(logging.INFO)
#logger.addHandler(logging.StreamHandler())

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
    print(struct.unpack('ii',playerData))
    playerInfo = json.loads(playerData)

    controllersN = playerInfo["controllers"]

    for player in players:
        try:
            await player.send( json.dumps({'newPlayer' : playerId,'type' : 0 ,'controllers':controllersN}))
        except:
            pass
                
    players.append(websocket)
    world = json.dumps({"world" : 1, "objects" : [2,3],"id" : playerId,"playerIds" : playerIds,"playerControllers" : playerControllers})
    playerIds.append(playerId)
    playerControllers.append(controllersN)
    try:
        await players[-1].send(world)
    except:
        pass
    return playerId



async def unregister(idPlayer,websocket):
    global players
    global playerNumber
    global playerIds
    register = True
    while register:
        try:
            players.remove(websocket)
            register = False
        except:
            pass
    del playerControllers[playerIds.index(idPlayer)]
    playerIds.remove(idPlayer)
    playerNumber -= 1
    for player in players:
        try:
            await player.send( json.dumps({'remPlayer' : idPlayer }))
        except:
            pass

async def send(websocket,message):
    #message = await players[-1].recv()
    
    for player in players:
        if player is not websocket:
            try:
                await player.send(str(message))
            except:
                pass
        

async def manager(websocket, path):
    print("ws : "+str(websocket))
    print("pa : "+str(path))
    idPlayer = await register(websocket)
    try:
        async for message in websocket:
            
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
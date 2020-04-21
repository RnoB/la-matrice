import sys
import asyncio
import pathlib
import ssl
import websockets
import socket
import logging
import time
import threading
import struct
import time
import numpy as np
import tools
import traceback

networkCode = tools.getNetworkCode()
objectsType = tools.getObjectsType()



#logger = logging.getLogger('websockets')
#logger.setLevel(logging.INFO)
#logger.addHandler(logging.StreamHandler())

class Server:

    async def addObject(self,objectType,position0 = [0,0,0],rotation0 = [0,0,0,1]):
        self.playerId+=1
        dataWorld = struct.pack('B', networkCode['newObject'])
        dataWorld += struct.pack('<ii',self.playerId,objectType)
        dataWorld += struct.pack('<fffffff',position0[0],position0[1],position0[2],\
                                    rotation0[0],rotation0[1],rotation0[2],rotation0[3])
        objectDict = {"id" : self.playerId,"type" : objectType,"position" : position0,"rotation" : rotation0}
        objectsList.append(objectDict)
        for player in self.playersSocket:
            try:
                await player.send(message)
            except Exception as e:
                print(traceback.format_exc())

    async def removeObject(self,objectId):
        self.playerId+=1
        idx = self.playerIds.index(objectId)
        del self.playersList[idx]
        for player in self.playersSocket:
            try:
                await player.send(message)
            except Exception as e:
                print(traceback.format_exc())


    async def send(self,websocket,message):

        
        for player in self.playersSocket:
            if player is not websocket:
                try:
                    await player.send(message)
                except Exception as e:
                    print(traceback.format_exc())


    async def register(self,websocket):

        self.playerId+=1
        try:
            playerData = await websocket.recv()
        except Exception as e:
            print(traceback.format_exc())

        playerInfo = struct.unpack('BB',playerData)
        

        if playerInfo[0] == networkCode['connect']:
            controllers = playerInfo[1]
            position0,rotation0 = tools.initialPosition(self.playersPosition)


            for player in self.playersSocket:
                dataWorld = struct.pack('<BiiB', networkCode['newPlayer'],objectsType["player"], self.playerId,controllers)
                try:
                    await player.send( dataWorld)
                except Exception as e:
                    print(traceback.format_exc())
            
                
                        
            self.playersSocket.append(websocket)
            dataWorld = struct.pack('B', networkCode['world'])
            dataWorld += struct.pack('<i',self.playerId)
            dataWorld += struct.pack('<fffffff',position0[0],position0[1],position0[2],\
                                        rotation0[0],rotation0[1],rotation0[2],rotation0[3])

            for k in range(0,len(self.playerIds)):
                dataWorld += struct.pack('<i', self.playerIds[k])
                dataWorld += struct.pack('B', self.playersList[k]['controllers'])

            self.playerIds.append(self.playerId)
            self.playersPosition.append(position0)
            self.playersRotation.append(rotation0)
            playerDict = {"id" : self.playerId,"controllers" : controllers,"position" : position0,"rotation" : rotation0}
            for k in range(0,controllers):
                playerDict["posC"+str(k)] = (0,0,0)
                playerDict["rotC"+str(k)] = (0,0,0,1)
            self.playersList.append(playerDict)

            self.playerNumber+=1
            
            try:
                await self.playersSocket[-1].send(dataWorld)
            except Exception as e:
                print(traceback.format_exc())
        return self.playerId


    async def unregister(self,idPlayer,websocket):
        register = True
        while register:
            try:
                self.playersSocket.remove(websocket)
                register = False
            except Exception as e:
                print(traceback.format_exc())
        idx = self.playerIds.index(idPlayer)
        del self.playersList[idx]
        del self.playersRotation[idx]
        del self.playersPosition[idx]
        self.playerIds.remove(idPlayer)
        self.playerNumber -= 1
        for player in self.playersSocket:
            try:
                remPlayer = struct.pack('B', networkCode['removePlayer'])
                remPlayer += struct.pack('<i',idPlayer)

                await player.send(remPlayer)
            except Exception as e:
                print(traceback.format_exc())


    async def manager(self,websocket, path):
        
        print("--- New Player enters !! ---")
        idPlayer = await self.register(websocket)
        tSend=time.time()

        try:
            async for message in websocket:
                
                code = message[0]

                try:
                    if code == networkCode['playerPosition'] and len(websocket.messages) == 0 and idPlayer == self.playerIds[self.nextPlayer] and self.playerNumber>0:
                        idx = self.playerIds.index(idPlayer)
                        player = self.playersList[idx]
                        player = tools.readPosition(message,player)
                        self.playersPosition[idx] = player['position']
                        self.playersRotation[idx] = player['rotation']
                        messageSend = tools.messagePosition(networkCode['objectPosition'],player)


                        await self.send(websocket,messageSend)
                        self.nextPlayer = ((self.nextPlayer+1)%self.playerNumber)
                        tSend = time.time()
                except Exception as e:
                    print(traceback.format_exc())
                    self.nextPlayer = ((self.nextPlayer+1)%self.playerNumber)
                if time.time()-tSend>0.05:
                    self.nextPlayer = ((self.nextPlayer+1)%self.playerNumber)
                    
        finally:
            await self.unregister(idPlayer,websocket)
            print("unregistered")


    def __init__(self,port = 6799,cert ="cert.pem",key = "privkey.pem"):
        self.playersSocket = []
        self.playerIds = []
        self.playerId = 0
        self.playerNumber = 0
        self.nextPlayer = 0
        self.playersPosition = []
        self.playersRotation = []
        self.playersList = []
        self.objectsPosition = []
        self.objectsRotation = []
        self.objectsList = []
        self.t0 = time.time()
        ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        ssl_context.load_cert_chain(cert,key)

        start_server = websockets.serve(
            self.manager, tools.getLocalIP(), port, ssl=ssl_context,max_queue = None
        )

        asyncio.get_event_loop().run_until_complete(start_server)
        asyncio.get_event_loop().run_forever()


def startServer(port,cert,key,server):
    global server
    asyncio.set_event_loop(asyncio.new_event_loop())
    server = Server(port = port,cert = cert,key = key)


def main():


    port = sys.argv[1]
    cert = sys.argv[2]
    key = sys.argv[3]
    

    serverThread = threading.Thread(target=startServer, args=(port, cert,key,server))
    serverThread.daemon = True
    serverThread.start()

    k = 0
    while True:
        time.sleep(10)
        print(server)
        server.addObject(2000,[k,1.5,5])
        k = k+1




if __name__ == "__main__":
    main()
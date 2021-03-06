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
import uuid

networkCode = tools.getNetworkCode()
objectsType = tools.getObjectsType()

dataPath = "c:/Users/renaud/Dropbox/Matrice/data/"

#logger = logging.getLogger('websockets')
#logger.setLevel(logging.INFO)
#logger.addHandler(logging.StreamHandler())

class Server:

    def addObject(self,objectType,position = [0,0,0],rotation = [0,0,0,1],scale= [1,1,1]):
        self.playerId+=1

        objectDict = {"id" : self.playerId,"type" : objectType,"position" : position,"rotation" : rotation,"scale" : scale,"controllers":0,'time':time.time()-self.t0}
        self.objectsNew.append(objectDict)
        self.objectBuffer.append(objectDict)
        if self.writeBufferSize>0:
            self.objectBuffer.append(objectDict)
        return objectDict['id']
        

    def removeObject(self,objectId):
        self.objectsRem.append(objectId)
        

    def moveObject(self,objectId,objectType,position = [0,0,0],rotation = [0,0,0,1],scale= None):


        objectDict = {"id" : objectId,"type":objectType,"position" : position,"rotation" : rotation,"scale" : scale,"controllers" : 0,'time':time.time()-self.t0}
        self.objectsMove.append(objectDict)
        if self.writeBufferSize>0:
            self.objectBuffer.append(objectDict)
        





    async def checkObject(self):
        self.lockObject = True

        for objecte in self.objectsNew:



            dataWorld = struct.pack('B', networkCode['newObject'])
            dataWorld += struct.pack('<i',objecte['type'])
            dataWorld += tools.updatePacker(objecte,noRotation = False,noControllers = True,noScale = False)

            position0 = objecte['position']
            rotation0 = objecte['rotation']
            scale0 = objecte['scale']

            self.objectsList.append(objecte)
            self.objectsNew.remove(objecte)
            self.objectsIds.append(objecte['id'])
            for player in self.playersSocket:
                try:
                    await player.send(dataWorld)
                except Exception as e:
                    print(traceback.format_exc())


        for objectId  in self.objectsRem:
            dataWorld = struct.pack('B', networkCode['removeObject'])
            dataWorld += struct.pack('<i',objectId)

            try:
                idx = self.objectsIds.index(objectId)
                del self.objectsList[idx]
                del self.objectsIds[idx]
                self.objectsRem.remove(objectId)
                for player in self.playersSocket:
                    try:
                        await player.send(dataWorld)
                    except Exception as e:
                        print(traceback.format_exc())
            except Exception as e:
                print(traceback.format_exc())
                try:
                    self.objectsRem.remove(objectId)
                except Exception as e:
                    print(traceback.format_exc())

        for k in range(0,len(self.objectsMove)):
            
            messageSend = tools.messagePosition(networkCode["objectPosition"],self.objectsMove[0],self.noRotation)
            del self.objectsMove[0]
            for player in self.playersSocket:
                try:
                    await player.send(messageSend)
                except Exception as e:
                    print(traceback.format_exc())
        self.lockObject = False



    async def send(self,websocket,message):

        
        for player in self.playersSocket:
            if player is not websocket:
                try:
                    await player.send(message)
                except Exception as e:
                    print(traceback.format_exc())
        if not self.lockObject:
            await self.checkObject()


    async def testLag(self,websocket):
        timeData = await websocket.recv()
        playerInfo = struct.unpack('<Bd',timeData)
        
        if playerInfo[0] == networkCode['lagTesting']:
            t0 = time.time()
            dataTime = struct.pack('B', networkCode['lagReturn'])
            dataTime += struct.pack('<d', t0)
            await websocket.send(dataTime)
            timeData = await websocket.recv()
            
            playerInfo = struct.unpack('<Bd',timeData)
            if playerInfo[0] == networkCode['lagTesting']:
                t1 = time.time()
        return t1-t0




    async def register(self,websocket):
        scale=1
        self.playerId+=1
        try:
            playerData = await websocket.recv()
        except Exception as e:
            print(traceback.format_exc())

        playerInfo = struct.unpack('BB',playerData)
            
        try:
            lag = await self.testLag(websocket)
        except Exception as e:
            print(traceback.format_exc())

        if playerInfo[0] == networkCode['connect']:
            if self.noControllers:
                controllers = 0
            else:
                controllers = playerInfo[1]
            #print(playerInfo[1])
            position0,rotation0 = tools.initialPosition(self.playersPosition)


            for player in self.playersSocket:
                dataWorld = struct.pack('<BiiB', networkCode['newPlayer'],objectsType["player"], self.playerId,controllers)
                
                dataWorld +=struct.pack('<i',scale)
     
                try:
                    await player.send( dataWorld)
                except Exception as e:
                    print(traceback.format_exc())
            
                
                        
            self.playersSocket.append(websocket)
 
            dataWorld = struct.pack('B', networkCode['world'])
            dataWorld += struct.pack('<iiii',self.world,self.playerNumber,len(self.objectsList),self.playerId)
            dataWorld += struct.pack('B', self.noRotation)
            dataWorld += struct.pack('B', self.noControllers)
            dataWorld += struct.pack('<i', scale)
            dataWorld += struct.pack('<fffffff',position0[0],position0[1],position0[2],\
                                        rotation0[0],rotation0[1],rotation0[2],rotation0[3])

            for k in range(0,len(self.playerIds)):
                dataWorld += struct.pack('<ii', objectsType["player"],self.playerIds[k])
                dataWorld += struct.pack('B', self.playersList[k]['controllers'])
                dataWorld += struct.pack('<i', scale)

            self.playerIds.append(self.playerId)
            self.playersPosition.append(position0)
            self.playersRotation.append(rotation0)
            playerDict = {"id" : self.playerId,"type":objectsType['player'],"controllers" : controllers,"position" : position0,"rotation" : rotation0,"scale":scale,"lag":lag,"positionBuffer":[],"rotationBuffer":[],"timeBuffer":[]}


            for k in range(0,controllers):
                playerDict["posC"+str(k)] = (0,0,0)
                playerDict["rotC"+str(k)] = (0,0,0,1)
                playerDict["posC"+str(k)+"Buffer"] = []
                playerDict["rotC"+str(k)+"Buffer"] = []
            self.playersList.append(playerDict)

            self.playerNumber+=1
            for objecte in self.objectsList:
                dataWorld += struct.pack('<i',objecte['type'])
                position0 = objecte['position']
                rotation0 = objecte['rotation']
                scale0 = objecte['scale']
                dataWorld += tools.updatePacker(objecte,noRotation=False,noControllers = True,noScale = False)
                
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
        self.tSend=time.time()

        try:
            async for message in websocket:
                
                code = message[0]
                tB = time.time()-self.t0

                try:
                    if code == networkCode['playerPosition'] and len(websocket.messages) == 0 and \
                    self.playerNumber>0:# and idPlayer == self.playerIds[self.nextPlayer]:
                        #self.nextPlayer = ((self.nextPlayer+1)%self.playerNumber)
                        #print('sending Time : ' + str(1/(time.time()-self.tSend)))
                        self.tSend = time.time()
                        t0 = time.time()
                        idx = self.playerIds.index(idPlayer)
                        player = self.playersList[idx]
                        player = tools.readPosition(message,player,self.noRotation)
                        if self.bufferSize+self.writeBufferSize>0:
                            tools.addtoBuffer(player,t0-self.t0,self.noRotation)
                        self.playersPosition[idx] = player['position']
                        self.playersRotation[idx] = player['rotation']
                        messageSend = tools.messagePosition(networkCode['playerPosition'],player)


                        await self.send(websocket,messageSend)
                        #print("player id    : "+str(idPlayer))
                        #print('process Time : ' + str(1/(time.time()-t0)))
                    else:
                        self.packetDrop +=1
                        if self.packetDrop%1 == 0:
                            print("packetDrop : "+ str(self.packetDrop))
                        

                except Exception as e:
                    print(traceback.format_exc())
                #try:
                    tE = time.time()-self.t0
                    #print('dt : '+str(1/(tE-tB))+' tB : '+str(tB)+' tE : '+str(tE))
                #except Exception as e:
                    #print('dt : '+str(0)+' tB : '+str(tB)+' tE : '+str(tE))
                    
        finally:
            await self.unregister(idPlayer,websocket)
            print("unregistered")

    def start(self):
        start_server = websockets.serve(
            self.manager, tools.getLocalIP(), self.port, ssl=self.ssl_context,max_queue = None
        )

        asyncio.get_event_loop().run_until_complete(start_server)
        asyncio.get_event_loop().run_forever()

    def writeFile(self):

        while(True):

            for player in self.playersList:

                if len(player['timeBuffer'])>self.writeBufferSize+self.bufferSize:
                    tools.writeBuffer(self.filePath,player,self.expId,self.writeBufferSize,self.noRotation)

            if len(self.objectBuffer)>self.writeObjectBufferSize:
                tools.writeObjectBuffer(self.filePath,self.objectBuffer,self.writeObjectBufferSize,self.noRotation)

            time.sleep(.1)



    def __init__(self,port = 6799,cert ="cert.pem",key = "privkey.pem",noRotation = False,noControllers = False,world = 0,bufferSize = 0,writeBufferSize = 0,writeObjectBufferSize = 1):
        self.playersSocket = []
        self.playerIds = []
        self.playerId = 0
        self.playerNumber = 0
        self.nextPlayer = 0
        self.world = world
        self.playersPosition = []
        self.playersRotation = []
        self.playersPositionBuffer = []
        self.playersRotationBuffer = []
        self.playersList = []
        self.objectsPosition = []
        self.objectsRotation = []
        self.objectsList = []

        self.objectsNew = []
        self.objectsRem = []
        self.objectsIds = []
        self.objectsMove = []
        self.objectBuffer = []

        self.bufferSize = bufferSize
        self.writeBufferSize = writeBufferSize
        self.writeObjectBufferSize = writeObjectBufferSize

        self.t0 = time.time()
        self.ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        self.ssl_context.load_cert_chain(cert,key)
        self.port = port

        self.lockObject = False

        self.packetDrop = 0
        self.tSend = 0

        self.noRotation = noRotation
        self.noControllers = noControllers
        self.expId = str(uuid.uuid4())
        self.filePath = tools.filePath(dataPath,self.expId)+'/position.csv'

        if self.writeBufferSize+self.bufferSize>0:
            fileThread = threading.Thread(target=self.writeFile)
            fileThread.daemon = True
            fileThread.start()



def startServer(port,cert,key,noRotation = False,noControllers = False,world = 0):
    global server
    asyncio.set_event_loop(asyncio.new_event_loop())

    server = Server(port = port,cert = cert,key = key,noRotation = noRotation,noControllers = noControllers,world=world)

    server.start()


def startSimulation():
    k = 0
    running = False
    while not running:
        try:
            print(server)
            running=True
        except:
            time.sleep(.1)
    objectId = server.addObject(2000,position = [k/3.0,1.5,-1],scale= [.5,1,.6])
    objectId = server.addObject(2000,position = [k/3.0,1.5,-1],scale= [.5,1,.6])
        
    while True:
        time.sleep(.1)

        server.moveObject(objectId,[5*np.cos(k),0,5*np.sin(k)])

        #if len(server.objectsList)>10:

        #    server.removeObject(server.objectsIds[0])
        k+=.01
        #if k>10:
        #    k=-10


def main():


    port = sys.argv[1]
    cert = sys.argv[2]
    key = sys.argv[3]
    noRotation = False
    noControllers = False
    world = 1
    serverThread = threading.Thread(target=startServer, args=(port, cert,key,noRotation,noControllers,world))
    serverThread.daemon = True
    serverThread.start()
    simuThread = threading.Thread(target=startSimulation)
    simuThread.daemon = True
    simuThread.start()


    while True:
        time.sleep(60)
        




if __name__ == "__main__":
    main()
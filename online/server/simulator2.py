import serverWS
import numpy as np
import sys
import threading
import time
import asyncio
import random
import tools
dataPath = "../../data/"





def startSimulation(world,project,simulation,variation,frameRate):
    k = 0
    running = False
    while not running:
        try:
            print(server)
            running=True
            
        except:
            time.sleep(.1)
    tools.addToDb(server.expId,project,simulation,variation,frameRate)
    objectId = []
    objectType = []
    position = []
    speed = []
    speedPow = []
    targetPosition = [1,1,1] 
    # objectType.append(2001)
    # objectId.append(server.addObject(objectType[-1],position = [0,0,0],scale= [.05,.05,.05])) 
    # objectType.append(2002)
    # objectId.append(server.addObject(objectType[-1],position = targetPosition,scale= [.2,.2,.2]))
    
    for k in range(-1,1):
        for j in range(-1,1):
           x = k+random.uniform(-2,2)
           y = j+random.uniform(-2,2)
           objectId.append(server.addObject(2000,position = [x,0,y],scale= [.1,1,.1]))
           position.append([x,0,y])
           speed.append(random.uniform(.000001, .001))
           speedPow.append(random.uniform(1, 3))
        #objectId = server.addObject(2000,position = [k/3.0,1.5,-1],scale= [.5,1,.6])

    while True:

        time.sleep(.05)
        # nPlayers = len(server.playersList)
        # if nPlayers>1:
        #     position = np.array((0.0,0.0,0.0))
        #     for player in server.playersList:
                
        #         position += np.array(player['position'])/nPlayers

        #     server.moveObject(objectId[0],objectType[0],position.tolist())
        #     if (position[0]-targetPosition[0])**2+(position[1]-targetPosition[1])**2+(position[2]-targetPosition[2])**2<0.01:
        #         targetPosition = [random.uniform(-2,2),random.uniform(.5,2),random.uniform(-2,2)]
        #         server.moveObject(objectId[1],objectType[1],targetPosition)

        for k in range(0,len(objectId)):
           position[k][1]+=(speed[k]*k)**speedPow[k]
           server.moveObject(objectId[k],position[k])

        #if len(server.objectsList)>10:

        #   server.removeObject(server.objectsIds[0])
        
        #if k>10:
        #   k=-10


def startServer(port,cert,key,noRotation = False,noControllers = False,world = 0,writeBufferSize = 0):
    global server
    asyncio.set_event_loop(asyncio.new_event_loop())

    server = serverWS.Server(port = port,cert = cert,key = key,noRotation = noRotation,noControllers = noControllers,world=world,writeBufferSize=writeBufferSize)

    server.start()






def main():


    port = sys.argv[1]
    cert = sys.argv[2]
    key = sys.argv[3]
    simulation = 0
    frameRate = 60
    noRotation = False
    noControllers = False
    writeBufferSize = 10
    world = 0
    project = "test"
    variation = 0
    serverThread = threading.Thread(target=startServer, args=(port, cert,key,noRotation,noControllers,world,writeBufferSize))
    serverThread.daemon = True
    serverThread.start()
    simuThread = threading.Thread(target=startSimulation,args=(world,project,simulation,variation,frameRate))
    simuThread.daemon = True
    simuThread.start()

    
        #server.moveObject(objectId,[5*np.cos(k),0,5*np.sin(k)])

        #if len(server.objectsList)>10:

        #    server.removeObject(server.objectsIds[0])
        
        #if k>10:
        #    k=-10


    while True:
        time.sleep(60)

if __name__ == "__main__":
    main()
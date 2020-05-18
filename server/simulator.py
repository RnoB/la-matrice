import serverWS
import numpy as np


dataPath = "../../data/"





def startSimulation(simulation,framerate):
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
        time.sleep(frameRate)

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
    simulation = 0
    frameRate = 60
    noRotation = False
    noControllers = False
    world = 0
    serverThread = threading.Thread(target=serverWS.startServer, args=(port, cert,key,noRotation,noControllers,world))
    serverThread.daemon = True
    serverThread.start()
    simuThread = threading.Thread(target=startSimulation,args(simulation,frameRate))
    simuThread.daemon = True
    simuThread.start(frameRate)


    while True:
        time.sleep(60)
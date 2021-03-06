import numpy as np
import socket
import csv
import struct
import os
import datetime
import sqlite3

homeFolder = ""
networkCodePath = homeFolder+"web/js/network/networkCode.csv"
objectTypePath = homeFolder+"web/js/network/objectType.csv"
dbPath = homeFolder+"db/matricematrice.db"


def addToDb(expId,project,simulation,variation,frameRate):
    conn = sqlite3.connect(dbPath)
    c = conn.cursor()

    today = datetime.date.today().strftime("%y-%m-%d")
    tStart = datetime.datetime.now().strftime("%H:%M:%S")
    values = [project,simulation,variation,today,tStart,expId]
    c.execute("INSERT INTO experiments VALUES (?,?,?,?,?,?)",values)
    conn.commit()
    conn.close()



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


def initialPosition(playersPosition):
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


def readPosition(message,player,noRotation):
    offset = 1
    player['position'] = struct.unpack('<fff',message[offset:offset+12])
    offset+=12
    if not noRotation:
        player['rotation'] = struct.unpack('<ffff',message[offset:offset+16])
        offset+=16
    for k in range(0,player['controllers']):
        player["posC"+str(k)] = struct.unpack('<fff',message[offset:offset+12])
        offset+=12
        if not noRotation:
            player["rotC"+str(k)] = struct.unpack('<ffff',message[offset:offset+16])
            offset+=16
    return player

def addtoBuffer(player,t0,noRotation=False):
    player['timeBuffer'].append(t0)
    player['positionBuffer'].append(player['position'])
    if not noRotation:
        player['rotationBuffer'].append(player['rotation'])
        
    for k in range(0,player['controllers']):
        player["posC"+str(k)+"Buffer"].append(player["posC"+str(k)])
        
        if not noRotation:
            player["rotC"+str(k)+"Buffer"].append(player["rotC"+str(k)])
            
    return player



def writeBuffer(path,player,expId,writeBufferSize,noRotation):

    line = ''
    for k in range(0,writeBufferSize):
        line += str(player['id'])
        line += ','+str(player['type'])
        line += ','+str(player['timeBuffer'][0])
        line += ','+str(player['positionBuffer'][0]).strip('()[]')

        del player['positionBuffer'][0]
        if not noRotation:
            line += ','+str(player['rotationBuffer'][0]).strip('()[]')
            del player['rotationBuffer'][0]
        line +='\n'
        
        for k in range(0,player['controllers']):
            line += str(player['id'])
            line += ','+str(player['type']+1+k)
            line += ','+str(player['timeBuffer'][0])
            line += ','+str(player['posC'+str(k)+'Buffer'][0]).strip('()[]')
            del player["posC"+str(k)+"Buffer"][0]

            if not noRotation:
                line += ','+str(player['rotC'+str(k)+'Buffer'][0]).strip('()[]')
                del player["rotC"+str(k)+"Buffer"][0]
            line +='\n'
        del player['timeBuffer'][0]
    f = open(path,'a')
    f.write(line)
    f.close()

def writeObjectBuffer(path,player,writeBufferSize,noRotation):

    line = ''
    #print(player)
    for k in range(0,writeBufferSize):
        line += str(player[0]['id'])
        try:
            line += ','+str(player[0]['type'])
        except:
            line+=','
        line += ','+str(player[0]['time'])
        line += ','+str(player[0]['position']).strip('()[]')
        #print(player[0]['position'])
        #print(player[0])
        if not noRotation:
            line += ','+str(player[0]['rotation']).strip('()[]')
        del player[0]

        line +='\n'
    #print(line)
    f = open(path,'a')
    f.write(line)
    f.close()

def filePath(path,expId,params = []):
    path = path + str(expId)
    if not os.path.exists(path):
        os.makedirs(path)
    for param in params:
        path = path + '/' + str(param)
        if not os.path.exists(path):
            os.makedirs(path)
    return path


def messagePosition(code,player,noRotation = False,noControllers = False,noScale = True):
    message = struct.pack('B', code)
    message += updatePacker(player,noRotation,noControllers,noScale)

    return message

def updatePacker(player,noRotation = False,noControllers = False,noScale = True):

    message = struct.pack('<i', player['id'])
    message += struct.pack('<fff',player['position'][0],\
                                    player['position'][1],\
                                    player['position'][2])
    if not noRotation:
        message += struct.pack('<ffff',player['rotation'][0],\
                                    player['rotation'][1],\
                                    player['rotation'][2],\
                                    player['rotation'][3])

    if not noScale:
        message += struct.pack('<fff',player['scale'][0],\
                                    player['scale'][1],\
                                    player['scale'][2])
    if not noControllers:
        for k in range(0,player['controllers']):
            message += struct.pack('<fff',player["posC"+str(k)][0],\
                                            player["posC"+str(k)][1],\
                                            player["posC"+str(k)][2])
            if not noRotation:
                message += struct.pack('<ffff',player["rotC"+str(k)][0],\
                                            player["rotC"+str(k)][1],\
                                            player["rotC"+str(k)][2],\
                                            player["rotC"+str(k)][3])

    return message



def getLocalIP():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(('8.8.8.8', 1))  # connect() for UDP doesn't send packets
    localIP = s.getsockname()[0]
    s.close()
    return localIP

def getNetworkCode():
    with open(networkCodePath, mode='r') as infile:
        reader = csv.reader(infile)
        networkCode = {rows[0]:int(rows[1]) for rows in reader}
    print(networkCode)
    return networkCode

def getObjectsType():
    with open(objectTypePath, mode='r') as infile:
        reader = csv.reader(infile)
        objectType = {rows[0]:int(rows[1]) for rows in reader}
    print(objectType)
    return objectType
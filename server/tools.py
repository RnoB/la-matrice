import numpy as np
import socket
homeFolder = "/home/ubuntu/"
networkCodePath = homeFolder+"la-matrice/web/js/network/networkCode.csv"
objectTypePath = homeFolder+"la-matrice/web/js/network/objectType.csv"

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


def readPosition(message,player):

    player['position'] = struct.unpack('<fff',message[1:13])
    player['rotation'] = struct.unpack('<ffff',message[13:29])
    for k in range(0,player['controllers']):
        player["posC"+str(k)] = struct.unpack('<fff',message[29+k*28:41+k*28])
        player["rotC"+str(k)] = struct.unpack('<ffff',message[41+k*28:57+k*28])
    return player


    
def messagePosition(code,player)
    message = struct.pack('B', networkCode['objectPosition'])
    message += struct.pack('<i', player['id'])
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

def getObjectType():
    with open(objectTypePath, mode='r') as infile:
        reader = csv.reader(infile)
        objectType = {rows[0]:int(rows[1]) for rows in reader}
    print(objectType)
    return objectType
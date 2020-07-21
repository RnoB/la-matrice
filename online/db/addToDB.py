import sqlite3
import numpy as np
import itertools
import random
import math
projects = ['Matrix','sample','demo','empty','FBVE','Matrix2']
mode = [6,2,2,0,2]
tSwitch = [10,10,90,90,10]
tExp = [90,90,5,90,90]
nSwitch = [9,9,1,1,9]
nExp = [1,3,1,1,3]

dBowl = 0.360
hWater = 0.08


pairAssociation = [[1,2,3,4,5],[1,3,2,5,4],[1,5,2,4,3],[1,4,3,5,2],[2,3,4,5,1]]
tripletAssociation = [[1,2,3,4,5],[1,2,4,3,5],[1,2,5,3,4],[1,3,4,2,5],[1,3,5,2,4],[1,4,5,2,3],[2,3,4,1,5],[2,3,5,1,4],[2,4,5,1,3],[3,4,5,1,2]]
mixAssociation = [[1,2,3,4,5],[3,4,5,1,2],[2,4,5,1,3],[1,4,5,2,3],[1,3,5,2,4],[1,2,5,3,4]]

def oneModeMatrixNet(mode):
    A=mode+np.zeros((5,5))
    #A[:,0]=-1
    #A[0,:]=-1
    np.fill_diagonal(A,-1)
    return A

def oneModeFullMatrixNet(mode,mixMod):
    A=mode[0]+np.zeros((5,5))
    #A[:,0]=-1
    #A[0,:]=-1
    np.fill_diagonal(A,-1)
    A[mixMod,mixMod]=mode[1]
    return A

def oneModeMatrixNetPairWise(mode):
    A=-1+np.zeros((5,5))
    A[1,2]=mode
    A[2,1]=mode
    A[3,4]=mode
    A[4,3]=mode

    return A

def twoModeMatrixNetPairWise(mode1,mode2):
    A=-1+np.zeros((5,5))
    A[1,2]=mode1
    A[2,1]=mode1
    A[3,4]=mode1
    A[4,3]=mode1
    A[1,1]=mode2
    A[3,3]=mode2
    A[0,0]=-1
    return A


def oneModeMatrixStar(mode,k):
    A=-1+np.zeros((5,5))
    A[k,:]=mode
    A[:,k]=mode
    A[k,k]=-1

    return A

def twoModeMatrixStar(mode1,k,mode2,j):
    A=-1+np.zeros((5,5))
    A[k,:] = mode1
    A[:,k] = mode1
    A[k,k] = -1
    A[k,j] = mode2
    A[j,k] = mode2
    return A

def oneModeMatrixDirectedStar1(mode1,k,j):
    A=-1+np.zeros((5,5))
    A[k,j] = mode1
    A[:,k] = mode1
    A[j,k] = -1
    A[k,k] = -1
    return A

def twoModeMatrixDirectedStar1(mode1,k,mode2,j):
    A=-1+np.zeros((5,5))
    A[k,j] = mode2
    A[:,k] = mode1
    A[k,k] = -1
    A[j,k] = mode2
    return A

def oneModeMatrixDirectedStar2(mode1,k,j,l):
    A=-1+np.zeros((5,5))
    A[k,j] = mode1
    A[k,l] = mode1
    A[:,k] = mode1
    A[j,k] = -1
    A[k,k] = -1
    return A

def twoModeMatrixDirectedStar2(mode1,k,mode2,j,l):
    A=-1+np.zeros((5,5))
    A[k,j] = mode2
    A[k,l] = mode1
    A[:,k] = mode1
    A[k,k] = -1
    A[j,k] = mode2
    return A    

def oneModeMatrixDirectedStar3(mode1,k,j,l,m):
    A=-1+np.zeros((5,5))
    A[k,j] = mode1
    A[k,l] = mode1
    A[k,m] = mode1
    A[:,k] = mode1
    A[j,k] = -1
    A[k,k] = -1
    return A

def twoModeMatrixDirectedStar3(mode1,k,mode2,j,l,m):
    A=-1+np.zeros((5,5))
    A[k,j] = mode2
    A[k,l] = mode1
    A[k,m] = mode1
    A[:,k] = mode1
    A[k,k] = -1
    A[j,k] = mode2
    return A 

def oneModeMatrix(mode):
    A=mode+np.zeros((5,5))
    return A

def oneModeMatrixSingle(mode):
    A=np.zeros((5,5))-1
    np.fill_diagonal(A,mode)

    return A

def twoModeMatrixSingle(mode):
    A=np.zeros((5,5))-1
    np.fill_diagonal(A,mode)
    rng=np.arange(0,5)
    A[rng,(rng+1)%5]=mode
    return A

def oneModeMatrixPair(mode,listMod):

    A= np.zeros((5,5))-1
    for k in listMod[0:2]:
        for j in listMod[0:2]:
            if k!=j:
                A[k-1,j-1] = mode[0]
    for k in listMod[2:4]:
        for j in listMod[2:4]:
            if k!=j:
                A[k-1,j-1] = mode[0]
    A[listMod[4]-1,listMod[4]-1] = mode[1]               
    return A

def twoModeMatrixNet(mode,listMod):

    A= np.zeros((5,5))-1
    for k in listMod[0:3]:
        for j in listMod[0:3]:
            if k!=j:
                A[k-1,j-1] = mode
    for k in listMod[3:5]:
        for j in listMod[3:5]:
            if k!=j:
                A[k-1,j-1] = mode

    return A

def twoModeMatrixMix(mode,listMod):

    A= np.zeros((5,5))-1
    for k in listMod[0:3]:
        for j in listMod[0:3]:
            if k!=j:
                A[k-1,j-1] = mode[0]
    for k in listMod[3:5]:
        for j in listMod[3:5]:
            if k!=j:
                A[k-1,j-1] = mode[0]
            else:
                A[k-1,j-1] = mode[1]

    return A

def twoModeMatrixNet2(mode,listMod):

    A = np.zeros((5,5))-1
    for k in listMod[0:2]:
        for j in listMod[0:2]:
            if k!=j:
                A[k-1,j-1] = mode[0]
            else:
                A[k-1,j-1] = mode[1]
    for k in listMod[2:4]:
        for j in listMod[2:4]:
            if k!=j:
                A[k-1,j-1] = mode[0]
            else:
                A[k-1,j-1] = mode[1]
    A[listMod[4]-1,listMod[4]-1] = mode[1]

    return A

def associativeMatrix(mode,n):
    A=[]
    A=oneModeMatrix(0)
    fishVR = [1,2,3,4]
    combinationList = [] 
    for comb in itertools.combinations([1,2,3,4],n):
        combinationList.append(comb)
        print(combinationList)
    if n==2:
        A[combinationList[0][0],combinationList[0][1]]=mode
        A[combinationList[0][1],combinationList[0][0]]=mode
        A[combinationList[-1][0],combinationList[-1][1]]=mode
        A[combinationList[-1][1],combinationList[-1][0]]=mode
    elif n==3:
    
        A2=oneModeMatrix(0)
        for perm in itertools.permutations(combinationList[0],2):
            A2[perm[0],perm[1]]=mode
    
    return A

def dataCreation(mode,var='z',nSwitch=9,nFish=1):
    dataTemplate = {'speed':0.05,'z':-0.03,'r':0.07,'clockwise':1}
    data=[]
    if nFish==1:
        if mode == 2:
            if var == 'z2':
                z=np.arange(-0.07, -0.01, .01)
                r=np.arange(.02, .14, .02)
                print(z)
                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):
                        data[k].append([])
                        for l in range(0,5):
                            data2 = dataTemplate.copy()

                            rmax=0
                            r0=100

                            while r0>rmax:
                                z0=random.choice(z)
                                r0=random.choice(r)

                                z2 = dBowl-(hWater+z0)
                                rmax=math.sqrt(math.pow(dBowl,2)-math.pow(z2,2))

                            data2['z']=z0
                            data2['r']=r0


                            data[k][j].append(data2.copy())
            if var == 'r':
                
                r=np.arange(0.0175, .15, .0175)
                print(r)
                random.shuffle(r)
                r=np.insert(r,0,[100])
                print(r)
                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):
                        data[k].append([])
                        for l in range(0,5):
                            data2 = dataTemplate.copy()


                            data2['r']=r[k]
                            if bool(random.getrandbits(1)):
                                data2['clockwise']=1
                            else:
                                data2['clockwise']=-1

                            data[k][j].append(data2.copy())
            if var == 'z':
                
                z=-np.arange(.01,.07,.06/8)
                print(z)
                random.shuffle(z)
                z=np.insert(z,0,[100])
                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):
                        data[k].append([])
                        for l in range(0,5):
                            data2 = dataTemplate.copy()

                            data2['z']=z[k]
                            if bool(random.getrandbits(1)):
                                data2['clockwise']=1
                            else:
                                data2['clockwise']=-1


                            data[k][j].append(data2.copy())
            if var == 'speed2':
                
                speed=np.arange(0.01,0.22,0.22/8)
                print(speed)
                random.shuffle(speed)
                speed=np.insert(speed,0,[0])
                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):
                        data[k].append([])
                        for l in range(0,5):
                            data2 = dataTemplate.copy()
                            
                            if k==0:
                                data2['z']=100
                            data2['speed']=speed[k]
                            if bool(random.getrandbits(1)):
                                data2['clockwise']=1
                            else:
                                data2['clockwise']=-1
                            print(data2)


                            data[k][j].append(data2.copy())
            if var == 'speed':
                
                speed=np.arange(.01,0.1,0.1/8)
                print(speed)
                random.shuffle(speed)
                speed=np.insert(speed,0,[0])
                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):
                        data[k].append([])
                        for l in range(0,5):
                            data2 = dataTemplate.copy()
                            
                            if k==0:
                                data2['z']=100
                            data2['speed']=speed[k]
                            if bool(random.getrandbits(1)):
                                data2['clockwise']=1
                            else:
                                data2['clockwise']=-1
                            print(data2)


                            data[k][j].append(data2.copy())
            if var == 'background':
                
                background=np.arange(0,8,1)
                print(background)
                random.shuffle(background)
                background=np.insert(background,0,[0])
                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):
                        data[k].append([])
                        for l in range(0,5):
                            data2 = dataTemplate.copy()
                            data2['background']=background[k]
                            if k==0:
                                data2['z']=100
                            if bool(random.getrandbits(1)):
                                data2['clockwise']=1
                            else:
                                data2['clockwise']=-1
                            print(data2)


                            data[k][j].append(data2.copy())
            if var == 'ellipse':
                
                speed=np.arange(.01,0.1,0.1/8)
                print(speed)
                random.shuffle(speed)
                speed=np.insert(speed,0,[0])
                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):
                        data[k].append([])
                        for l in range(0,5):
                            data2 = dataTemplate.copy()
                            data2['mesh']=1
                            
                            if k==0:
                                data2['z']=100
                            data2['speed']=speed[k]
                            if bool(random.getrandbits(1)):
                                data2['clockwise']=1
                            else:
                                data2['clockwise']=-1
                            print(data2)


                            data[k][j].append(data2.copy())

            if var == 'scale':
                scale=np.array([0.1,0.2154,0.4642,1.0000,1.7783,3.1623,5.6234,10.0000])
                
                print(scale)
                random.shuffle(scale)
                scale=np.insert(scale,0,[0])
                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):
                        data[k].append([])
                        for l in range(0,5):
                            data2 = dataTemplate.copy()
                            data2['mesh']=1
                            data2['scale']=scale[k]
                            if k==0:
                                data2['z']=100
                            if bool(random.getrandbits(1)):
                                data2['clockwise']=1
                            else:
                                data2['clockwise']=-1
                            print(data2)


                            data[k][j].append(data2.copy())
            if var == 'scale2':
                scale=np.array([0.1,0.2154,0.4642,1.0000,1.7783,3.1623,5.6234,10.0000])
                
                print(scale)
                random.shuffle(scale)
                scale=np.insert(scale,0,[0])
                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):
                        data[k].append([])
                        for l in range(0,5):
                            data2 = dataTemplate.copy()
                            
                            data2['scale']=scale[k]
                            if k==0:
                                data2['z']=100
                            if bool(random.getrandbits(1)):
                                data2['clockwise']=1
                            else:
                                data2['clockwise']=-1
                            print(data2)


                            data[k][j].append(data2.copy())
            if var == 'scale3':
                scale=np.array([0.5,0.65,0.85,1.0,1.2,1.4,1.7,2.0])
                
                print(scale)
                random.shuffle(scale)
                scale=np.insert(scale,0,[0])
                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):
                        data[k].append([])
                        for l in range(0,5):
                            data2 = dataTemplate.copy()
                            
                            data2['scale']=scale[k]
                            if k==0:
                                data2['z']=100
                            if bool(random.getrandbits(1)):
                                data2['clockwise']=1
                            else:
                                data2['clockwise']=-1
                            print(data2)


                            data[k][j].append(data2.copy())
        if mode == 5:
            if var == 'delay':
                delay = np.array([1,2,4,8,15,30,60,120])
                random.shuffle(delay)
                delay=np.insert(delay,0,[0])
                print('the delay is')
                print(delay)
                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):
                        data[k].append([])
                        for l in range(0,5):
                            data2 = dataTemplate.copy()
                            data2['mesh']=1
                            data2['delay']=delay[k]
                            if k==0:
                                data2['z']=100
                            print(data2)


                            data[k][j].append(data2.copy())

        if mode == 3:
            dataTemplate = {'speed':0.05,'z':-0.03,'r':0.07,'clockwise':1,'tBeat':.5,'tBurst':.1}
            if var == 'tBeat':
                delay = np.array([.25,.5,.75,1.,1.25,1.5,1.75,2.])
                random.shuffle(delay)
                delay=np.insert(delay,0,[0])
                print('the delay is')
                print(delay)
                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):
                        data[k].append([])
                        for l in range(0,5):
                            data2 = dataTemplate.copy()
                            
                            data2['tBeat']=delay[k]
                            if k==0:
                                data2['z']=100
                            print(data2)


                            data[k][j].append(data2.copy())
            if var == 'tBurst':
                dataTemplate = {'speed':0.05,'z':-0.03,'r':0.07,'clockwise':1,'tBeat':1,'tBurst':.1}
                delay = np.array([0.01,0.025,0.05,0.1,0.25,0.5,0.75,1.0])
                random.shuffle(delay)
                delay=np.insert(delay,0,[0])
                print('the delay is')
                print(delay)
                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):
                        data[k].append([])
                        for l in range(0,5):
                            data2 = dataTemplate.copy()
                            
                            data2['tBurst']=delay[k]
                            if k==0:
                                data2['z']=100
                            print(data2)


                            data[k][j].append(data2.copy())

            if var == 'speed':
                dataTemplate = {'speed':0.05,'z':-0.03,'r':0.07,'clockwise':1,'tBeat':.5,'tBurst':.1}
                speed=np.arange(.01,0.1,0.1/8)
                print(speed)
                random.shuffle(speed)
                speed=np.insert(speed,0,[0])

                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):
                        data[k].append([])
                        for l in range(0,5):
                            data2 = dataTemplate.copy()
                            data2['mesh']=1
                            data2['speed']=speed[k]
                            if k==0:
                                data2['z']=100
                            print(data2)


                            data[k][j].append(data2.copy())



        if mode == 6:

            if var == 'scale':
                scale=np.array([0.1,0.2154,0.4642,1.0000,1.7783,3.1623,5.6234,10.0000])
                
                print(scale)
                random.shuffle(scale)
                scale=np.insert(scale,0,[0])
                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):
                        data[k].append([])
                        for l in range(0,5):
                            data2 = dataTemplate.copy()

                            data2['scale']=scale[k]
                            if k==0:
                                data2['z']=100

                            print(data2)


                            data[k][j].append(data2.copy())
            if var == 'scale2':
                scale=np.array([0.1,0.2154,0.4642,1.0000,1.7783,3.1623,5.6234,10.0000])
                
                print(scale)
                random.shuffle(scale)
                scale=np.insert(scale,0,[0])
                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):
                        data[k].append([])
                        for l in range(0,5):
                            data2 = dataTemplate.copy()
                            if l%2:
                                data2['scale']=scale[k]
                            if k==0:
                                data2['z']=100

                            print(data2)


                            data[k][j].append(data2.copy())
        if mode == 40 or mode ==41:

                
            phi = 0.07+np.arange(0,8)*((np.pi-0.07)/7)

            random.shuffle(phi)
            phi=np.insert(phi,0,[0])
            print(phi)
            for k in range(0,nSwitch):
                data.append([])
                for j in range(0,5):

                    if bool(random.getrandbits(1)):
                        cw=1
                    else:
                        cw=-1
                    data[k].append([])
                    for l in range(0,5):

                        data2 = dataTemplate.copy()
                        if j==l:


                            data2['phiOffset']=phi[k]
                            

                        
                        data2['clockwise']=cw
                        data[k][j].append(data2.copy())
    if nFish==2:
        if mode == 2:
            if var == 'r':
                dataTemplate = {'speed':0.04,'z':-0.03,'r':0.11,'clockwise':1}
                
                r=np.arange(0.04, .105, .009)
                print(r)
                random.shuffle(r)
                r=np.insert(r,0,[100])
                print(r)
                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):

                        if bool(random.getrandbits(1)):
                            cw=1
                        else:
                            cw=-1
                        data[k].append([])
                        for l in range(0,5):

                            data2 = dataTemplate.copy()
                            if j==l:


                                data2['r']=r[k]
                                data2['speed']=dataTemplate['speed']*r[k]/dataTemplate['r']
                                
                                

                            
                            data2['clockwise']=cw
                            data[k][j].append(data2.copy())
            if var == 'phiOffset':
                
                phi = np.arange(0.005,0.10,0.013)/0.07

                random.shuffle(phi)
                phi=np.insert(phi,0,[0])
                print(phi)
                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):

                        if bool(random.getrandbits(1)):
                            cw=1
                        else:
                            cw=-1
                        data[k].append([])
                        for l in range(0,5):

                            data2 = dataTemplate.copy()
                            if j==l:


                                data2['phiOffset']=phi[k]
                                

                            
                            data2['clockwise']=cw
                            data[k][j].append(data2.copy())

            if var == 'speed':
                dataTemplate = {'speed':0.04,'z':-0.03,'r':0.11,'clockwise':1}
                
                speed=np.arange(.01,0.1,0.1/8)
                print(speed)
                random.shuffle(speed)
                speed=np.insert(speed,0,[0,0])
                speed=np.insert(speed,len(speed),[0])

                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):

                        if bool(random.getrandbits(1)):
                            cw=1
                        else:
                            cw=-1
                        data[k].append([])
                        for l in range(0,5):
                            data2 = dataTemplate.copy()
                            data2['speed']=speed[k]
                            if k==0:
                                data2['z']=100
                            data2['clockwise']=cw
                            print(data2)


                            data[k][j].append(data2.copy())
        if mode == 3:
            if var == 'speed':
                dataTemplate = {'speed':0.04,'z':-0.03,'r':0.11,'clockwise':1,'tBeat':.5,'tBurst':.1}
                
                speed=np.arange(.01,0.1,0.1/8)
                print(speed)
                random.shuffle(speed)
                speed=np.insert(speed,0,[0])
                speed=np.insert(speed,0,[0,0])
                speed=np.insert(speed,len(speed),[0])

                for k in range(0,nSwitch):
                    data.append([])
                    for j in range(0,5):

                        if bool(random.getrandbits(1)):
                            cw=1
                        else:
                            cw=-1
                        data[k].append([])
                        for l in range(0,5):
                            data2 = dataTemplate.copy()
                            data2['speed']=speed[k]
                            if k==0:
                                data2['z']=100
                            data2['clockwise']=cw
                            print(data2)


                            data[k][j].append(data2.copy())


    #print(data)
    return data

def symMatrix(mode):
    A=[]
    A.append(oneModeMatrix(0))
    fishVR = [1,2,3,4]
    combinationList = []
    for comb in itertools.combinations([1,2,3,4],2):
        combinationList.append(comb)
        print(combinationList)
    for n in range(0,3):
        A2=oneModeMatrix(0)
        A2[combinationList[n][0],combinationList[n][1]]=mode
        A2[combinationList[n][1],combinationList[n][0]]=mode
        A2[combinationList[-1-n][0],combinationList[-1-n][1]]=mode
        A2[combinationList[-1-n][1],combinationList[-1-n][0]]=mode
        A.append(A2)
    for comb in itertools.combinations([1,2,3,4],3):
        A2=oneModeMatrix(0)
        for perm in itertools.permutations(comb,2):
            A2[perm[0],perm[1]]=mode
        A.append(A2)
    A.append(oneModeMatrix(6))

    return A

def PreDefMatrixNet(mode,mat):
    A=-1+np.zeros((5,5))

    for k in range(0,len(mat)):
        if mat[k]>0:
            A[k,mat[k]] = mode
    return A

def FirstGenExpBase(c):
    c.execute('''CREATE TABLE experiments (project text, exp integer,
                                        replicate integer,
                                        date text, tStart text, tEnd text, 
                                        nameExperimenter text,expId text,
                                        fishVR integer, 
                                        fishVRId text,
                                        species text,
                                        fishSize REAL,fishAge integer)''')

def FirstGen(c):
    c.execute('''CREATE TABLE projects (project text, exp integer,
                                        replicate integer,
                                        tExp int,tSwitch integer, 
                                        nSwitch integer,
                                        nStimuli integer, 
                                        fishVR integer,
                                        fishVR1 integer,param1 text, 
                                        fishVR2 integer,param2 text, 
                                        fishVR3 integer,param3 text, 
                                        fishVR4 integer,param4 text, 
                                        fishVR5 integer,param5 text)''')

def defineStimuli(c,projects,exp,mode,expType,tSwitch,tExp,nSwitch,nFish=1):

    if projects == 'Matrix2':
        data={'speed':0.05,'z':-0.03,'r':0.07,'clockwise':1}
        
        pairMod = np.arange(0,len(pairAssociation))
        random.shuffle(pairMod)
        tripletMod = np.arange(0,len(tripletAssociation))
        random.shuffle(tripletMod)
        mixMod = np.arange(0,len(mixAssociation))
        random.shuffle(mixMod)
        mixOneMod = np.arange(0,5)
        random.shuffle(mixOneMod)
        print(pairMod)
        replicate = 0
        #for replicate in range(0,8):
        for n in range(0,nSwitch):
            if bool(random.getrandbits(1)):
                data['clockwise']=1
            else:
                data['clockwise']=-1
            if n == 0 or n == nSwitch-1:
                modeMat = oneModeMatrixSingle(-1)
            #elif n == 1:
            #    modeMat = oneModeMatrixSingle(2)
            elif expType == 'star':
                print(n)
                if n-1<5:
                    modeMat = oneModeMatrixStar(6,(n-1)%5)
                elif n-6<5:
                    modeMat = twoModeMatrixStar(6,(n-1)%5,2,n%5)
                else:
                    modeMat = oneModeMatrixNet(6)
            elif expType == 'directedStar1':
                if n-1<5:
                    modeMat = oneModeMatrixDirectedStar1(6,(n-1)%5,n%5)
                elif n-6<5:
                    modeMat = twoModeMatrixDirectedStar1(6,(n-1)%5,2,n%5)
                else:
                    modeMat = oneModeMatrixNet(6)
            elif expType == 'directedStar2':
                if n-1<5:
                    modeMat = oneModeMatrixDirectedStar2(6,(n-1)%5,n%5,(n+1)%5)
                elif n-6<5:
                    modeMat = twoModeMatrixDirectedStar2(6,(n-1)%5,2,n%5,(n+1)%5)
                else:
                    modeMat = oneModeMatrixNet(6)
            elif expType == 'directedStar3':
                if n-1<5:
                    modeMat = oneModeMatrixDirectedStar3(6,(n-1)%5,n%5,(n+1)%5,(n+2)%5)
                elif n-6<5:
                    modeMat = twoModeMatrixDirectedStar3(6,(n-1)%5,2,n%5,(n+1)%5,(n+2)%5)
                else:
                    modeMat = oneModeMatrixNet(6)




            elif nFish == 5 and expType=='association':
                if n-2<5:
                    modeMat=oneModeMatrixPair([6,2],pairAssociation[pairMod[n-2]])
                elif n == nSwitch-2:
                    modeMat = oneModeMatrixSingle(2)
                else:
                    modeMat = oneModeMatrixNet(6)

            elif nFish == 5 and expType=='mix':
                if n-2<5:
                    modeMat=oneModeMatrixPair([6,2],pairAssociation[pairMod[n-2]])

                else:
                    modeMat = oneModeFullMatrixNet([6,2],mixOneMod[n-8])
            elif nFish == 3 and expType=='association':
                if n-2<10:
                    modeMat=twoModeMatrixNet(6,tripletAssociation[tripletMod[n-2]])
            elif nFish == 3 and expType=='mix':
                print(n)
                if n-2<5:
                    modeMat=oneModeMatrixPair([6,2],pairAssociation[pairMod[n-2]])
                else:
                    modeMat=twoModeMatrixMix([6,2],mixAssociation[mixMod[n-8]])

            print(modeMat)
            for l in range(0,5):
                values = [projects,exp,replicate,tExp,tSwitch,nSwitch,n,l,modeMat[l,0],str(data),modeMat[l,1],str(data),modeMat[l,2],str(data),modeMat[l,3],str(data),modeMat[l,4],str(data)]
                c.execute("INSERT INTO projects VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",values)

    elif projects == 'Matrix_LL':
        modeMatrix = [[-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1],[1,2,1,4,3],[-1,3,4,1,2],[-1,4,3,2,1]]


        modeMat = oneModeMatrixSingle(2)
        replicate = 0
        data={'speed':0.05,'z':-0.03,'r':0.07,'clockwise':1}
        for n in range(0,nSwitch):
            if n==0:
                modeMat = oneModeMatrixSingle(-1)
                
                for l in range(0,5):
                    values = [projects,exp,replicate,tExp,tSwitch,nSwitch,n,l,modeMat[l,0],str(data),modeMat[l,1],str(data),modeMat[l,2],str(data),modeMat[l,3],str(data),modeMat[l,4],str(data)]
                    c.execute("INSERT INTO projects VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",values)
            elif n==1:
                modeMat = oneModeMatrixSingle(2)
                
                for l in range(0,5):
                    values = [projects,exp,replicate,tExp,tSwitch,nSwitch,n,l,modeMat[l,0],str(data),modeMat[l,1],str(data),modeMat[l,2],str(data),modeMat[l,3],str(data),modeMat[l,4],str(data)]
                    c.execute("INSERT INTO projects VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",values)
            else:
                modeMat = PreDefMatrixNet(6,modeMatrix[n])
                for l in range(0,5):
                    values = [projects,exp,replicate,tExp,tSwitch,nSwitch,n,l,modeMat[l,0],str(data),modeMat[l,1],str(data),modeMat[l,2],str(data),modeMat[l,3],str(data),modeMat[l,4],str(data)]
                    c.execute("INSERT INTO projects VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",values)
    elif nFish == 1:
        if mode ==6:
            modeMat = oneModeMatrixNetPairWise(mode)
        else:
            modeMat = oneModeMatrixSingle(mode)
        for replicate in range(0,8):
            data=dataCreation(mode,var=expType,nSwitch=nSwitch)
            for n in range(0,nSwitch):
                for l in range(0,5):
                    values = [projects,exp,replicate,tExp,tSwitch,nSwitch,n,l,modeMat[l,0],str(data[n][l][0]),modeMat[l,1],str(data[n][l][1]),modeMat[l,2],str(data[n][l][2]),modeMat[l,3],str(data[n][l][3]),modeMat[l,4],str(data[n][l][4])]
                    c.execute("INSERT INTO projects VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",values)

    elif nFish == 2:
        modeMat = twoModeMatrixSingle(mode)
        
        for replicate in range(0,8):
            data=dataCreation(mode,var=expType,nSwitch=nSwitch,nFish=2)
            for n in range(0,nSwitch):
                for l in range(0,5):
                    if n == 0:
                        modeMat = twoModeMatrixNetPairWise(-1,-1)
                    elif n==1 or n == nSwitch-1:
                        modeMat = twoModeMatrixNetPairWise(6,-1)
                    else:
                        modeMat = twoModeMatrixNetPairWise(6,mode)
                    values = [projects,exp,replicate,tExp,tSwitch,nSwitch,n,l,modeMat[l,0],str(data[n][l][0]),modeMat[l,1],str(data[n][l][1]),modeMat[l,2],str(data[n][l][2]),modeMat[l,3],str(data[n][l][3]),modeMat[l,4],str(data[n][l][4])]
                    c.execute("INSERT INTO projects VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",values)



      

        

def main():

    conn = sqlite3.connect('matrixProjects.db')
    c = conn.cursor()
    project='FBVE'
    c.execute("Select exp from projects where project = ? ",(project,))
    fetched = c.fetchall()
    expType = np.unique(fetched)
    print(expType)
    print(len(expType))
    if len(expType) == 0:
        exp =-1
    else:
        exp = int(np.amax(expType))
    #for k in range(0,16):
    #    exp =exp+1
    #    print(exp)    
    #    defineStimuli(c,project,exp,6,'delay',tSwitch,tExp,nSwitch)
    #defineStimuli(c,project,exp,3,'tBurst',tSwitch,tExp,nSwitch)


    exp =exp+1
    print(exp) 

    tSwitch=10
    nSwitch = 11
    tExp = tSwitch*nSwitch   
    defineStimuli(c,project,exp,2,'speed',tSwitch,tExp,nSwitch,nFish=2)
    exp = exp+1
    tExp = tSwitch*nSwitch   
    defineStimuli(c,project,exp,3,'speed',tSwitch,tExp,nSwitch,nFish=2)
    #exp =exp+1
    #print(exp) 
    #defineStimuli(c,project,exp,6,'directedStar1',tSwitch,tExp,nSwitch,nFish=1)
    #exp =exp+1
    #print(exp) 
    #defineStimuli(c,project,exp,6,'directedStar2',tSwitch,tExp,nSwitch,nFish=1)
    #exp =exp+1
    #print(exp) 
    #defineStimuli(c,project,exp,6,'directedStar3',tSwitch,tExp,nSwitch,nFish=1)
    #exp =exp+1
    #print(exp)
    #tSwitch=10
    #nSwitch = 13
    #tExp = tSwitch*nSwitch
    #defineStimuli(c,project,exp,6,'association',tSwitch,tExp,nSwitch,nFish=3)
    #tSwitch=10
    #nSwitch = 13
    #tExp = tSwitch*nSwitch
    #exp =exp+1
    #print(exp)
    #defineStimuli(c,project,exp,6,'mix',tSwitch,tExp,nSwitch,nFish=3)
    #tSwitch=10
    #nSwitch = 13
    #tExp = tSwitch*nSwitch
    #exp =exp+1
    #print(exp)
    #defineStimuli(c,project,exp,6,'mix',tSwitch,tExp,nSwitch,nFish=5)
    #defineStimuli(c,project,exp,6,'scale',tSwitch,tExp,nSwitch)
    #exp =exp+1
    #print(exp)    
    #defineStimuli(c,project,exp,6,'scale2',tSwitch,tExp,nSwitch)
    #defineStimuli(c,project,exp,2,'phiOffset',tSwitch,tExp,nSwitch,nFish=2)
    #exp = 1
    
    #defineStimuli(c,project,exp,2,'r',tSwitch,tExp,nSwitch,2)
    #exp = exp+1
    #defineStimuli(c,project,exp,5,'delay',tSwitch,tExp,nSwitch)
    conn.commit()
    conn.close()

if __name__ == '__main__':
    main()

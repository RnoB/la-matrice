import sqlite3
import numpy as np
import itertools
import random
import math
projects = ['Matrix','sample','demo','empty','FBVE']
mode = [6,2,2,0,2]
tSwitch = [10,10,90,90,10]
tExp = [90,90,5,90,90]
nSwitch = [9,9,1,1,9]
nExp = [1,3,1,1,3]

dBowl = 0.360
hWater = 0.08


def oneModeMatrixNet(mode):
    A=mode+np.zeros((5,5))
    A[:,0]=-1
    A[0,:]=-1
    np.fill_diagonal(A,-1)
    return A

def oneModeMatrix(mode):
    A=mode+np.zeros((5,5))
    return A

def oneModeMatrixSingle(mode):
    A=np.zeros((5,5))-1
    np.fill_diagonal(A,mode)

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

def dataCreation(mode,var='z',nSwitch=9):
    dataTemplate = {'speed':0.05,'z':-0.03,'r':0.07,'clockwise':1}
    data=[]
    if mode==2:
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
            
            z=np.arange(.01,.07,.06/8)
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


def defineStimuli(c):
    for k in range(0,len(projects)):
        if k==0:
            exp = 0
            modeMat = symMatrix(mode[k])
            replicate = 0
            for n in range(0,nSwitch[k]):
                for l in range(0,5):
                        values = [projects[k],exp,replicate,tExp[k],tSwitch[k],nSwitch[k],n,l,modeMat[n][l,0],'',modeMat[n][l,1],'',modeMat[n][l,2],'',modeMat[n][l,3],'',modeMat[n][l,4],'']
                        c.execute("INSERT INTO projects VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",values)
        if k==3:
            exp = 0
            modeMat = oneModeMatrixNet(mode[k])
            replicate = 0
            for n in range(0,nSwitch[k]):
                for l in range(0,5):
                    for j in range(0,5):
                        values = [projects[k],exp,replicate,tExp[k],tSwitch[k],nSwitch[k],n,l,modeMat[l,0],'',modeMat[l,1],'',modeMat[l,2],'',modeMat[l,3],'',modeMat[l,4],'']
                        c.execute("INSERT INTO projects VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",values)
        if k==2:
            data=dataCreation(mode[k],nSwitch=nSwitch[k])
            exp = 0
            modeMat = oneModeMatrixNet(mode[k])
            replicate = 0
            for n in range(0,nSwitch[k]):
                for l in range(0,5):
                    for j in range(0,5):
                        values = [projects[k],exp,replicate,tExp[k],tSwitch[k],nSwitch[k],n,l,modeMat[l,0],str(data[n][l][0]),modeMat[l,1],str(data[n][l][1]),modeMat[l,2],str(data[n][l][2]),modeMat[l,3],str(data[n][l][3]),modeMat[l,4],str(data[n][l][4])]
                        c.execute("INSERT INTO projects VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",values)
        if k==1:
            data=dataCreation(mode[k],var='z2',nSwitch=nSwitch[k])
            replicate = 0
            modeMat = oneModeMatrix(2)
            for exp in range(0,nExp[k]):
                for n in range(0,nSwitch[k]):
                    for l in range(0,5):
                        values = [projects[k],exp,replicate,tExp[k],tSwitch[k],nSwitch[k],n,l,modeMat[l,0],str(data[n][l][0]),modeMat[l,1],str(data[n][l][1]),modeMat[l,2],str(data[n][l][2]),modeMat[l,3],str(data[n][l][3]),modeMat[l,4],str(data[n][l][4])]
                        c.execute("INSERT INTO projects VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",values)
        if k==4:
            exp = 0
            modeMat = oneModeMatrixSingle(2)
            for replicate in range(0,8):
                data=dataCreation(mode[k],var='r',nSwitch=nSwitch[k])
                for n in range(0,nSwitch[k]):
                    for l in range(0,5):
                        values = [projects[k],exp,replicate,tExp[k],tSwitch[k],nSwitch[k],n,l,modeMat[l,0],str(data[n][l][0]),modeMat[l,1],str(data[n][l][1]),modeMat[l,2],str(data[n][l][2]),modeMat[l,3],str(data[n][l][3]),modeMat[l,4],str(data[n][l][4])]
                        c.execute("INSERT INTO projects VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",values)
            exp = 1
            modeMat = oneModeMatrixSingle(2)
            for replicate in range(0,8):
                data=dataCreation(mode[k],var='z',nSwitch=nSwitch[k])
                for n in range(0,nSwitch[k]):
                    for l in range(0,5):
                        values = [projects[k],exp,replicate,tExp[k],tSwitch[k],nSwitch[k],n,l,modeMat[l,0],str(data[n][l][0]),modeMat[l,1],str(data[n][l][1]),modeMat[l,2],str(data[n][l][2]),modeMat[l,3],str(data[n][l][3]),modeMat[l,4],str(data[n][l][4])]
                        c.execute("INSERT INTO projects VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",values)
            exp = 2
            modeMat = oneModeMatrixSingle(2)
            for replicate in range(0,8):
                data=dataCreation(mode[k],var='speed',nSwitch=nSwitch[k])
                for n in range(0,nSwitch[k]):
                    for l in range(0,5):
                        values = [projects[k],exp,replicate,tExp[k],tSwitch[k],nSwitch[k],n,l,modeMat[l,0],str(data[n][l][0]),modeMat[l,1],str(data[n][l][1]),modeMat[l,2],str(data[n][l][2]),modeMat[l,3],str(data[n][l][3]),modeMat[l,4],str(data[n][l][4])]
                        c.execute("INSERT INTO projects VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",values)
            exp = 3
            modeMat = oneModeMatrixSingle(2)
            for replicate in range(0,8):
                data=dataCreation(mode[k],var='background',nSwitch=nSwitch[k])
                for n in range(0,nSwitch[k]):
                    for l in range(0,5):
                        values = [projects[k],exp,replicate,tExp[k],tSwitch[k],nSwitch[k],n,l,modeMat[l,0],str(data[n][l][0]),modeMat[l,1],str(data[n][l][1]),modeMat[l,2],str(data[n][l][2]),modeMat[l,3],str(data[n][l][3]),modeMat[l,4],str(data[n][l][4])]
                        c.execute("INSERT INTO projects VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",values)

      

        


def main():
    conn = sqlite3.connect('matrixProjects.db')
    c = conn.cursor()
    FirstGen(c)
    defineStimuli(c)
    conn.commit()
    conn.close()
    conn2 = sqlite3.connect('matrixExperiments.db')
    c2 = conn2.cursor()
    FirstGenExpBase(c2)
    conn2.commit()
    conn2.close()

if __name__ == '__main__':
    main()

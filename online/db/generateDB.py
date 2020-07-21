import sqlite3
import numpy as np
import itertools
import random
import math


projects = ["test"]



def FirstGenExpBase(c):
    c.execute('''CREATE TABLE experiments (project text, simulation integer, variation integer,
                                        date text, tStart text,expId text)''')


def FirstGen(c):
    c.execute('''CREATE TABLE simulations (project text, world integer,simulation integer, variation integer)''')


def defineStimuli(c):
    for k in range(0,len(projects)):
        if k==0:
            
            values = [projects[k],0,0,0]
            c.execute("INSERT INTO simulations VALUES (?,?,?,?)",values)

      

        


def main():
    conn = sqlite3.connect('matricematrice.db')
    c = conn.cursor()
    FirstGen(c)
    defineStimuli(c)
    FirstGenExpBase(c)
    conn.commit()
    conn.close()

if __name__ == '__main__':
    main()

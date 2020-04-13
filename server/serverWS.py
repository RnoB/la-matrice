
import asyncio
import pathlib
import ssl
import websockets
import socket
import logging
import time
import json

homeFolder = "/home/ubuntu/"
certFolder = "cert/"

players = []
playersPosition = []
playersRotation = []


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
    for player in players:
        await players[-1].send(str(websocket))
        
    players.append(websocket)

    world = json.dumps({'world' : 1, 'objects' : (2,3)})
    await players[-1].send(json.dumps(world))

async def unregister(websocket):
    players.remove(websocket)

async def send():
    message = await players[-1].recv()
    
    while True:
        for player in players:
            await players[-1].send(str(player))
            time.sleep(.1)

async def manager(websocket, path):
    print("ws : "+str(websocket))
    print("pa : "+str(path))
    await register(websocket)
    try:
        async for message in websocket:
            print(message)
            await send()
    finally:
        await unregister(websocket)




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
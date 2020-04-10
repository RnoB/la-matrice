
import asyncio
import pathlib
import ssl
import websockets
import socket

homeFolder = "/home/ubuntu/"
certFolder = "cert/"

players = []





def getLocalIP():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(('8.8.8.8', 1))  # connect() for UDP doesn't send packets
    localIP = s.getsockname()[0]
    s.close()
    return localIP




async def register(websocket):
    players.append(websocket)

async def unregister(websocket):
    players.remove(websocket)

async def send():
    message = await players[-1].recv()
    print(message)
    await players[-1].send("message")

async def manager(websocket, path):
    print("ws : "+str(websocket))
    print("pa : "+str(path))
    await register(websocket)
    print(1)
    await send()
    print(2)
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
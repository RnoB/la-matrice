
import asyncio
import pathlib
import ssl
import websockets

homeFolder = "/home/ubuntu/"
certFolder = "cert/"


async def hello(websocket, path):
    name = await websocket.recv()
    print(f"< {name}")

    greeting = f"Hello {name}!"

    await websocket.send(greeting)
    print(f"> {greeting}")

ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain(homeFolder+certFolder+"cert.pem")

start_server = websockets.serve(
    hello, "localhost", 6785, ssl=ssl_context
)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
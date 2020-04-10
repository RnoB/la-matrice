
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
localhost_pem = pathlib.Path(__file__).with_name(homeFolder+certFolder+"cert.pem")
ssl_context.load_cert_chain(localhost_pem)

start_server = websockets.serve(
    hello, "localhost", 6785, ssl=ssl_context
)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
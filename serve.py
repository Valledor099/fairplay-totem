"""Local-only preview. Run: python serve.py"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from functools import partial
import argparse

parser=argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=4184)
args=parser.parse_args()
root=Path(__file__).resolve().parent / 'dist'
handler=partial(SimpleHTTPRequestHandler, directory=str(root))
server=ThreadingHTTPServer(('127.0.0.1', args.port), handler)
print(f'FAIR PLAY · Tótem: http://127.0.0.1:{args.port}/', flush=True)
server.serve_forever()

#!/usr/bin/env python3
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

DATA_FILE = Path("/var/www/flipoff/data/messages.json")
HOST = "127.0.0.1"
PORT = 8123

def load_messages():
    if not DATA_FILE.exists():
        return ["", "", "", "", ""]
    try:
        data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        if isinstance(data, list):
            data = [str(x) for x in data[:5]]
            while len(data) < 5:
                data.append("")
            return data
    except Exception:
        pass
    return ["", "", "", "", ""]

def save_messages(messages):
    clean = [str(x) for x in messages[:5]]
    while len(clean) < 5:
        clean.append("")
    DATA_FILE.write_text(json.dumps(clean, ensure_ascii=False), encoding="utf-8")

class Handler(BaseHTTPRequestHandler):
    def _send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send_json({}, 200)

    def do_GET(self):
        if self.path != "/messages":
            self._send_json({"error": "Not found"}, 404)
            return
        self._send_json({"messages": load_messages()})

    def do_POST(self):
        if self.path != "/messages":
            self._send_json({"error": "Not found"}, 404)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length)
            payload = json.loads(raw.decode("utf-8"))
            messages = payload.get("messages", [])
            if not isinstance(messages, list):
                raise ValueError("messages must be a list")
            save_messages(messages)
            self._send_json({"ok": True, "messages": load_messages()})
        except Exception as e:
            self._send_json({"ok": False, "error": str(e)}, 400)

    def log_message(self, format, *args):
        return

if __name__ == "__main__":
    HTTPServer((HOST, PORT), Handler).serve_forever()

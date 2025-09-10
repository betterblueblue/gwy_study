from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import os

PORT = int(os.environ.get("PORT", "8000"))
BASE_DIR = os.path.dirname(__file__)
WEB_DIR = os.path.join(BASE_DIR, "web")

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Avoid caching during study iteration
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main():
    if not os.path.isdir(WEB_DIR):
        raise SystemExit(f"web 目录不存在: {WEB_DIR}")
    os.chdir(WEB_DIR)
    addr = ("0.0.0.0", PORT)
    print(f"Serving 百化分学习工具 at http://127.0.0.1:{PORT}")
    print("按 Ctrl+C 结束")
    with ThreadingHTTPServer(addr, NoCacheHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n已退出")


if __name__ == "__main__":
    main()


"""Anteprima locale del sito come lo serve GitHub Pages: /bozza/chi-sono apre bozza/chi-sono.html e gli indirizzi
inesistenti mostrano 404.html. Uso: python _design/serve.py [porta]"""
import http.server, os, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def send_head(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) and os.path.exists(path + '.html'):
            self.path = self.path.split('?', 1)[0] + '.html' + ('?' + self.path.split('?', 1)[1] if '?' in self.path else '')
        elif not os.path.exists(path):
            self.send_response(404)
            body = open(os.path.join(ROOT, '404.html'), 'rb').read()
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            from io import BytesIO
            return BytesIO(body)
        return super().send_head()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')  # in anteprima sempre i file appena modificati
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()

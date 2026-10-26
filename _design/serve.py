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

    def do_POST(self):
        """Solo per _design/copertine/: POST /_salva-copertina?slug=... salva il JPEG in img/copertine/<slug>.jpg."""
        import re
        from urllib.parse import urlparse, parse_qs
        u = urlparse(self.path)
        slug = parse_qs(u.query).get('slug', [''])[0]
        if u.path != '/_salva-copertina' or not re.fullmatch(r'[a-z0-9-]+', slug):
            self.send_error(400)
            return
        os.makedirs(os.path.join(ROOT, 'img', 'copertine'), exist_ok=True)
        data = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        with open(os.path.join(ROOT, 'img', 'copertine', slug + '.jpg'), 'wb') as f:
            f.write(data)
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        self.wfile.write(b'ok')

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')  # in anteprima sempre i file appena modificati
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()

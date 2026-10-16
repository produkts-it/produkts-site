"""Crea bozza/assets/comuni.json (suggerimenti del campo "Dove" in Contatti) dall'elenco ufficiale ISTAT dei comuni.
Fonte: https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.csv
Uso: python _design/bozza/comuni.py percorso/Elenco-comuni-italiani.csv
Formato: [[nome, sigla provincia, 1 se capoluogo], ...]
"""
import csv, io, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
raw = open(sys.argv[1], 'rb').read().decode('cp1252')
rows = list(csv.reader(io.StringIO(raw), delimiter=';'))
out = []
for r in rows[1:]:
    if len(r) < 15 or not r[6].strip():
        continue
    out.append([r[6].strip(), r[14].strip(), 1 if r[13].strip() == '1' else 0])
out.sort(key=lambda x: x[0].lower())
dest = os.path.join(HERE, '..', '..', 'bozza', 'assets', 'comuni.json')
open(dest, 'w', encoding='utf-8', newline='\n').write(json.dumps(out, ensure_ascii=False, separators=(',', ':')))
print('ok', len(out), 'comuni')

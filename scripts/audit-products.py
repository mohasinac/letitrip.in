import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')
seed_dir = r'd:\proj\letitrip.in\appkit\src\seed'
content = open(os.path.join(seed_dir, 'products-seed-data.ts'), encoding='utf-8').read()
lines = content.split('\n')
last_id = ''
for i, l in enumerate(lines, 1):
    s = l.strip()
    if s.startswith('id: "'):
        last_id = s
    elif s.startswith('title: "') and last_id:
        print(last_id[:80])
        print('  ' + s[:80])
        last_id = ''

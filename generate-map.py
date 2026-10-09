"""Generate the kiosk map from the included OSM geometry."""
from pathlib import Path
import math
import json
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
root = ET.parse(HERE / 'data/base-osm.xml').getroot()
nodes = {n.attrib['id']: (float(n.attrib['lon']), float(n.attrib['lat'])) for n in root.findall('node')}
ways = {w.attrib['id']: w for w in root.findall('way')}

def project(lon, lat):
    return (587 + (lon + 58.48536) * 111320 * math.cos(math.radians(-34.59025)) * 3.68,
            921 - (lat + 34.59025) * 111320 * 3.68)

def coords(wid):
    return [project(*nodes[n.attrib['ref']]) for n in ways[str(wid)].findall('nd')][:-1]

def centroid(points):
    return (sum(x for x, y in points) / len(points), sum(y for x, y in points) / len(points))

def points_string(points):
    return ' '.join(f'{x:.1f},{y:.1f}' for x, y in points)

def polygon(points, fill, stroke, extra=''):
    return f'<polygon points="{points_string(points)}" fill="{fill}" stroke="{stroke}" stroke-width="2" {extra}/>'

def text(x, y, value, size=20, fill='#516960', anchor='middle'):
    return f'<text x="{x:.1f}" y="{y:.1f}" fill="{fill}" font-family="Manrope, Arial, sans-serif" font-size="{size}" text-anchor="{anchor}">{value}</text>'

svg = ['<svg class="map-art" xmlns="http://www.w3.org/2000/svg" viewBox="-30 340 1160 1090" aria-label="Mapa interactivo de las cuatro actividades en Club Arquitectura">',
       '<title>Mapa de las experiencias FAIR PLAY</title>',
       '<defs><pattern id="map-dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#a5b9aa" opacity=".35"/></pattern></defs>',
       '<rect x="-100" y="300" width="1300" height="1200" fill="#dde6df"/><rect x="-100" y="300" width="1300" height="1200" fill="url(#map-dots)"/>']
svg.append(polygon(coords(837212941), '#edf1ec', '#a1b5a6'))
a = project(-58.4865282, -34.5903787)
b = project(-58.484719, -34.5892713)
svg.append(f'<path d="M{a[0]-32:.1f} {a[1]-35:.1f} L{b[0]-32:.1f} {b[1]-35:.1f}" stroke="#b5c2b8" stroke-width="28" stroke-linecap="round"/>')
svg.append(f'<path d="M{a[0]-32:.1f} {a[1]-35:.1f} L{b[0]-32:.1f} {b[1]-35:.1f}" stroke="#fcfcfc" stroke-width="2" stroke-dasharray="12 12"/>')
svg.append(text(410, 608, 'Av. Francisco Beiró', 21))
for wid in [192801659, 192801664, 192801653]:
    pts = coords(wid)
    svg.append(polygon(pts, '#c8d1c4', '#afbaab'))
    x, y = centroid(pts)
    svg.append(text(x, y+7, 'Tenis', 20))
for wid, fill, label in [(229126904, '#b0c8c8', 'Pileta'), (229356665, '#c3cec8', 'Vestuarios del club')]:
    pts = coords(wid)
    svg.append(polygon(pts, fill, '#a3b5ad'))
    x, y = centroid(pts)
    svg.append(text(x, y+6, label, 16))
ext = coords(192801662)
a,b,c,d = ext
ab = ((a[0]+b[0])/2, (a[1]+b[1])/2)
cd = ((c[0]+d[0])/2, (c[1]+d[1])/2)
zones = [coords(192801656), coords(192801658), [a,ab,cd,d], [ab,b,c,cd]]
for i, pts in enumerate(zones):
    svg.append(polygon(pts, ['#9db6a5','#aec2b3','#becdc0','#ced9ce'][i], '#708d81', f'class="zone" data-zone="{i}"'))
    if i==0:
        x,y = centroid(pts)
        svg.append(f'<circle cx="{x}" cy="{y}" r="53" fill="none" stroke="#fcfcfc" stroke-width="2" opacity=".6"/>')
    # Inset court outline keeps the geographic footprints intact.
    center = centroid(pts)
    inset = [(center[0]+(x-center[0])*.83, center[1]+(y-center[1])*.83) for x,y in pts]
    svg.append(polygon(inset, 'none', '#fcfcfc80', 'pointer-events="none"'))
gate = project(*nodes['7813702807'])
svg.append(f'<circle cx="{gate[0]}" cy="{gate[1]}" r="8" fill="#16332d"/>')
svg.append(f'<path d="M{gate[0]} {gate[1]} L{gate[0]-70} {gate[1]-35}" stroke="#16332d" stroke-width="2"/>')
svg.append(text(gate[0]-85, gate[1]-40, 'Acceso principal', 22, '#16332d', 'end'))
names = ['El vestuario','La alfombra roja','Comprate un deporte','Lo que no se ve']
for i, pts in enumerate(zones):
    x, y = centroid(pts)
    # Pull the two narrow-field controls outward so their touch targets do not overlap.
    # Leader lines preserve the association with each real geographic zone.
    if i in (2,3):
        ox,oy=x,y
        x-=(120 if i==2 else 150)
        y+=(-100 if i==2 else 110)
        svg.append(f'<path d="M{ox:.1f} {oy:.1f} L{x:.1f} {y:.1f}" stroke="#16332d" stroke-width="3"/><circle cx="{ox:.1f}" cy="{oy:.1f}" r="5" fill="#16332d"/>')
    else:
        ox,oy=x,y
        x+=(65 if i==0 else 35)
        y+=(65 if i==0 else -15)
        svg.append(f'<path d="M{ox:.1f} {oy:.1f} L{x:.1f} {y:.1f}" stroke="#16332d" stroke-width="3"/><circle cx="{ox:.1f}" cy="{oy:.1f}" r="5" fill="#16332d"/>')
    svg.append(f'<g class="marker" data-marker="{i}" role="button" tabindex="0" aria-label="Ubicar {names[i]}" aria-pressed="false"><circle cx="{x:.1f}" cy="{y:.1f}" r="100"/><text x="{x:.1f}" y="{y+30:.1f}">{i+1}</text></g>')
svg.append('</svg>')
markup=''.join(svg)
(HERE / 'dist/map.js').write_text('window.FAIRPLAY_MAP = '+json.dumps(markup, ensure_ascii=False)+';\n', encoding='utf-8')
(HERE / 'dist/assets/mapa.svg').write_text(markup, encoding='utf-8')
print('Mapa generado: 4 zonas y 4 controles interactivos.')

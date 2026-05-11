#!/usr/bin/env python3
"""Query 3DBAG tile_index for Valkenburg area, list candidate tiles + sizes."""
import flatgeobuf as fgb

# Vliegveld Valkenburg / Valkenhorst, Katwijk ZH
# RD-coords (EPSG:28992)
BBOX = (87500, 463800, 90500, 466200)  # cover full Valkenhorst plan-extent

print(f"querying tile_index.fgb for bbox {BBOX}...")
reader = fgb.HTTPReader('https://data.3dbag.nl/latest/tile_index.fgb', bbox=BBOX)

tiles = []
for t in reader:
    tiles.append({
        'tile_id': t.properties.get('tile_id'),
        'cj_download': t.properties.get('cj_download'),
        'obj_download': t.properties.get('obj_download'),
        'gpkg_download': t.properties.get('gpkg_download'),
    })

print(f"\n{len(tiles)} tiles in bbox:\n")
for t in tiles:
    print(f"  {t['tile_id']}")
    print(f"    cj:  {t['cj_download']}")
print()

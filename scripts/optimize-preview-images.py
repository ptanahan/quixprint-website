"""Prepare compact local images for the self-contained review file. Requires Pillow."""
from pathlib import Path
from urllib.parse import unquote
import hashlib,json
from PIL import Image
root=Path(__file__).resolve().parents[1]
paths=json.loads((root/'preview-asset-paths.json').read_text())
mapping={}
for asset in paths:
 if '/products/' in asset: continue
 original=root/'dist'/unquote(asset.lstrip('/'))
 target='artwork/preview/'+hashlib.sha256(asset.encode()).hexdigest()[:16]+'.webp'
 with Image.open(original) as im:
  im.thumbnail((1200,1200),Image.Resampling.LANCZOS)
  im.save(root/target,'WEBP',quality=84,method=6)
 mapping[asset]=target
(root/'data/preview-images.json').write_text(json.dumps(mapping,indent=2)+'\n')

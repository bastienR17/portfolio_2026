#!/usr/bin/env python3
"""
Décline l'image du hero en plusieurs largeurs.

Une seule image de 800 px était servie à tout le monde, alors qu'elle s'affiche
à 437 px sur un écran de bureau : plus de trois fois les pixels nécessaires.
Avec un srcset, chaque appareil télécharge la largeur qui lui correspond, et les
écrans à forte densité gardent une image nette.

Source : fonts-src/ n'a rien à voir ici, la source est le JPEG d'origine dans
public/, volontairement conservé comme repli pour les navigateurs sans WebP.

Usage :
    python scripts/generate-hero-images.py
"""

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow manquant. Lancer : pip install pillow")

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SOURCE = PUBLIC / "hero-transformation.jpg"

# 440 couvre le bureau en densité 1, 640 le mobile courant, 800 le reste —
# c'est la largeur de la source, inutile de déclarer plus haut : on obtiendrait
# des fichiers identiques. Une source plus grande permettrait un vrai 2x sur
# grand écran, mais il faudrait repartir de l'original.
WIDTHS = [440, 640, 800]
QUALITY = 80


def main():
    if not SOURCE.is_file():
        sys.exit(f"Source introuvable : {SOURCE}")

    src = Image.open(SOURCE).convert("RGB")
    print(f"  source {SOURCE.name} {src.width}x{src.height}")

    for width in WIDTHS:
        # On n'agrandit jamais : au-delà de la source, on plafonne.
        w = min(width, src.width)
        h = round(src.height * w / src.width)
        out = PUBLIC / f"hero-transformation-{width}.webp"
        src.resize((w, h), Image.LANCZOS).save(out, "WEBP", quality=QUALITY, method=6)
        print(f"  {out.name:<32} {w}x{h}  {out.stat().st_size / 1024:5.1f} Ko")


if __name__ == "__main__":
    main()

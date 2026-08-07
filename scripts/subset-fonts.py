#!/usr/bin/env python3
"""
Sous-ensemble les polices auto-hébergées.

Les fichiers d'origine (fonts-src/) sont les sous-ensembles « latin » de Google
Fonts. Ils couvrent large : l'alphabet latin complet, les monnaies, les symboles
mathématiques. Le site n'utilise qu'une centaine de caractères, et chaque
kilo-octet compte : les polices sont bloquantes au premier rendu.

On garde volontairement plus que le strict nécessaire (voir UNICODES) pour
qu'ajouter du contenu ne fasse pas basculer un caractère en police de repli.

Usage :
    python scripts/subset-fonts.py

Dépendances : pip install fonttools brotli
(brotli est obligatoire pour écrire du woff2)
"""

import sys
from pathlib import Path

try:
    from fontTools import subset
    from fontTools.ttLib import TTFont
    from fontTools.varLib.instancer import instantiateVariableFont
except ImportError:
    sys.exit("fontTools manquant. Lancer : pip install fonttools brotli")

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "fonts-src"
OUT = ROOT / "public" / "fonts"

# Jeu de caractères conservé. Plus large que les ~101 caractères réellement
# utilisés aujourd'hui : un nom propre, un prix en euros ou une majuscule
# accentuée inédite ne doivent pas tomber en police de repli.
UNICODES = ",".join(
    [
        "U+0020-007E",  # ASCII imprimable
        "U+00A0-00FF",  # Latin-1 : accents français, « », ·, insécable
        "U+0152-0153",  # Œ œ
        "U+0178",       # Ÿ
        "U+2000-206F",  # ponctuation typographique : ' – — … et espaces fines
        "U+20AC",       # €
        "U+2122",       # ™
        "U+2190-2193",  # flèches ← ↑ → ↓
        "U+2212",       # signe moins
    ]
)

# axes   : restreint la plage d'un axe variable. Lexend est livré en 100-900
#          alors que le site ne va que de 400 à 600 : les deltas des graisses
#          jamais demandées représentent la moitié du fichier.
# hinting : les instructions TrueType n'améliorent le rendu qu'en petits corps.
#          Instrument Serif ne sert qu'aux titres (30 px et plus), on les jette.
FONTS = [
    {"src": "lexend.source.woff2", "out": "lexend.woff2", "axes": {"wght": (400, 700)}},
    {"src": "instrument-serif.source.woff2", "out": "instrument-serif.woff2", "hinting": False},
]


def main():
    if not SRC.is_dir():
        sys.exit(f"Dossier source introuvable : {SRC}")

    total_before = total_after = 0

    for spec in FONTS:
        source = SRC / spec["src"]
        target = OUT / spec["out"]
        if not source.is_file():
            sys.exit(f"Police source introuvable : {source}")

        # --flavor=woff2 : compression brotli, le seul format qu'on sert.
        args = [str(source), f"--unicodes={UNICODES}", "--flavor=woff2", f"--output-file={target}"]
        if not spec.get("hinting", True):
            args.append("--no-hinting")
        subset.main(args)

        # Restriction de plage, et non figeage : l'axe reste variable, seules
        # les graisses hors plage disparaissent. Un --instance classique
        # casserait le `font-weight: 400 700` déclaré en CSS.
        if spec.get("axes"):
            font = TTFont(target)
            instantiateVariableFont(font, spec["axes"], inplace=True, updateFontNames=False)
            font.flavor = "woff2"
            font.save(target)

        before, after = source.stat().st_size, target.stat().st_size
        total_before += before
        total_after += after

        font = TTFont(target)
        axes = (
            ", ".join(f"{a.axisTag} {a.minValue:g}-{a.maxValue:g}" for a in font["fvar"].axes)
            if "fvar" in font
            else "statique"
        )
        print(
            f"  {spec['out']:<24} {before / 1024:6.1f} Ko -> {after / 1024:5.1f} Ko"
            f"  ({100 - after / before * 100:4.1f} % en moins)"
            f"  {len(font.getBestCmap()):3} caracteres, {axes}"
        )

    saved = total_before - total_after
    print(
        f"\n  Total {total_before / 1024:.1f} Ko -> {total_after / 1024:.1f} Ko"
        f"  ({saved / 1024:.1f} Ko economises, {saved / total_before * 100:.1f} %)"
    )


if __name__ == "__main__":
    main()

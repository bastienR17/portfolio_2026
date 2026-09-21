#!/usr/bin/env python3
"""
Imprime scripts/cv/cv.html en PDF, vers public/docs/RB_CV_2026.pdf.

Pourquoi passer par du HTML plutôt que par un éditeur : le CV reprend alors
exactement les polices et la palette du site, et le texte reste du vrai texte.
La version précédente, exportée depuis un éditeur graphique, ne contenait pas
de caractères d'espacement entre les mots — tout ce qui lit le PDF (analyseurs
de CV, copier-coller, lecteur d'écran) en récupérait des blocs collés du genre
« Déploiementd'unesolutionderecherche ». Le contrôle en fin de script vérifie
que ce défaut n'est pas réintroduit.

Usage :
    python scripts/cv/build-cv.py        (ou : npm run cv)

Dépendances : Chrome ou Edge installé, et pdfplumber pour le contrôle.
"""

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
SOURCE = ROOT / "scripts" / "cv" / "cv.html"
TARGET = ROOT / "public" / "docs" / "RB_CV_2026.pdf"

CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]


def find_browser():
    for name in ("chrome", "google-chrome", "chromium", "msedge"):
        found = shutil.which(name)
        if found:
            return found
    for path in CANDIDATES:
        if Path(path).is_file():
            return path
    sys.exit("Aucun navigateur Chromium trouvé. Installer Chrome ou Edge.")


def main():
    if not SOURCE.is_file():
        sys.exit(f"Source introuvable : {SOURCE}")

    browser = find_browser()
    TARGET.parent.mkdir(parents=True, exist_ok=True)

    # Profil jetable : sans ça, une instance déjà ouverte capte la commande et
    # le PDF n'est jamais écrit.
    with tempfile.TemporaryDirectory() as profile:
        result = subprocess.run(
            [
                browser,
                "--headless",
                "--disable-gpu",
                "--no-sandbox",
                f"--user-data-dir={profile}",
                "--no-pdf-header-footer",
                f"--print-to-pdf={TARGET}",
                SOURCE.as_uri(),
            ],
            capture_output=True,
            text=True,
        )

    if not TARGET.is_file():
        sys.exit(f"Impression échouée.\n{result.stderr.strip()}")

    verify()


def verify():
    try:
        import pdfplumber
    except ImportError:
        print(f"  {TARGET.name} écrit ({TARGET.stat().st_size / 1024:.0f} Ko) — contrôle ignoré")
        return

    with pdfplumber.open(TARGET) as pdf:
        pages = len(pdf.pages)
        page = pdf.pages[0]
        text = "\n".join((p.extract_text() or "") for p in pdf.pages)
        fonts = sorted({c["fontname"].split("+")[-1] for c in page.chars})

    # Mots anormalement longs = espaces manquants dans le flux de texte.
    glued = [w for w in text.split() if len(w) > 28]

    print(f"  {TARGET.name} — {TARGET.stat().st_size / 1024:.0f} Ko, {pages} page(s)")
    print(f"  format   : {page.width:.0f}x{page.height:.0f} pt")
    print(f"  polices  : {', '.join(fonts)}")

    problems = []
    if pages != 1:
        problems.append(f"{pages} pages au lieu d'une seule")
    if glued:
        problems.append(f"{len(glued)} mots collés (espaces manquants) : {glued[0][:50]}")
    for expected in ("contact@bastienroc.fr", "PSM I", "janvier 2027"):
        if expected not in text:
            problems.append(f"« {expected} » absent du PDF")

    if problems:
        print("\n  Problèmes :")
        for p in problems:
            print(f"    - {p}")
        sys.exit(1)

    print("  contrôle : une page, aucun mot collé, mentions clés présentes")


if __name__ == "__main__":
    main()

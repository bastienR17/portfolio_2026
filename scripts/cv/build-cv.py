#!/usr/bin/env python3
"""
Imprime scripts/cv/cv.html en PDF, vers public/docs/CV-Bastien-Roc.pdf.

Pourquoi passer par du HTML plutôt que par un éditeur : le CV reprend alors
exactement les polices et la palette du site, et le texte reste du vrai texte.
La version précédente, exportée depuis un éditeur graphique, ne contenait pas
de caractères d'espacement entre les mots — tout ce qui lit le PDF (analyseurs
de CV, copier-coller, lecteur d'écran) en récupérait des blocs collés du genre
« Déploiementd'unesolutionderecherche ». Le contrôle en fin de script vérifie
que ce défaut n'est pas réintroduit.

Usage :
    python scripts/cv/build-cv.py        (ou : npm run cv)

Dépendances : Chrome ou Edge installé, plus les paquets de
requirements-dev.txt (pip install -r requirements-dev.txt).
"""

import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
SOURCE = ROOT / "scripts" / "cv" / "cv.html"
TARGET = ROOT / "public" / "docs" / "CV-Bastien-Roc.pdf"
FONTS = ROOT / "public" / "fonts"

# Graisses de Lexend réellement utilisées par la feuille de style.
WEIGHTS = (400, 500, 600, 700)

# Sur macOS, aucun de ces binaires n'est dans le PATH : une application y est
# un dossier .app, et Chrome n'installe pas de lien dans /usr/local/bin. Le
# chemin complet est donc la seule façon de le trouver.
CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
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


def prepare_fonts(workdir):
    """
    Décline Lexend en instances statiques, une par graisse utilisée.

    Chrome n'embarque une vraie police que s'il peut la prendre telle quelle.
    Devant une police variable qu'il doit instancier, il bascule en Type3 :
    chaque lettre devient un dessin vectoriel. Le PDF passait alors de 8 Ko à
    295 Ko, et les analyseurs qui ne gèrent pas le Type3 n'y lisaient plus rien.
    Le site, lui, garde le fichier variable : une seule requête pour toutes les
    graisses, ce qui est le bon arbitrage sur le web mais pas à l'impression.

    Les fichiers produits sont temporaires : rien n'est ajouté au dépôt.
    """
    try:
        from fontTools.ttLib import TTFont
        from fontTools.varLib.instancer import instantiateVariableFont
    except ImportError:
        sys.exit("fontTools manquant. Lancer : pip install fonttools brotli")

    faces = []
    for weight in WEIGHTS:
        font = TTFont(FONTS / "lexend.woff2")
        instantiateVariableFont(font, {"wght": weight}, inplace=True, updateFontNames=True)
        font.flavor = None
        out = workdir / f"lexend-{weight}.ttf"
        font.save(out)
        faces.append(
            f"@font-face{{font-family:'Lexend';src:url('{out.as_uri()}') "
            f"format('truetype');font-weight:{weight};font-style:normal}}"
        )

    serif = TTFont(FONTS / "instrument-serif.woff2")
    serif.flavor = None
    out = workdir / "instrument-serif.ttf"
    serif.save(out)
    faces.append(
        f"@font-face{{font-family:'Instrument Serif';src:url('{out.as_uri()}') "
        f"format('truetype');font-weight:400;font-style:normal}}"
    )
    return "\n".join(faces)


def main():
    if not SOURCE.is_file():
        sys.exit(f"Source introuvable : {SOURCE}")

    browser = find_browser()
    TARGET.parent.mkdir(parents=True, exist_ok=True)

    # Profil jetable : sans ça, une instance déjà ouverte capte la commande et
    # le PDF n'est jamais écrit.
    with tempfile.TemporaryDirectory() as tmp:
        workdir = Path(tmp)
        html = SOURCE.read_text(encoding="utf-8")

        # La source garde les @font-face du site pour rester lisible dans un
        # navigateur ; on ne les échange qu'à l'impression.
        html, count = re.subn(
            r"@font-face\{font-family:'(?:Lexend|Instrument Serif)'.*?\}\n?",
            "",
            html,
        )
        if count != 2:
            sys.exit(f"prepare: {count} règle(s) @font-face trouvée(s) au lieu de 2 dans cv.html")
        html = html.replace("<style>", "<style>\n" + prepare_fonts(workdir), 1)

        page = workdir / "cv.html"
        page.write_text(html, encoding="utf-8")

        result = subprocess.run(
            [
                browser,
                "--headless",
                "--disable-gpu",
                "--no-sandbox",
                f"--user-data-dir={workdir / 'profile'}",
                "--no-pdf-header-footer",
                f"--print-to-pdf={TARGET}",
                page.as_uri(),
            ],
            capture_output=True,
            text=True,
        )

    if not TARGET.is_file():
        sys.exit(f"Impression échouée.\n{result.stderr.strip()}")

    verify()


def verify():
    """
    Les contrôles de fin de course, sans lesquels le PDF n'est pas publiable.

    Ils échouaient en silence : pdfplumber absent, la fonction affichait
    « contrôle ignoré », sortait en code 0, et on repartait avec un PDF que
    rien n'avait vérifié — en croyant le contraire. Un garde-fou qui se
    désactive tout seul est pire que pas de garde-fou : il donne une confiance
    que rien ne justifie. Le chargement des polices, deux fonctions plus haut,
    s'arrête net quand fontTools manque ; il n'y avait pas de raison que celui-ci
    soit plus conciliant.

    Le plus utile des contrôles est le nombre de pages. Deux lignes ajoutées à
    cv.html peuvent faire déborder sur une seconde page, et ça ne se voit qu'en
    ouvrant le PDF — ce qu'on ne fait pas à chaque génération, alors qu'un
    recruteur, lui, le verra.
    """
    try:
        import pdfplumber
    except ImportError:
        sys.exit(
            "pdfplumber manquant, le PDF n'a donc pas été vérifié.\n"
            "Lancer : pip install -r requirements-dev.txt"
        )

    with pdfplumber.open(TARGET) as pdf:
        pages = len(pdf.pages)
        page = pdf.pages[0]
        text = "\n".join((p.extract_text() or "") for p in pdf.pages)
        fonts = sorted({c["fontname"].split("+")[-1] for c in page.chars})

    # Mots anormalement longs = espaces manquants dans le flux de texte.
    glued = [w for w in text.split() if len(w) > 28]
    raw = TARGET.read_bytes()
    type3 = raw.count(b"/Type3")
    size_kb = TARGET.stat().st_size / 1024

    print(f"  {TARGET.name} - {size_kb:.0f} Ko, {pages} page(s)")
    print(f"  format   : {page.width:.0f}x{page.height:.0f} pt")
    print(f"  polices  : {', '.join(fonts)}")

    problems = []
    if pages != 1:
        problems.append(f"{pages} pages au lieu d'une seule")
    if glued:
        problems.append(f"{len(glued)} mots collés (espaces manquants) : {glued[0][:50]}")
    if type3:
        problems.append(f"{type3} police(s) en Type3 — les polices sont vectorisées, PDF inutilement lourd")
    # Les tirets longs ont été bannis du site ; ils ne doivent pas revenir ici.
    for dash, name in (("—", "cadratin"), ("–", "demi-cadratin")):
        if dash in text:
            problems.append(f"{text.count(dash)} tiret(s) {name} — n'utiliser que le trait d'union")
    for expected in ("contact@bastienroc.fr", "PSM I", "janvier 2027"):
        if expected not in text:
            problems.append(f"« {expected} » absent du PDF")

    if problems:
        print("\n  Problèmes :")
        for p in problems:
            print(f"    - {p}")
        sys.exit(1)

    print("  contrôle : une page, vraies polices embarquées, aucun mot collé, aucun tiret long")


if __name__ == "__main__":
    main()

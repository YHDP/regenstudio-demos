#!/usr/bin/env python3
"""
One-time extraction script: parse content.html and emit data/families.json.

Reads all 37 <article class="cpr-card"> elements from the blog,
extracts every data-* attribute, and writes a single JSON file that
serves as the sole data source for the standalone tracker demo.

Usage:
    python3 tools/extract-families.py
"""

import json
import os
import re
import sys
from html.parser import HTMLParser

CONTENT_HTML = os.path.join(
    os.path.dirname(__file__),
    "..", "..", "..",
    "regenstudio-website",
    "Blogs", "cpr-digital-product-passport", "content.html",
)

# Fallback: try sibling directory from workspace root
if not os.path.isfile(os.path.abspath(CONTENT_HTML)):
    CONTENT_HTML = os.path.expanduser(
        "~/Claude/regenstudio-website/Blogs/cpr-digital-product-passport/content.html"
    )
OUTPUT_JSON = os.path.join(os.path.dirname(__file__), "..", "data", "families.json")


VOID_ELEMENTS = frozenset([
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
])


class CardExtractor(HTMLParser):
    """Pull data-* attributes and inner spans from <article class="cpr-card">."""

    def __init__(self):
        super().__init__()
        self.families = []
        self._in_card = False
        self._card = {}
        self._current_tag = None
        self._depth = 0

    def handle_starttag(self, tag, attrs):
        ad = dict(attrs)

        if tag == "article" and "cpr-card" in (ad.get("class") or ""):
            self._in_card = True
            self._depth = 1
            self._card = {}
            # Simple string attributes
            for key in (
                "data-full-name", "data-letter", "data-family", "data-priority",
                "data-updated", "data-acquis", "data-sreq", "data-tc", "data-dpp-est",
            ):
                if key in ad:
                    self._card[key.replace("data-", "")] = ad[key]
            # JSON attributes
            for key in ("data-milestones", "data-dpp-range", "data-standards"):
                if key in ad:
                    try:
                        self._card[key.replace("data-", "")] = json.loads(ad[key])
                    except json.JSONDecodeError:
                        self._card[key.replace("data-", "")] = ad[key]
            # data-info is HTML string — keep as-is
            if "data-info" in ad:
                self._card["info"] = ad["data-info"]
            return

        if self._in_card:
            # Void elements don't produce endtag events — don't increment depth
            if tag not in VOID_ELEMENTS:
                self._depth += 1
            cls = ad.get("class", "")
            if tag == "img" and "src" in ad:
                src = ad["src"]
                self._card["icon"] = src.split("/")[-1]
            if "cpr-card__name" in cls:
                self._current_tag = "display_name"
            elif "cpr-card__family" in cls:
                self._current_tag = "family_label"
            elif "cpr-card__tc" in cls:
                self._current_tag = "tc_label"

    def handle_endtag(self, tag):
        if self._in_card:
            self._depth -= 1
            if self._depth == 0 and tag == "article":
                self._in_card = False
                self.families.append(self._card)
                self._card = {}
            self._current_tag = None

    def handle_data(self, data):
        if self._in_card and self._current_tag:
            text = data.strip()
            if text:
                self._card[self._current_tag] = text


def main():
    src = os.path.abspath(CONTENT_HTML)
    if not os.path.isfile(src):
        print(f"ERROR: Cannot find {src}", file=sys.stderr)
        sys.exit(1)

    with open(src, encoding="utf-8") as f:
        html = f.read()

    parser = CardExtractor()
    parser.feed(html)

    families = parser.families
    print(f"Extracted {len(families)} product families")

    # Preserve HTML order (already sorted by estimated DPP obligation date)

    # Write output
    out = os.path.abspath(OUTPUT_JSON)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(families, f, indent=2, ensure_ascii=False)

    print(f"Written to {out}")


if __name__ == "__main__":
    main()

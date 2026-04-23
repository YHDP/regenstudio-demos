#!/usr/bin/env python3
# Copyright 2024-2026 Regen Studio B.V.
# Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
"""
recompute-convergence.py — re-derive family DPP envelope + convergence fields
from the per-standard dpp_est values the CPR agent writes.

Inputs (read-only unless flagged):
  - data/families-v2.json       (READ, then WRITE-BACK)
  - data/system-timeline.json   (READ)

What this script does, per family, with no hand-editing required:
  1. Walk `standards[*].dpp_est`, collect every parseable year.
  2. Form `product_envelope` = year-range string:
         single year  → "~2032"
         range        → "~2030–2032"  (en-dash, consistent with existing format)
     If no standards carry a year, fall back to existing `dpp-est`/envelope.
  3. Propagate that envelope to every downstream field that must stay in sync:
         family["dpp-est"]
         family["dpp-range"]["hen_earliest"] / ["hen_latest"] / ["envelope"]
         family["milestones"]["dpp"]
         family["convergence"]["product_timeline_complete"]
  4. Resolve `convergence.system_timeline_ref` (default sys-dpp-mandatory) in
     system-timeline.json; extract its year span.
  5. Apply the convergence formula:
         DPP_date = max(Art.5(8)+12mo, Art.75(1)DA+18mo)
                  ≈ max(Product Ready, System Ready)  at year granularity.
  6. Write `convergence.dpp_date`, `binding_constraint`, `formula_note`, and
     refresh `provenance` with today's date.

Intended workflow (no manual field editing required):
  (a) CPR agent produces a review-queue.json with per-standard updates
      (dpp_est, cited, notes) and aggregate setters (dpp-range.hen_count, …).
  (b) Human reviews the queue in admin UI, accepts/rejects each update.
  (c) Admin download gives an updated families-v2.json.
  (d) Run this script → envelope + convergence re-derive from the accepted
      per-standard state. Zero hand-editing.
  (e) Commit.

Idempotent: re-running on an up-to-date file changes nothing.

Usage:
    python3 tools/recompute-convergence.py          # in-place recompute
    python3 tools/recompute-convergence.py --dry    # print diff, don't write
    python3 tools/recompute-convergence.py --only PCR,CEM  # subset
"""

import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
FAMS = ROOT / "data" / "families-v2.json"
SYS = ROOT / "data" / "system-timeline.json"

YEAR_RE = re.compile(r"(\d{4})")


def year_span(text):
    """Extract (earliest, latest) year tuple from a string like '~2030–2031' or
    'Q1-Q2 2029' or '2026-07-19'. Returns (None, None) if no years found."""
    if not text:
        return (None, None)
    years = [int(y) for y in YEAR_RE.findall(str(text))]
    if not years:
        return (None, None)
    return (min(years), max(years))


def _collect_years(standards, wanted_type=None):
    """Return (present_flag, min_year_or_None, max_year_or_None) from
    standards[*].dpp_est. Optionally filter to a specific `type` field ('hEN'
    or 'EAD').

    present_flag is True if at least one standard of the requested type exists
    (regardless of whether its dpp_est parses) — distinguishing "no standards
    of this type in the family" from "standards exist but none have a year yet."
    This distinction drives whether we blank the mirror field or preserve its
    hand-authored fallback.
    """
    present = False
    mins, maxs = [], []
    for s in standards or []:
        if wanted_type is not None and s.get("type") != wanted_type:
            continue
        present = True
        est = s.get("dpp_est")
        if not est:
            continue
        lo, hi = year_span(est)
        if lo is not None:
            mins.append(lo)
            maxs.append(hi)
    if not mins:
        return (present, None, None)
    return (present, min(mins), max(maxs))


def _fmt_envelope(lo, hi):
    """Format a (min_year, max_year) pair into a tilde-prefixed string."""
    if lo is None:
        return None
    if lo == hi:
        return "~{y}".format(y=lo)
    return "~{a}–{b}".format(a=lo, b=hi)  # en-dash


def derive_envelopes(fam):
    """Derive three envelopes from per-standard dpp_est values:
        (hen_tuple, ead_tuple, family_tuple)

    Each tuple is (envelope_str_or_None, lo_year_or_None, hi_year_or_None, present_flag).

    `present_flag` is True iff at least one standard of that type exists on
    the family. Used by the mirror-sync to decide: blank the field (when
    present but no parseable year) vs preserve hand-authored fallback (when
    not present at all).

    When no standards of any type carry a year, family envelope falls back
    to existing `dpp-range.envelope` / `dpp-est` so families that haven't
    been populated yet don't get blanked out.
    """
    stds = fam.get("standards") or []

    hen_present, hen_lo, hen_hi = _collect_years(stds, "hEN")
    ead_present, ead_lo, ead_hi = _collect_years(stds, "EAD")
    fam_present, fam_lo, fam_hi = _collect_years(stds, None)

    hen_env = _fmt_envelope(hen_lo, hen_hi)
    ead_env = _fmt_envelope(ead_lo, ead_hi)
    fam_env = _fmt_envelope(fam_lo, fam_hi)

    if fam_env is None:
        existing = (
            (fam.get("dpp-range") or {}).get("envelope")
            or fam.get("dpp-est")
            or ""
        )
        fam_lo, fam_hi = year_span(existing)
        fam_env = existing or None

    return (
        (hen_env, hen_lo, hen_hi, hen_present),
        (ead_env, ead_lo, ead_hi, ead_present),
        (fam_env, fam_lo, fam_hi, fam_present),
    )


def sync_family_envelope_fields(fam, hen, ead, fam_env):
    """Propagate derived envelopes into every downstream mirror field.

    Args:
        hen, ead, fam_env: each a (envelope, lo, hi, present_flag) tuple.

    Rules:
      - If standards of a given type are present on the family, derived value
        is canonical — overwrite mirror field (even with null/None).
      - If standards of a given type are NOT present (e.g. zero standards),
        preserve the hand-authored mirror value rather than blanking it.

    Returns list of field-name strings that changed."""
    changed = []
    hen_env, hen_lo, hen_hi, hen_present = hen
    ead_env, ead_lo, ead_hi, ead_present = ead
    envelope, _, _, fam_present = fam_env

    if envelope is not None and fam.get("dpp-est") != envelope:
        fam["dpp-est"] = envelope
        changed.append("dpp-est")

    dpp_range = fam.get("dpp-range")
    if not isinstance(dpp_range, dict):
        dpp_range = {}
        fam["dpp-range"] = dpp_range

    def set_if_present(key, present, value):
        if not present:
            # No standards of this type — keep the hand-authored fallback.
            return
        if dpp_range.get(key) != value:
            dpp_range[key] = value
            changed.append("dpp-range.{k}".format(k=key))

    hen_lo_str = "~{y}".format(y=hen_lo) if hen_lo is not None else None
    hen_hi_str = "~{y}".format(y=hen_hi) if hen_hi is not None else None
    ead_lo_str = "~{y}".format(y=ead_lo) if ead_lo is not None else None
    ead_hi_str = "~{y}".format(y=ead_hi) if ead_hi is not None else None

    set_if_present("hen_earliest", hen_present, hen_lo_str)
    set_if_present("hen_latest", hen_present, hen_hi_str)
    set_if_present("ead_earliest", ead_present, ead_lo_str)
    set_if_present("ead_latest", ead_present, ead_hi_str)

    if envelope is not None and dpp_range.get("envelope") != envelope:
        dpp_range["envelope"] = envelope
        changed.append("dpp-range.envelope")

    milestones = fam.get("milestones")
    if isinstance(milestones, dict) and "dpp" in milestones and envelope is not None:
        if milestones.get("dpp") != envelope:
            milestones["dpp"] = envelope
            changed.append("milestones.dpp")

    return changed


def system_envelope(sys_timeline, ref_id):
    """Resolve the system-timeline node referenced by ref_id and return
    (envelope_string, (year_earliest, year_latest)). Falls back to sys-dpp-mandatory."""
    nodes = list(sys_timeline.get("nodes", [])) + list(sys_timeline.get("cross_cutting", []))
    node = next((n for n in nodes if n.get("id") == ref_id), None)
    if node is None:
        node = next((n for n in nodes if n.get("id") == "sys-dpp-mandatory"), None)
    if node is None:
        return ("unknown", (None, None))
    # Prefer explicit estimated_date / target_date / statutory_deadline / date
    for field in ("estimated_date", "target_date", "statutory_deadline", "date"):
        if node.get(field):
            return (str(node[field]), year_span(node[field]))
    return (node.get("label", "unknown"), (None, None))


def recompute(fam, sys_timeline, today_iso):
    """Mutate `fam` in place: derive envelopes from standards, propagate to
    all mirror fields, re-derive convergence. Returns (changed_bool, notes_list)."""
    notes = []
    letter = (fam.get("letter") or "?").upper()

    # (1) Derive hEN / EAD / family-level envelopes from per-standard dpp_est.
    hen_tuple, ead_tuple, fam_tuple = derive_envelopes(fam)
    product_envelope = fam_tuple[0] or ""
    product_min, product_max = fam_tuple[1], fam_tuple[2]
    # (tuple element 3 is `present_flag`, consumed inside sync_family_envelope_fields)

    # (2) Propagate envelopes into dpp-est, dpp-range.*, milestones.dpp.
    mirror_changes = sync_family_envelope_fields(fam, hen_tuple, ead_tuple, fam_tuple)
    if mirror_changes:
        notes.append("{f}: propagated envelope {e!r} to {fields}".format(
            f=letter, e=product_envelope, fields=", ".join(mirror_changes)))

    # (3) Recompute convergence from envelope + system timeline.
    conv = dict(fam.get("convergence") or {})

    sys_ref = conv.get("system_timeline_ref", "sys-dpp-mandatory")
    sys_envelope, (sys_min, sys_max) = system_envelope(sys_timeline, sys_ref)

    # Year-level max on the latest end of each envelope (conservative: DPP is binding
    # when the LATEST of product-ready/system-ready completes).
    if product_max is None and sys_max is None:
        binding = "unknown"
        dpp_envelope = "TBD"
    elif product_max is None:
        # Product envelope unknown → DPP can't land before system-ready, but we can't
        # claim system-ready IS the DPP date. Surface the lower bound explicitly.
        binding = "product-unknown"
        dpp_envelope = "TBD (≥ {s})".format(s=sys_envelope)
    elif sys_max is None:
        binding = "product"
        dpp_envelope = product_envelope
    elif product_max > sys_max:
        binding = "product"
        dpp_envelope = product_envelope
    elif product_max < sys_max:
        binding = "system"
        dpp_envelope = sys_envelope
    else:
        binding = "tie"
        # Prefer product envelope since it is typically year-specific vs system's quarter estimate.
        dpp_envelope = product_envelope

    formula_note = "max(Product {p}, System {s}) = {r}".format(
        p=product_envelope or "?",
        s=sys_envelope or "?",
        r=dpp_envelope or "?",
    )

    new_conv = {
        "product_timeline_complete": product_envelope,
        "system_timeline_ref": sys_ref,
        "dpp_date": dpp_envelope,
        "dpp_certainty": conv.get("dpp_certainty", "gray"),
        "binding_constraint": binding,
        "formula_note": formula_note,
        "provenance": "recomputed {d} via tools/recompute-convergence.py; formula: max(Art.5(8)+12mo, Art.75(1)DA+18mo); product envelope derived from standards[*].dpp_est, system envelope from system-timeline.json::{ref}".format(
            d=today_iso,
            ref=sys_ref,
        ),
    }

    # Preserve any extra fields from the original convergence object
    for k, v in conv.items():
        if k not in new_conv:
            new_conv[k] = v

    conv_changed_fields = [
        k for k in ("product_timeline_complete", "dpp_date", "binding_constraint", "formula_note", "provenance")
        if conv.get(k) != new_conv.get(k)
    ]
    if conv_changed_fields:
        fam["convergence"] = new_conv
        notes.append("{f}: convergence updated: {fields}".format(
            f=letter, fields=", ".join(conv_changed_fields)))

    any_changed = bool(mirror_changes or conv_changed_fields)
    return any_changed, notes


def main():
    ap = argparse.ArgumentParser(description="Re-derive convergence fields from product + system envelopes.")
    ap.add_argument("--dry", action="store_true", help="Print changes, do not write.")
    ap.add_argument("--only", default="", help="Comma-separated family letters to process (default: all).")
    args = ap.parse_args()

    with FAMS.open() as f:
        fams_doc = json.load(f)
    with SYS.open() as f:
        sys_timeline = json.load(f)

    only = {x.strip().upper() for x in args.only.split(",") if x.strip()} if args.only else None
    today = dt.date.today().isoformat()

    changed_count = 0
    notes = []
    for fam in fams_doc.get("families", []):
        letter = (fam.get("letter") or "").upper()
        if only and letter not in only:
            continue
        changed, fam_notes = recompute(fam, sys_timeline, today)
        notes.extend(fam_notes)
        if changed:
            changed_count += 1

    for n in notes:
        print(n)
    print("---")
    print("{total} families total, {c} updated.".format(
        total=len(fams_doc.get("families", [])),
        c=changed_count,
    ))

    if args.dry:
        print("(dry run — no write)")
        return 0

    with FAMS.open("w") as f:
        json.dump(fams_doc, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("Wrote {path}".format(path=FAMS))
    return 0


if __name__ == "__main__":
    sys.exit(main())

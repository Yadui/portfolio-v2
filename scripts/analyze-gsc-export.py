#!/usr/bin/env python3
"""Read-only, standard-library GSC CSV analyzer. JSON goes to stdout only."""

import argparse
import csv
import hashlib
import io
import json
from datetime import date, timedelta
from decimal import Decimal
from pathlib import Path
import unittest


FILES = ("Chart.csv", "Queries.csv", "Pages.csv", "Countries.csv",
         "Devices.csv", "Filters.csv", "Search appearance.csv")


def parse_csv(stream):
    # csv.reader, not splitlines: the export contains a quoted multiline query.
    rows = list(csv.reader(stream, strict=True))
    if not rows or any(len(row) != len(rows[0]) for row in rows[1:]):
        raise ValueError("Missing header or inconsistent CSV column count")
    return rows[0], rows[1:]


def metrics(rows):
    clicks = sum(int(row[1]) for row in rows)
    impressions = sum(int(row[2]) for row in rows)
    weighted = Decimal(0)
    for row in rows:
        c, i = int(row[1]), int(row[2])
        if c < 0 or i < 0 or c > i:
            raise ValueError("Invalid counts")
        if i:
            position = Decimal(row[4])
            if not position.is_finite() or position < 1:
                raise ValueError("Invalid positive-impression position")
            weighted += position * i
    return {
        "rows": len(rows), "clicks": clicks, "impressions": impressions,
        "ctr_pct": round(clicks / impressions * 100, 6) if impressions else None,
        "impression_weighted_position":
            round(float(weighted / impressions), 6) if impressions else None,
    }


def cluster(query):
    q = " ".join(query.lower().split())
    if q == "azure active directory passwordless":
        return "identity_passwordless"
    if q in {"mfa for vdi", "azure virtual desktop mfa", "windows virtual desktop mfa",
             "azure virtual desktop single sign on"}:
        return "identity_avd_mfa_sso"
    if q == "cloud foundry managed services":
        return "cloud_foundry_separate_product"
    if q in {"foundry agent service", "foundry service", "microsoft foundry agent service"}:
        return "microsoft_foundry_candidate_intent"
    if q in {"kv cache", "kv caching", "kv-cache", "kvcache", "k v cache",
             "key-value cache", "what is kv cache", "kv caching in llms"}:
        return "kv_concept_head_and_variants"
    if q in {"kv cache math", "what is kv cache memory", "kv cache memory", "kv cache size"}:
        return "kv_memory_math_longtail"
    if q.startswith("cache me if you must:"):
        return "kv_named_paper"
    if q.startswith("backup sql"):
        return "sql_backup_blob"
    if q.startswith("private endpoint"):
        return "azure_private_endpoint"
    if q == "azure openai rag":
        return "azure_rag"
    if q == "extracting structured data from templatic documents":
        return "document_extraction"
    return "unresolved_noise"


def analyze(directory):
    tables, hashes = {}, {}
    for name in FILES:
        path = directory / name
        data = path.read_bytes()
        hashes[name] = {"sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}
        with path.open(encoding="utf-8-sig", newline="") as stream:
            header, rows = parse_csv(stream)
        tables[name] = {"columns": header, "data": rows}
    daily = tables["Chart.csv"]["data"]
    dates = [date.fromisoformat(row[0]) for row in daily]
    if not dates or dates != sorted(set(dates)):
        raise ValueError("Daily dates must be nonempty, sorted and unique")
    if (dates[-1] - dates[0]).days + 1 != len(dates):
        raise ValueError("Missing daily dates; do not compare incomplete windows")
    chart = metrics(daily)
    dimensions = {}
    for name in FILES:
        if name not in {"Chart.csv", "Filters.csv"}:
            total = metrics(tables[name]["data"])
            total["clicks_minus_chart"] = total["clicks"] - chart["clicks"]
            total["impressions_minus_chart"] = total["impressions"] - chart["impressions"]
            dimensions[name] = total
    periods = {}
    for days in (7, 14):
        for label, offset in (("latest", 0), ("previous", days)):
            end = dates[-1] - timedelta(days=offset)
            start = end - timedelta(days=days - 1)
            rows = [row for row in daily if start.isoformat() <= row[0] <= end.isoformat()]
            if len(rows) != days:
                raise ValueError("Insufficient rows for equal-length comparison")
            periods[f"{label}_{days}d"] = {
                "start": start.isoformat(), "end": end.isoformat(), **metrics(rows)}
    changes = {}
    for days in (7, 14):
        latest, previous = periods[f"latest_{days}d"], periods[f"previous_{days}d"]
        changes[f"{days}d"] = {
            "impressions_delta": latest["impressions"] - previous["impressions"],
            "impressions_change_pct": round(
                (latest["impressions"] / previous["impressions"] - 1) * 100, 6)
                if previous["impressions"] else None,
            "clicks_delta": latest["clicks"] - previous["clicks"],
            "position_delta": round(latest["impression_weighted_position"] -
                                    previous["impression_weighted_position"], 6),
        }
    groups = {}
    for row in tables["Queries.csv"]["data"]:
        groups.setdefault(cluster(row[0]), []).append(row)
    clusters = {key: {**metrics(rows), "queries": [row[0] for row in rows]}
                for key, rows in sorted(groups.items())}
    return {
        "schema_version": 1, "analysis_date": "2026-10-02",
        "source_directory": str(directory.resolve()), "source_files": hashes,
        "method": {"position": "sum(impressions * exported position) / sum(impressions); approximate because source positions are rounded",
                   "ctr_pct": "100 * sum(clicks) / sum(impressions)",
                   "query_page_join": False,
                   "cluster_assignment": "editorial query-text labels, not observed landing-page attribution",
                   "date_timezone": "Pacific Time (Google daily report convention)"},
        "date_range": {"start": dates[0].isoformat(), "end": dates[-1].isoformat(),
                       "days": len(dates), "zero_impression_days":
                       [row[0] for row in daily if int(row[2]) == 0]},
        "chart": chart, "dimension_sums": dimensions,
        "click_days": [row for row in daily if int(row[1]) > 0],
        "periods": periods, "period_changes": changes,
        "query_clusters": clusters, "tables": tables,
    }


class AnalyzerTests(unittest.TestCase):
    def test_multiline_csv(self):
        _, rows = parse_csv(io.StringIO('q,c,i,ctr,p\n"line one\nline two",0,1,0%,50\n'))
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0][0], "line one\nline two")

    def test_weighting_and_ctr(self):
        value = metrics([["a", "1", "9", "11.11%", "10"],
                         ["b", "0", "1", "0%", "90"], ["c", "0", "0", "", ""]])
        self.assertEqual(value["impression_weighted_position"], 18)
        self.assertEqual(value["ctr_pct"], 10)
        self.assertIsNone(metrics([])["impression_weighted_position"])

    def test_distinct_intents(self):
        self.assertNotEqual(cluster("cloud foundry managed services"), cluster("foundry agent service"))
        self.assertNotEqual(cluster("kv cache memory"), cluster("kv cache"))
        self.assertEqual(cluster("kc cache"), "unresolved_noise")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", type=Path, nargs="?")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        suite = unittest.defaultTestLoader.loadTestsFromTestCase(AnalyzerTests)
        if not unittest.TextTestRunner().run(suite).wasSuccessful():
            raise SystemExit(1)
    elif args.directory:
        print(json.dumps(analyze(args.directory), ensure_ascii=False, separators=(",", ":")))
    else:
        parser.error("directory is required unless --self-test is supplied")


if __name__ == "__main__":
    main()

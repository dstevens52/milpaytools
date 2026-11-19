#!/usr/bin/env bash
# P1 performance, Step 1 item 2: HTML weight per page from production, with curl
# (no JavaScript runs, so no analytics fire). Tooling only.
#
#   MSYS_NO_PATHCONV=1 bash scripts/perf/html-weight.sh [base] > html-weight.tsv
#
# Columns: path, HTTP status, raw bytes (decompressed), gzip -9 bytes, wire bytes as served
# (Accept-Encoding: br, gzip), Content-Encoding served. Paths come from the live sitemap.
# Bodies go through shell redirection and -w writes to stderr: no curl -o/-D file paths, which
# a native curl.exe can't resolve under MSYS_NO_PATHCONV=1. Needs curl >= 7.84 (%header{...}).
set -euo pipefail
BASE="${1:-https://www.milpaytools.com}"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

curl -sf "$BASE/sitemap.xml" | grep -o '<loc>[^<]*</loc>' | sed -e 's#<loc>##' -e 's#</loc>##' -e "s#^https://www.milpaytools.com##" > "$tmp/paths"
n=$(wc -l < "$tmp/paths")
echo "sitemap paths: $n" >&2
[ "$n" -gt 0 ] || { echo "empty sitemap" >&2; exit 1; }

printf 'path\tstatus\traw\tgzip9\twire\tencoding\n'
while read -r p; do
  if [ -z "$p" ]; then p="/"; fi
  status=$({ curl -s --compressed -w '%{stderr}%{http_code}' "$BASE$p" > "$tmp/page"; } 2>&1)
  raw=$(wc -c < "$tmp/page")
  gz=$(gzip -9 -c "$tmp/page" | wc -c)
  wireinfo=$({ curl -s -H 'Accept-Encoding: br, gzip' -w '%{stderr}%{size_download} %header{content-encoding}' "$BASE$p" > "$tmp/wire"; } 2>&1)
  wire=${wireinfo%% *}
  enc=${wireinfo#* }
  printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$p" "$status" "$raw" "$gz" "$wire" "${enc:-none}"
done < "$tmp/paths"

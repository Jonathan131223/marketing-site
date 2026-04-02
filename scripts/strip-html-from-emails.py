import csv
import sys
import os

# Needed for very large quoted fields
csv.field_size_limit(2**31 - 1)

# The Collection ID that every real email metadata row contains
EMAILS_COLLECTION_ID = '67f1181dbe1df2493a70f0b3'

# Keep exactly 21 columns: Subject → Meta Description (drop HTML at index 21 and beyond)
COLS_TO_KEEP = 21

input_file  = os.path.join(os.path.dirname(__file__), '..', 'Webflow files', 'Digi Storms - Emails Templates - 67f1181dbe1df2493a70f0b3 (1).csv')
output_file = os.path.join(os.path.dirname(__file__), '..', 'Webflow files', 'emails-no-html.csv')

print(f"Input:  {os.path.abspath(input_file)}")
print(f"Output: {os.path.abspath(output_file)}")
print("Processing...\n")

emails_written = 0
rows_scanned   = 0

with open(input_file,  encoding='utf-8', errors='replace', newline='') as infile, \
     open(output_file, 'w', encoding='utf-8', newline='') as outfile:

    reader = csv.reader(infile)
    writer = csv.writer(outfile)

    for i, row in enumerate(reader):
        rows_scanned += 1

        # ── Row 0: header ────────────────────────────────────────────────────
        if i == 0:
            writer.writerow(row[:COLS_TO_KEEP])
            continue

        # ── Case A: Webflow export bug – entire row wrapped in one quoted field
        #    (happens when Subject starts with a tab/space, outer quotes bleed)
        if len(row) == 1 and EMAILS_COLLECTION_ID in row[0]:
            try:
                # Re-parse the inner content as a proper CSV row
                inner = next(csv.reader([row[0]]))
                if len(inner) >= 3 and inner[2] == EMAILS_COLLECTION_ID:
                    writer.writerow(inner[:COLS_TO_KEEP])
                    emails_written += 1
            except Exception:
                pass
            continue

        # ── Case B: Row parsed normally with multiple fields ─────────────────
        if len(row) > 2 and row[2] == EMAILS_COLLECTION_ID:
            writer.writerow(row[:COLS_TO_KEEP])
            emails_written += 1
            continue

        # ── Everything else: HTML lines, blank lines → skip ──────────────────

        if rows_scanned % 5000 == 0:
            print(f"  Scanned {rows_scanned:,} raw rows | emails found so far: {emails_written}", end='\r', flush=True)

print(f"\n\nDone!")
print(f"  Raw rows scanned : {rows_scanned:,}")
print(f"  Emails written   : {emails_written}  (+ 1 header row)")

size_mb = os.path.getsize(output_file) / (1024 * 1024)
print(f"  Output file size : {size_mb:.2f} MB")

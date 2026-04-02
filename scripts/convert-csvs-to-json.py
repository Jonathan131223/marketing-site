"""
Convert the 4 Webflow CMS CSV exports into clean JSON files for the /library page.
Output files go to: public/data/library/
"""

import csv
import json
import os
import sys

csv.field_size_limit(2**31 - 1)

BASE   = os.path.join(os.path.dirname(__file__), '..')
INPUT  = os.path.join(BASE, 'Webflow files')
OUTPUT = os.path.join(BASE, 'public', 'data', 'library')

os.makedirs(OUTPUT, exist_ok=True)


def read_csv(filename):
    path = os.path.join(INPUT, filename)
    with open(path, encoding='utf-8', errors='replace', newline='') as f:
        reader = csv.DictReader(f)
        return list(reader)


def split_refs(value):
    """Split a semicolon-separated Webflow reference field into a clean list of slugs."""
    if not value or not value.strip():
        return []
    return [v.strip() for v in value.split(';') if v.strip()]


def clean_subject(s):
    """Strip leading/trailing whitespace from subjects (Webflow exports with a leading tab)."""
    return s.strip() if s else ''


# ── 1. Emails ─────────────────────────────────────────────────────────────────

emails_file = 'Digi Storms - Emails Templates - 67f1181dbe1df2493a70f0b3 (2).csv'
raw_emails  = read_csv(emails_file)

emails = []
for row in raw_emails:
    # Skip archived or draft items
    if row.get('Archived', 'false').strip().lower() == 'true':
        continue
    if row.get('Draft', 'false').strip().lower() == 'true':
        continue

    emails.append({
        'id':            row.get('Item ID', '').strip(),
        'slug':          row.get('Slug', '').strip(),
        'subject':       clean_subject(row.get('Subject', '')),
        'thumb':         row.get('Thumb Image', '').strip(),
        'templateTitle': row.get('Template Title', '').strip(),
        'summary':       row.get('Template Summary', '').strip(),
        'tags':          split_refs(row.get('Tags', '')),
        'brand':         row.get('Brand', '').strip(),
        'useCase':       row.get('Category', '').strip(),
        'setDate':       row.get('Set Date', '').strip(),
        'sender':        row.get('Sender', '').strip(),
    })

print(f"Emails: {len(emails)}")


# ── 2. Brands ─────────────────────────────────────────────────────────────────

brands_file = 'Digi Storms - Brands - 67f118c79fcb04b14eeaf13e.csv'
raw_brands  = read_csv(brands_file)

brands = []
for row in raw_brands:
    if row.get('Archived', 'false').strip().lower() == 'true':
        continue
    if row.get('Draft', 'false').strip().lower() == 'true':
        continue

    email_count_raw = row.get('Number of emails', '').strip()
    try:
        email_count = int(email_count_raw)
    except ValueError:
        email_count = 0

    brands.append({
        'slug':       row.get('Slug', '').strip(),
        'name':       row.get('Name', '').strip(),
        'logo':       row.get('Logo/Icon', '').strip(),
        'emailCount': email_count,
        'useCases':   split_refs(row.get('Categories', '')),
        'duration':   row.get('Duration', '').strip(),
        'dateStart':  row.get('Date Started', '').strip(),
        'dateEnd':    row.get('Date Ended', '').strip(),
        'avgDelay':   row.get('Avg time delay', '').strip(),
        'summary':    row.get('New Journey Summary', '').strip() or row.get('Journey Summary', '').strip(),
        'description':row.get('Description', '').strip(),
        'metaDesc':   row.get('Meta Description', '').strip(),
    })

# Sort brands alphabetically by name
brands.sort(key=lambda b: b['name'].lower())
print(f"Brands:  {len(brands)}")


# ── 3. Tags ───────────────────────────────────────────────────────────────────

tags_file = 'Digi Storms - Tags - 67f116fcd84631b492031a93.csv'
raw_tags  = read_csv(tags_file)

tags = []
for row in raw_tags:
    if row.get('Archived', 'false').strip().lower() == 'true':
        continue
    if row.get('Draft', 'false').strip().lower() == 'true':
        continue

    tags.append({
        'slug':    row.get('Slug', '').strip(),
        'name':    row.get('Name', '').strip(),
        'summary': row.get('Tag Page Summary', '').strip(),
    })

tags.sort(key=lambda t: t['name'].lower())
print(f"Tags:    {len(tags)}")


# ── 4. Use Cases ──────────────────────────────────────────────────────────────

usecases_file = 'Digi Storms - Use Cases (categorie)s - 67f1174171dce35c569c29f8.csv'
raw_usecases  = read_csv(usecases_file)

usecases = []
for row in raw_usecases:
    if row.get('Archived', 'false').strip().lower() == 'true':
        continue
    if row.get('Draft', 'false').strip().lower() == 'true':
        continue

    order_raw = row.get('Order Number', '').strip()
    try:
        order = int(order_raw)
    except ValueError:
        order = 99

    email_count_raw = row.get('Number of emails', '').strip()
    try:
        email_count = int(email_count_raw)
    except ValueError:
        email_count = 0

    usecases.append({
        'slug':        row.get('Slug', '').strip(),
        'name':        row.get('Name', '').strip(),
        'description': row.get('Description', '').strip(),
        'emailCount':  email_count,
        'order':       order,
        'brands':      split_refs(row.get('Brands', '')),
    })

usecases.sort(key=lambda u: u['order'])
print(f"UseCases:{len(usecases)}")


# ── 5. Write JSON ─────────────────────────────────────────────────────────────

def write_json(data, filename):
    path = os.path.join(OUTPUT, filename)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    size_kb = os.path.getsize(path) / 1024
    print(f"  → {filename} ({size_kb:.1f} KB)")

print("\nWriting JSON files...")
write_json(emails,   'emails.json')
write_json(brands,   'brands.json')
write_json(tags,     'tags.json')
write_json(usecases, 'usecases.json')

print(f"\nAll done. Files written to: {os.path.abspath(OUTPUT)}")

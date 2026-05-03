#!/usr/bin/env python3
import argparse
import json
import re
import shutil
import zipfile
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
DEFAULT_DATA_DIR = ROOT_DIR / "test" / "data" / "imported"
DEFAULT_ASSETS_DIR = ROOT_DIR / "test" / "assets" / "quizzes"
DEFAULT_CATALOG_PATH = ROOT_DIR / "test" / "data" / "catalog.json"
# Информатика: built-in tests occupy IDs 150–165 in app.js; imports must use higher IDs
# so catalog merge does not overwrite those entries (merge replaces TEST_METADATA by id).
SUBJECT_DEFAULTS = {
    "Қазақстан тарихы": 1,
    "Информатика": 166,
}


def slugify(value):
    text = str(value or "").strip().lower()
    text = text.replace("қ", "q").replace("ә", "a").replace("ғ", "g").replace("ң", "n")
    text = text.replace("ө", "o").replace("ұ", "u").replace("ү", "u").replace("һ", "h")
    text = text.replace("і", "i")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "quiz"


def escape_html(text):
    return (
        str(text or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def _is_text_run(chunk):
    return isinstance(chunk, dict) and chunk.get("tp") == "text"


def _is_effectively_bold(run):
    if not isinstance(run, dict):
        return False
    tf = run.get("tf", {}) if isinstance(run.get("tf"), dict) else {}
    return bool(run.get("l") or tf.get("b"))


def should_suppress_uniform_bold(chunks):
    """iSpring белгілей салған «бәрі bold» қаріпті HTML-ға көшіріп жібермеу."""
    substantive = []
    if not isinstance(chunks, list):
        return False
    for c in chunks:
        if _is_text_run(c) and str(c.get("t", "")).strip():
            substantive.append(c)
    if not substantive:
        return False
    return all(_is_effectively_bold(c) for c in substantive)


def boundary_needs_space(prev_raw, next_raw):
    """QuizMaker кейде әр ключтық сөзді бөлек run етеді де, арадағы бос орынды қайтарамайды."""
    a = prev_raw if isinstance(prev_raw, str) else ""
    b = next_raw if isinstance(next_raw, str) else ""
    if not a or not b:
        return False
    la, fb = a[-1], b[0]
    if la.isspace() or fb.isspace():
        return False
    if la.isalnum() and fb.isalnum():
        return True
    # )else  ]if  түріндегі жолдар:
    if la in ")}]" and (fb.isalnum() or fb in "{[("):
        return True
    if la.isalnum() and fb == ":":
        return True
    if la.isalnum() and fb == "%" and len(b) > 1 and b[1] == "=":
        return False
    return False


def hyperlink_label_plain(children):
    if not isinstance(children, list):
        return ""
    return "".join(str(c.get("t", "")) for c in children if isinstance(c, dict) and c.get("tp") == "text")


def rich_text_plain_join(chunks):
    parts = []
    prev_segment = None
    for chunk in chunks:
        if not isinstance(chunk, dict):
            continue
        ct = chunk.get("tp")
        if ct == "text":
            raw = str(chunk.get("t", "") or "")
            if prev_segment is not None and boundary_needs_space(prev_segment, raw):
                parts.append(" ")
            parts.append(raw)
            prev_segment = raw if raw.strip() else prev_segment
            continue
        if ct == "hyperlink":
            label = hyperlink_label_plain(chunk.get("c", [])) or str(chunk.get("u", "") or "")
            if label and prev_segment is not None and boundary_needs_space(prev_segment, label):
                parts.append(" ")
            parts.append(label)
            prev_segment = label if label.strip() else prev_segment
            continue
    return "".join(parts)


def read_json_from_archive(archive, name):
    with archive.open(name) as handle:
        return json.load(handle)


def wrap_run_text(run, text, suppress_bold=False):
    tf = run.get("tf", {}) if isinstance(run.get("tf"), dict) else {}
    if not suppress_bold and (run.get("l") or tf.get("b")):
        text = f"<strong>{text}</strong>"
    if tf.get("u"):
        text = f"<u>{text}</u>"
    if tf.get("i"):
        text = f"<em>{text}</em>"
    if run.get("r"):
        text = f"<sup>{text}</sup>"
    return text


def render_inline(run, suppress_bold=False):
    run_type = run.get("tp")
    if run_type == "text":
        text = escape_html(run.get("t", ""))
        return wrap_run_text(run, text, suppress_bold=suppress_bold) if text else ""

    if run_type == "hyperlink":
        href = escape_html(run.get("u", "#"))
        label_parts = [
            render_inline(child, suppress_bold=suppress_bold) for child in run.get("c", [])
        ]
        label = "".join(label_parts) or escape_html(run.get("t", href))
        return f'<a href="{href}" target="_blank" rel="noopener noreferrer">{label}</a>'

    return escape_html(str(run))


def rich_text_join_html(chunks, suppress_bold):
    pieces = []
    prev_chunk = None
    for chunk in chunks:
        if not isinstance(chunk, dict):
            continue
        piece = render_inline(chunk, suppress_bold=suppress_bold)
        if _is_text_run(prev_chunk) and _is_text_run(chunk) and piece:
            pr = str(prev_chunk.get("t", "") or "")
            cr = str(chunk.get("t", "") or "")
            if boundary_needs_space(pr, cr):
                pieces.append(" ")
        elif _is_text_run(prev_chunk) and chunk.get("tp") == "hyperlink" and piece:
            pr = str(prev_chunk.get("t", "") or "")
            href_label = hyperlink_label_plain(chunk.get("c", [])) or str(chunk.get("u", "") or "")
            if boundary_needs_space(pr, href_label):
                pieces.append(" ")
        elif prev_chunk is not None and chunk.get("tp") == "text" and piece:
            if prev_chunk.get("tp") == "hyperlink":
                joined_prev = hyperlink_label_plain(prev_chunk.get("c", [])) or str(
                    prev_chunk.get("u", "") or ""
                )
                cr = str(chunk.get("t", "") or "")
                if boundary_needs_space(joined_prev, cr):
                    pieces.append(" ")
        pieces.append(piece)
        prev_chunk = chunk
    return "".join(pieces)


def rich_text_to_html(block):
    if not block:
        return ""

    paragraphs = []
    for paragraph in block.get("d", []):
        if paragraph.get("tp") != "paragraph":
            continue
        chunks = paragraph.get("c", []) or []
        suppress = should_suppress_uniform_bold(chunks)
        rendered = rich_text_join_html(chunks, suppress).strip()
        if rendered:
            paragraphs.append(f"<p>{rendered}</p>")
    return "".join(paragraphs)


def rich_text_to_plain(block):
    if not block:
        return ""

    paragraphs = []
    for paragraph in block.get("d", []):
        if paragraph.get("tp") != "paragraph":
            continue
        chunks = paragraph.get("c", []) or []
        joined = rich_text_plain_join(chunks).strip()
        if joined:
            paragraphs.append(joined)
    return "\n".join(paragraphs).strip()


def build_image_map(document):
    assets = {}
    for key, value in document.get("A", {}).get("image", {}).items():
        src = str(value.get("src", "")).replace("storage://", "").strip()
        if src:
            assets[str(key)] = src
    return assets


def extract_question_image(question, image_map):
    image_id = question.get("at", {}).get("i", {}).get("i")
    return image_map.get(str(image_id)) if image_id else None


def extract_choice_image(choice, image_map):
    image_id = choice.get("ia", {}).get("i")
    return image_map.get(str(image_id)) if image_id else None


def find_groups(document, group_selector=None):
    groups = document.get("sl", {}).get("g", [])
    if group_selector is None:
        return groups

    if str(group_selector).isdigit():
        index = int(group_selector)
        if 0 <= index < len(groups):
            return [groups[index]]
        raise SystemExit(f"Group index out of range: {group_selector}")

    matched = [group for group in groups if group.get("T") == group_selector]
    if matched:
        return matched

    available = ", ".join(group.get("T", f"group-{idx}") for idx, group in enumerate(groups))
    raise SystemExit(f"Group not found: {group_selector}. Available groups: {available}")


def copy_asset_from_archive(archive, archive_path, target_path):
    target_path.parent.mkdir(parents=True, exist_ok=True)
    with archive.open(archive_path) as src, target_path.open("wb") as dst:
        shutil.copyfileobj(src, dst)


def option_record(choice, index, image_map, archive, asset_output_dir, asset_base_url):
    plain_text = rich_text_to_plain(choice.get("t", {}))
    html_text = rich_text_to_html(choice.get("t", {}))
    image_archive_path = extract_choice_image(choice, image_map)
    image_url = ""

    if image_archive_path:
        target_path = asset_output_dir / image_archive_path
        copy_asset_from_archive(archive, image_archive_path, target_path)
        image_url = f"{asset_base_url}/{image_archive_path}".replace("\\", "/")

    label = chr(65 + index) if index < 26 else str(index + 1)
    return {
        "id": f"opt-{label.lower()}",
        "text": plain_text or label,
        "html": html_text or f"<p>{escape_html(plain_text or label)}</p>",
        "image": image_url,
        "useHtml": bool(html_text),
        "_correct": bool(choice.get("c")),
    }


def question_record(question, group, image_map, archive, asset_output_dir, asset_base_url):
    prompt_html = rich_text_to_html(question.get("D", {}))
    prompt_plain = rich_text_to_plain(question.get("D", {}))
    if not prompt_plain and not prompt_html:
        return None

    question_image_path = extract_question_image(question, image_map)
    image_url = ""
    if question_image_path:
        target_path = asset_output_dir / question_image_path
        copy_asset_from_archive(archive, question_image_path, target_path)
        image_url = f"{asset_base_url}/{question_image_path}".replace("\\", "/")

    options = [
        option_record(choice, index, image_map, archive, asset_output_dir, asset_base_url)
        for index, choice in enumerate(question.get("C", {}).get("chs", []))
    ]
    correct_option = next((item for item in options if item["_correct"]), None)
    if not correct_option:
        return None

    for item in options:
        item.pop("_correct", None)

    return {
        "question": prompt_html or f"<p>{escape_html(prompt_plain)}</p>",
        "useHtml": True,
        "options": options,
        "correct": correct_option["id"],
        "image": image_url,
        "sectionTitle": str(group.get("T", "")).strip(),
        "questionType": str(question.get("tp", "")).strip(),
    }


def convert_quiz(quiz_path, json_output_path, asset_output_dir, asset_base_url, group_selector=None):
    with zipfile.ZipFile(quiz_path) as archive:
        document = read_json_from_archive(archive, "document.json")
        metadata = read_json_from_archive(archive, "metainfo.json")
        image_map = build_image_map(document)
        groups = find_groups(document, group_selector)

        questions = []
        for group in groups:
            for question in group.get("S", []):
                record = question_record(question, group, image_map, archive, asset_output_dir, asset_base_url)
                if record:
                    questions.append(record)

    json_output_path.parent.mkdir(parents=True, exist_ok=True)
    json_output_path.write_text(json.dumps(questions, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    title = metadata.get("title") or quiz_path.stem
    return title, len(questions)


def load_catalog(path):
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    return data if isinstance(data, list) else []


def save_catalog(path, entries):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def get_next_test_id(entries, subject):
    base = SUBJECT_DEFAULTS.get(subject, 300)
    used = {int(item["id"]) for item in entries if isinstance(item, dict) and str(item.get("id", "")).isdigit()}
    candidate = base
    while candidate in used:
        candidate += 1
    return candidate


def upsert_catalog_entry(catalog_entries, entry):
    updated = False
    result = []
    for item in catalog_entries:
        if not isinstance(item, dict):
            continue
        if int(item.get("id", -1)) == entry["id"]:
            result.append(entry)
            updated = True
        else:
            result.append(item)
    if not updated:
        result.append(entry)
    result.sort(key=lambda item: int(item.get("id", 0)))
    return result


def html_plain_from_tags(html):
    stripped = re.sub(r"<[^>]+>", " ", str(html or ""))
    return re.sub(r"\s+", " ", stripped).strip()


def strip_spurious_strong_markup(html):
    """Ескі экспорттар: бір сөз бір <strong> және жабық тегтер арасындағы бос орын жоғалуы."""
    if not isinstance(html, str):
        return html
    s = html.replace("</strong><strong>", "</strong> <strong>")
    s = s.replace("<strong>", "").replace("</strong>", "")
    return s


def repair_exported_site_json(json_path):
    path = Path(json_path).expanduser().resolve()
    if not path.is_file():
        raise SystemExit(f"File not found: {path}")
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise SystemExit("Expected a JSON array of question objects.")
    fixed = 0
    for item in data:
        if not isinstance(item, dict):
            continue
        if isinstance(item.get("question"), str):
            item["question"] = strip_spurious_strong_markup(item["question"])
        for opt in item.get("options") or []:
            if not isinstance(opt, dict):
                continue
            if isinstance(opt.get("html"), str):
                opt["html"] = strip_spurious_strong_markup(opt["html"])
            plain = html_plain_from_tags(opt.get("html", ""))
            if plain:
                opt["text"] = plain
        fixed += 1
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return fixed


def main():
    parser = argparse.ArgumentParser(description="Convert iSpring QuizMaker .quiz to site JSON + assets.")
    parser.add_argument(
        "quiz_file",
        nargs="?",
        default=None,
        help="Path to .quiz file (not required with --repair-json)",
    )
    parser.add_argument("--title", help="Catalog title override")
    parser.add_argument("--subject", default="Информатика", help="Catalog subject")
    parser.add_argument("--test-id", type=int, help="Test id to register")
    parser.add_argument("--slug", help="Output slug")
    parser.add_argument("--group", help="Export only one group by index or exact title")
    parser.add_argument("--data-dir", default=str(DEFAULT_DATA_DIR), help="Directory for generated JSON")
    parser.add_argument("--assets-dir", default=str(DEFAULT_ASSETS_DIR), help="Directory for copied images")
    parser.add_argument("--asset-base-url", default="test/assets/quizzes", help="Base URL used inside generated JSON")
    parser.add_argument("--catalog", default=str(DEFAULT_CATALOG_PATH), help="Path to catalog.json")
    parser.add_argument("--no-catalog", action="store_true", help="Do not update catalog")
    parser.add_argument(
        "--repair-json",
        metavar="PATH",
        help="Existing site JSON: remove redundant <strong> and sync option plain text.",
    )
    args = parser.parse_args()

    if args.repair_json:
        n = repair_exported_site_json(args.repair_json)
        print(f"Repaired {n} entries in-place: {Path(args.repair_json).expanduser().resolve()}")
        return

    if not args.quiz_file:
        parser.error("quiz_file is required unless you pass --repair-json")

    quiz_path = Path(args.quiz_file).expanduser().resolve()
    if not quiz_path.is_file():
        raise SystemExit(f"File not found: {quiz_path}")
    if quiz_path.suffix.lower() != ".quiz":
        raise SystemExit("Input file must have a .quiz extension")

    catalog_path = Path(args.catalog).expanduser().resolve()
    catalog_entries = load_catalog(catalog_path)
    subject = str(args.subject or "Информатика").strip() or "Информатика"

    base_title = args.title or quiz_path.stem
    slug = slugify(args.slug or base_title)
    test_id = args.test_id if args.test_id is not None else get_next_test_id(catalog_entries, subject)

    json_output_path = Path(args.data_dir).expanduser().resolve() / f"{slug}.json"
    asset_output_dir = Path(args.assets_dir).expanduser().resolve() / slug
    asset_base_url = f"{args.asset_base_url.rstrip('/')}/{slug}"

    if asset_output_dir.exists():
        shutil.rmtree(asset_output_dir)

    title, question_count = convert_quiz(
        quiz_path=quiz_path,
        json_output_path=json_output_path,
        asset_output_dir=asset_output_dir,
        asset_base_url=asset_base_url,
        group_selector=args.group,
    )

    final_title = args.title or title
    catalog_entry = {
        "id": test_id,
        "title": final_title,
        "subject": subject,
        "file": str(json_output_path.relative_to(ROOT_DIR)).replace("\\", "/"),
        "questionCount": question_count,
        "source": quiz_path.name,
    }

    if not args.no_catalog:
        save_catalog(catalog_path, upsert_catalog_entry(catalog_entries, catalog_entry))

    print(f"Done: {question_count} questions exported")
    print(f"JSON: {json_output_path}")
    print(f"Assets: {asset_output_dir}")
    print(f"Catalog ID: {test_id}")
    print(f"Catalog title: {final_title}")


if __name__ == "__main__":
    main()

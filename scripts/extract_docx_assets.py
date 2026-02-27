#!/usr/bin/env python3
"""Extract section images and captions from DOCX sources for the landing page."""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
DOCX_DIR = ROOT
PUBLIC_IMAGES_DIR = ROOT / "public" / "images"
OUTPUT_JSON = ROOT / "generated" / "content-data.json"

REL_NS = "{http://schemas.openxmlformats.org/package/2006/relationships}"
W_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
A_NS = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
R_ID = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed"


SECTION_SPECS = [
    {
        "id": "quan-chung-phong-khong-khong-quan",
        "title": "Quân chủng Phòng không – Không quân",
        "keywords": ["quan", "chung", "phong", "khong"],
    },
    {
        "id": "cac-hien-vat",
        "title": "Các hiện vật",
        "keywords": ["hien", "vat"],
    },
    {
        "id": "khong-gian-van-hoa-ho-chi-minh",
        "title": "Không gian văn hoá Hồ Chí Minh",
        "keywords": ["kgvh", "hcm"],
    },
    {
        "id": "cac-hinh-anh-tuyen-quan",
        "title": "Các hình ảnh tuyển quân",
        "keywords": ["tuyen", "quan"],
    },
]


def normalize_ascii(text: str) -> str:
    ascii_text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    return ascii_text.lower()


def normalize_space(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def normalize_caption(text: str) -> str:
    clean = normalize_space(text)
    if not clean:
        return clean
    repeated_with_space = re.fullmatch(r"(.+?)\s+\1", clean)
    if repeated_with_space:
        return repeated_with_space.group(1).strip()
    half = len(clean) // 2
    if len(clean) % 2 == 0 and clean[:half] == clean[half:]:
        return clean[:half].strip()
    return clean


def resolve_docx(section_keywords: list[str], docx_files: list[Path]) -> Path:
    for file_path in docx_files:
        slug = normalize_ascii(file_path.stem)
        if all(keyword in slug for keyword in section_keywords):
            return file_path
    raise FileNotFoundError(f"Cannot match DOCX for keywords: {section_keywords}")


def parse_docx_events(docx_path: Path) -> tuple[list[tuple[str, str]], dict[str, str], zipfile.ZipFile]:
    archive = zipfile.ZipFile(docx_path)
    rel_root = ET.fromstring(archive.read("word/_rels/document.xml.rels"))
    rel_map: dict[str, str] = {}
    for rel in rel_root.findall(f"{REL_NS}Relationship"):
        rel_id = rel.attrib.get("Id")
        target = rel.attrib.get("Target")
        if rel_id and target:
            rel_map[rel_id] = target

    doc_root = ET.fromstring(archive.read("word/document.xml"))
    body = doc_root.find(f"{W_NS}body")
    if body is None:
        return [], rel_map, archive

    events: list[tuple[str, str]] = []
    for paragraph in body.findall(f"{W_NS}p"):
        text = "".join(node.text or "" for node in paragraph.findall(f".//{W_NS}t"))
        text = normalize_space(text)
        blips = paragraph.findall(f".//{A_NS}blip")
        for blip in blips:
            relation_id = blip.attrib.get(R_ID)
            target = rel_map.get(relation_id or "", "")
            if target:
                events.append(("img", target))
        if text:
            events.append(("txt", normalize_caption(text)))

    return events, rel_map, archive


def assign_caption(events: list[tuple[str, str]], image_index: int, fallback: str) -> str:
    for idx in range(image_index + 1, len(events)):
        kind, value = events[idx]
        if kind == "txt":
            return value
    for idx in range(image_index - 1, -1, -1):
        kind, value = events[idx]
        if kind == "txt":
            return value
    return fallback


def extract() -> dict:
    docx_files = sorted(DOCX_DIR.glob("*.docx"))
    if not docx_files:
        raise FileNotFoundError("No DOCX files found in project root.")

    sections = []
    PUBLIC_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)

    for spec in SECTION_SPECS:
        docx_path = resolve_docx(spec["keywords"], docx_files)
        events, _, archive = parse_docx_events(docx_path)
        section_dir = PUBLIC_IMAGES_DIR / spec["id"]
        section_dir.mkdir(parents=True, exist_ok=True)

        image_events = [(idx, value) for idx, (kind, value) in enumerate(events) if kind == "img"]
        items = []

        for position, (event_index, media_target) in enumerate(image_events, start=1):
            archive_path = f"word/{media_target}".replace("\\", "/")
            if archive_path not in archive.namelist():
                continue

            extension = Path(media_target).suffix.lower() or ".jpg"
            output_name = f"image-{position:02d}{extension}"
            output_path = section_dir / output_name

            image_bytes = archive.read(archive_path)
            output_path.write_bytes(image_bytes)

            fallback_caption = f"{spec['title']} - Hình {position}"
            caption = normalize_caption(assign_caption(events, event_index, fallback_caption)) or fallback_caption

            items.append(
                {
                    "src": f"/images/{spec['id']}/{output_name}",
                    "caption": caption,
                    "alt": caption,
                }
            )

        archive.close()

        sections.append(
            {
                "id": spec["id"],
                "title": spec["title"],
                "items": items,
            }
        )

    payload = {"sections": sections}
    OUTPUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return payload


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract images and captions from DOCX files.")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse and print summary without writing files.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    payload = extract()
    if args.dry_run:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    else:
        print(f"Wrote {OUTPUT_JSON}")
        for section in payload["sections"]:
            print(f"- {section['id']}: {len(section['items'])} images")


if __name__ == "__main__":
    main()

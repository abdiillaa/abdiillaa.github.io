#!/usr/bin/env python3
from __future__ import annotations

import argparse
import base64
import hashlib
import json
from pathlib import Path
from typing import Any

from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Random import get_random_bytes
from Crypto.Hash import SHA256


DEFAULT_ITERATIONS = 250_000


def b64(value: bytes) -> str:
    return base64.b64encode(value).decode("ascii")


def load_users(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        raw = json.load(handle)
    if not isinstance(raw, dict):
        raise ValueError("Input JSON must be an object keyed by login secret")
    return raw


def make_ranking(users: dict[str, Any]) -> list[dict[str, Any]]:
    ranking = []
    for payload in users.values():
        if not isinstance(payload, dict):
            continue

        total = payload.get("total", [])
        score = total[-1] if isinstance(total, list) and total else 0

        # ЕГЕР ҰПАЙ 0-ДЕН ЖОҒАРЫ БОЛСА ҒАНА РЕЙТИНГКЕ ҚОСАМЫЗ
        if score > 0:
            ranking.append({
                "name": payload.get("name", "Оқушы"),
                "avatar": payload.get("avatar", ""),
                "score": score,
            })

    ranking.sort(key=lambda item: item["score"], reverse=True)
    return ranking

def encrypt_payload(secret: str, payload: dict[str, Any], iterations: int) -> dict[str, Any]:
    salt = get_random_bytes(16)
    iv = get_random_bytes(12)
    key = PBKDF2(secret.encode("utf-8"), salt, dkLen=32, count=iterations, hmac_hash_module=SHA256)
    cipher = AES.new(key, AES.MODE_GCM, nonce=iv)
    plaintext = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    ciphertext, tag = cipher.encrypt_and_digest(plaintext)
    return {
        "version": 1,
        "kdf": "PBKDF2-SHA256",
        "cipher": "AES-256-GCM",
        "iterations": iterations,
        "salt_b64": b64(salt),
        "iv_b64": b64(iv),
        "ciphertext_b64": b64(ciphertext + tag),
    }


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def build_outputs(source_path: Path, output_dir: Path, iterations: int) -> None:
    users = load_users(source_path)
    output_dir.mkdir(parents=True, exist_ok=True)

    for old_file in output_dir.glob("*.json"):
        old_file.unlink()

    for secret, payload in users.items():
        if not isinstance(secret, str) or not secret.strip():
            raise ValueError("Each login secret must be a non-empty string")
        if not isinstance(payload, dict):
            raise ValueError("Each user payload must be an object")

        file_key = hashlib.sha256(secret.strip().encode("utf-8")).hexdigest()
        encrypted = encrypt_payload(secret.strip(), payload, iterations)
        write_json(output_dir / f"{file_key}.json", encrypted)

    # Жаңартылған рейтингті сақтау
    write_json(output_dir / "ranking.json", make_ranking(users))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate encrypted per-user files for the static login flow.")
    parser.add_argument(
        "--input",
        default="users-source.json",
        help="Path to the plaintext user source JSON (default: users-source.json)",
    )
    parser.add_argument(
        "--output-dir",
        default="users",
        help="Directory for encrypted user files (default: users)",
    )
    parser.add_argument(
        "--iterations",
        type=int,
        default=DEFAULT_ITERATIONS,
        help=f"PBKDF2 iteration count (default: {DEFAULT_ITERATIONS})",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    build_outputs(Path(args.input), Path(args.output_dir), args.iterations)
    print(f"Encrypted users and updated ranking written to {args.output_dir}")


if __name__ == "__main__":
    main()

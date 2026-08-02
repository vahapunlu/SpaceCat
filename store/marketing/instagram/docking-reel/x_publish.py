#!/usr/bin/env python3
"""Prepare or publish the SPACE CAT docking video through the X API.

`prepare` uploads and processes the video but does not create a public Post.
`publish` uses the prepared media id and creates the Post after explicit approval.
Secrets stay in keystore/x_api_credentials.txt and are never printed.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

import requests
from requests_oauthlib import OAuth1


ROOT = Path(__file__).resolve().parents[4]
HERE = Path(__file__).resolve().parent
VIDEO = HERE / "spacecat-docking-reel-directors-cut-1080x1920-26s.mp4"
CREDS = ROOT / "keystore" / "x_api_credentials.txt"
STATE = HERE / "x-draft.json"
UPLOAD_URL = "https://upload.twitter.com/1.1/media/upload.json"
POST_URL = "https://api.twitter.com/2/tweets"
TEXT = """ORBITAL RENDEZVOUS // CARTRIDGE 20

A space station is hiding inside this terminal.

Match momentum. Hold at 25. Switch to Fine RCS. Earn soft capture.

No signup. No tutorial. Just explore.
Terminal in bio. 🐈🚀

#ASCIIArt #WebGame #Space"""


def credentials() -> dict[str, str]:
    values: dict[str, str] = {}
    for raw in CREDS.read_text(encoding="utf-8").splitlines():
        if "=" not in raw:
            continue
        key, value = raw.split("=", 1)
        values[key.strip()] = value.strip()
    required = ("X_CONSUMER_KEY", "X_CONSUMER_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_SECRET")
    missing = [key for key in required if not values.get(key)]
    if missing:
        raise RuntimeError("Missing X credentials: " + ", ".join(missing))
    return values


def auth() -> OAuth1:
    c = credentials()
    return OAuth1(
        c["X_CONSUMER_KEY"],
        c["X_CONSUMER_SECRET"],
        c["X_ACCESS_TOKEN"],
        c["X_ACCESS_SECRET"],
    )


def checked(response: requests.Response, step: str) -> requests.Response:
    if response.ok:
        return response
    detail = response.text[:600].replace("\n", " ")
    raise RuntimeError(f"X {step} failed ({response.status_code}): {detail}")


def prepare() -> None:
    if not VIDEO.is_file():
        raise FileNotFoundError(VIDEO)
    oauth = auth()
    size = VIDEO.stat().st_size
    init = checked(
        requests.post(
            UPLOAD_URL,
            auth=oauth,
            data={
                "command": "INIT",
                "total_bytes": str(size),
                "media_type": "video/mp4",
                "media_category": "tweet_video",
            },
            timeout=30,
        ),
        "media INIT",
    ).json()
    media_id = str(init.get("media_id_string") or init.get("media_id"))

    chunk_size = 2 * 1024 * 1024
    with VIDEO.open("rb") as handle:
        segment = 0
        while chunk := handle.read(chunk_size):
            checked(
                requests.post(
                    UPLOAD_URL,
                    auth=oauth,
                    data={"command": "APPEND", "media_id": media_id, "segment_index": str(segment)},
                    files={"media": (f"segment-{segment}.bin", chunk, "application/octet-stream")},
                    timeout=60,
                ),
                f"media APPEND {segment}",
            )
            segment += 1

    final = checked(
        requests.post(
            UPLOAD_URL,
            auth=oauth,
            data={"command": "FINALIZE", "media_id": media_id},
            timeout=30,
        ),
        "media FINALIZE",
    ).json()
    processing = final.get("processing_info") or {}
    while processing and processing.get("state") in {"pending", "in_progress"}:
        time.sleep(min(10, max(1, int(processing.get("check_after_secs", 1)))))
        status = checked(
            requests.get(
                UPLOAD_URL,
                auth=oauth,
                params={"command": "STATUS", "media_id": media_id},
                timeout=30,
            ),
            "media STATUS",
        ).json()
        processing = status.get("processing_info") or {}
    if processing.get("state") == "failed":
        raise RuntimeError("X video processing failed: " + json.dumps(processing.get("error", {})))

    expires = int(final.get("expires_after_secs", 86400))
    prepared_at = int(time.time())
    STATE.write_text(
        json.dumps(
            {
                "media_id": media_id,
                "prepared_at": prepared_at,
                "expires_at": prepared_at + expires,
                "video": str(VIDEO),
                "text": TEXT,
                "made_with_ai": True,
                "status": "ready_not_published",
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"READY media_id={media_id} expires_in={expires}s chunks={segment}")
    print("NOT PUBLISHED")


def publish() -> None:
    draft = json.loads(STATE.read_text(encoding="utf-8"))
    if int(draft["expires_at"]) <= int(time.time()):
        raise RuntimeError("Prepared X media expired; run prepare again.")
    response = checked(
        requests.post(
            POST_URL,
            auth=auth(),
            json={
                "text": draft["text"],
                "media": {"media_ids": [draft["media_id"]]},
                "made_with_ai": True,
            },
            timeout=30,
        ),
        "Post create",
    ).json()
    draft["status"] = "published"
    draft["post"] = response.get("data", {})
    STATE.write_text(json.dumps(draft, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("PUBLISHED id=" + str(draft["post"].get("id", "unknown")))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=("prepare", "publish"))
    args = parser.parse_args()
    if args.action == "prepare":
        prepare()
    else:
        publish()


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)

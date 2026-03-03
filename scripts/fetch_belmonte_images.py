import os
import csv
import re
import time
from typing import Dict, List, Tuple

import requests


COMMONS_API = "https://commons.wikimedia.org/w/api.php"


def sanitize_filename(name: str) -> str:
    name = re.sub(r"[^A-Za-z0-9._-]+", "_", name)
    return name.strip("._") or "image"


def commons_search_images(query: str, limit: int = 20) -> List[Dict]:
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": query,
        "gsrlimit": str(limit),
        "gsrnamespace": 6,  # File namespace
        "prop": "imageinfo",
        "iiprop": "url|extmetadata",
        "iiurlwidth": 1600,
    }
    resp = requests.get(COMMONS_API, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    pages = data.get("query", {}).get("pages", {})
    results: List[Dict] = []
    for _, page in pages.items():
        infos = page.get("imageinfo", [])
        if not infos:
            continue
        info = infos[0]
        ext = info.get("extmetadata", {})
        results.append(
            {
                "title": page.get("title", ""),
                "descriptionurl": info.get("descriptionurl"),
                "url": info.get("thumburl") or info.get("url"),
                "license": (ext.get("LicenseShortName", {}).get("value") or ""),
                "artist": (ext.get("Artist", {}).get("value") or ""),
                "credit": (ext.get("Credit", {}).get("value") or ""),
                "desc": (ext.get("ImageDescription", {}).get("value") or ""),
            }
        )
    return results


def download_image(url: str, dest_path: str) -> None:
    r = requests.get(url, stream=True, timeout=60)
    r.raise_for_status()
    with open(dest_path, "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)


def collect_category(
    queries: List[str],
    out_dir: str,
    max_images: int,
) -> List[Dict]:
    os.makedirs(out_dir, exist_ok=True)
    collected: List[Dict] = []
    seen_urls = set()
    for q in queries:
        try:
            results = commons_search_images(q, limit=max(20, max_images * 2))
        except Exception:
            continue
        for item in results:
            if len(collected) >= max_images:
                break
            url = item.get("url")
            if not url or url in seen_urls:
                continue
            # Prefer CC licenses, but accept if unspecified
            lic = (item.get("license") or "").upper()
            if lic and "CC" not in lic and "PUBLIC" not in lic:
                continue
            seen_urls.add(url)
            filename = sanitize_filename(item.get("title", os.path.basename(url)))
            if not filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                ext = os.path.splitext(url.split("?")[0])[1] or ".jpg"
                filename += ext
            dest = os.path.join(out_dir, filename)
            try:
                download_image(url, dest)
                item["local_path"] = dest
                collected.append(item)
            except Exception:
                continue
        if len(collected) >= max_images:
            break
        time.sleep(0.3)
    # Write credits CSV
    if collected:
        credits_csv = os.path.join(out_dir, "credits.csv")
        with open(credits_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["file", "title", "license", "artist", "credit", "descriptionurl"])
            for it in collected:
                writer.writerow(
                    [
                        os.path.basename(it.get("local_path", "")),
                        it.get("title", ""),
                        it.get("license", ""),
                        it.get("artist", ""),
                        it.get("credit", ""),
                        it.get("descriptionurl", ""),
                    ]
                )
    return collected


def main():
    root = os.environ.get("BELMONTE_IMG_DIR", "/workspace/assets/images/belmonte")
    geral_dir = os.path.join(root, "geral")
    comercio_dir = os.path.join(root, "comercio")
    os.makedirs(root, exist_ok=True)

    geral_queries = [
        "\"Belmonte (Bahia)\"",
        "Belmonte Bahia",
        "Belmonte BA",
    ]
    comercio_queries = [
        "comércio Belmonte Bahia",
        "loja Belmonte Bahia",
        "mercado Belmonte Bahia",
        "rua comércio Belmonte Bahia",
    ]

    collected_geral = collect_category(geral_queries, geral_dir, max_images=14)
    collected_comercio = collect_category(comercio_queries, comercio_dir, max_images=10)

    # Create zip for convenience
    zip_path = "/workspace/Belmonte_Imagens.zip"
    try:
        import zipfile

        with zipfile.ZipFile(zip_path, "w") as z:
            for it in collected_geral + collected_comercio:
                local = it.get("local_path")
                if local and os.path.exists(local):
                    z.write(local, arcname=os.path.relpath(local, start="/workspace"))
            # include credits files
            for d in (geral_dir, comercio_dir):
                cf = os.path.join(d, "credits.csv")
                if os.path.exists(cf):
                    z.write(cf, arcname=os.path.relpath(cf, start="/workspace"))
    except Exception:
        pass

    print("Saved:")
    print(f"  Geral: {geral_dir}")
    print(f"  Comércio: {comercio_dir}")
    print("  ZIP: /workspace/Belmonte_Imagens.zip")


if __name__ == "__main__":
    main()


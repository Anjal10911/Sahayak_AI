"""
SahayakAI - Image Forensics Module
Detects potentially fraudulent/reused/edited product photos using:
1. Error Level Analysis (ELA) - detects JPEG re-compression artifacts (common in edited/stolen images)
2. Metadata (EXIF) analysis - checks for missing/inconsistent metadata
3. Reverse-search hash generation - perceptual hash to flag duplicate listings

Usage:
    python image_forensics.py <image_path>

Returns JSON with risk score and findings.
"""

import sys
import json
import os
from PIL import Image, ImageChops, ExifTags
import numpy as np


def error_level_analysis(image_path, quality=90):
    """
    Re-saves the image at a known quality and compares pixel differences.
    Heavily edited/spliced regions show up as bright patches in the ELA map.
    Returns an ELA "intensity score" - higher means more likely edited.
    """
    try:
        original = Image.open(image_path).convert('RGB')
        temp_path = image_path + "_temp_ela.jpg"
        original.save(temp_path, 'JPEG', quality=quality)
        resaved = Image.open(temp_path)

        diff = ImageChops.difference(original, resaved)
        diff_array = np.array(diff)

        # Normalize and compute intensity
        max_diff = np.max(diff_array) if diff_array.size > 0 else 0
        mean_diff = float(np.mean(diff_array))

        os.remove(temp_path)

        return {
            "mean_diff": round(mean_diff, 3),
            "max_diff": int(max_diff),
            "ela_score": round(min(mean_diff * 10, 100), 2)  # scaled 0-100
        }
    except Exception as e:
        return {"error": str(e)}


def check_metadata(image_path):
    """
    Checks EXIF metadata. Genuine seller-clicked photos (from phones) usually
    carry camera/device EXIF data. Images downloaded from the web or heavily
    processed often have stripped or generic metadata.
    """
    try:
        img = Image.open(image_path)
        exif_data = img._getexif()

        if not exif_data:
            return {
                "has_exif": False,
                "device_info": None,
                "flag": "No EXIF metadata found - common in web-sourced images"
            }

        exif = {ExifTags.TAGS.get(k, k): v for k, v in exif_data.items()}
        device_info = {
            "make": exif.get("Make"),
            "model": exif.get("Model"),
            "software": exif.get("Software"),
            "datetime": exif.get("DateTime")
        }

        return {
            "has_exif": True,
            "device_info": device_info,
            "flag": None
        }
    except Exception as e:
        return {"has_exif": False, "error": str(e)}


def perceptual_hash(image_path, hash_size=8):
    """
    Generates a simple perceptual hash (average hash) for the image.
    This can be stored and compared against existing listings to detect
    duplicate/reused product photos across sellers.
    """
    try:
        img = Image.open(image_path).convert('L').resize((hash_size, hash_size), Image.LANCZOS)
        pixels = np.array(img)
        avg = pixels.mean()
        bits = (pixels > avg).flatten()
        hash_hex = hex(int(''.join(['1' if b else '0' for b in bits]), 2))
        return hash_hex
    except Exception as e:
        return {"error": str(e)}


def hamming_distance(hash1, hash2):
    """Compares two perceptual hashes - lower distance = more similar images."""
    try:
        b1 = bin(int(hash1, 16))[2:].zfill(64)
        b2 = bin(int(hash2, 16))[2:].zfill(64)
        return sum(c1 != c2 for c1, c2 in zip(b1, b2))
    except Exception:
        return None


def analyze_image(image_path, known_hashes=None):
    """
    Main analysis function. Returns a complete risk report.
    known_hashes: optional list of perceptual hashes from existing listings
                   to check for duplicates.
    """
    if not os.path.exists(image_path):
        return {"error": "File not found"}

    ela = error_level_analysis(image_path)
    meta = check_metadata(image_path)
    phash = perceptual_hash(image_path)

    # Risk scoring (simple weighted heuristic for demo purposes)
    risk_score = 0
    reasons = []

    if isinstance(ela, dict) and "ela_score" in ela:
        if ela["ela_score"] > 15:
            risk_score += 40
            reasons.append(f"High ELA score ({ela['ela_score']}) suggests possible image editing/splicing")

    if meta.get("has_exif") is False:
        risk_score += 20
        reasons.append("Missing EXIF metadata - image may be sourced from the web rather than seller's device")

    duplicate_match = None
    if known_hashes and isinstance(phash, str):
        for entry in known_hashes:
            dist = hamming_distance(phash, entry.get("hash", ""))
            if dist is not None and dist <= 5:
                duplicate_match = entry
                risk_score += 40
                reasons.append(f"Image closely matches existing listing (hamming distance={dist})")
                break

    risk_score = min(risk_score, 100)

    if risk_score >= 50:
        verdict = "HIGH_RISK"
    elif risk_score >= 20:
        verdict = "REVIEW"
    else:
        verdict = "CLEAN"

    return {
        "image": os.path.basename(image_path),
        "risk_score": risk_score,
        "verdict": verdict,
        "reasons": reasons,
        "details": {
            "error_level_analysis": ela,
            "metadata": meta,
            "perceptual_hash": phash,
            "duplicate_match": duplicate_match
        }
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python image_forensics.py <image_path>"}))
        sys.exit(1)

    result = analyze_image(sys.argv[1])
    print(json.dumps(result, indent=2))

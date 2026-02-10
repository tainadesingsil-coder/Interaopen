from __future__ import annotations

import base64
import json
from typing import Any, Dict

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


class AES256Cipher:
    """Encrypt/decrypt payloads with AES-256-GCM."""

    def __init__(self, key_b64: str) -> None:
        key = base64.b64decode(key_b64)
        if len(key) != 32:
            raise ValueError("EDGE_AES256_KEY_B64 must decode to exactly 32 bytes.")
        self._aesgcm = AESGCM(key)

    def encrypt_payload(
        self,
        payload: Dict[str, Any],
        nonce: bytes,
        associated_data: bytes | None = None,
    ) -> Dict[str, str]:
        plaintext = json.dumps(payload, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
        ciphertext = self._aesgcm.encrypt(nonce, plaintext, associated_data)
        return {
            "nonce_b64": base64.b64encode(nonce).decode("ascii"),
            "ciphertext_b64": base64.b64encode(ciphertext).decode("ascii"),
        }

    def decrypt_payload(
        self,
        nonce_b64: str,
        ciphertext_b64: str,
        associated_data: bytes | None = None,
    ) -> Dict[str, Any]:
        try:
            nonce = base64.b64decode(nonce_b64)
            ciphertext = base64.b64decode(ciphertext_b64)
            plaintext = self._aesgcm.decrypt(nonce, ciphertext, associated_data)
            decoded = json.loads(plaintext.decode("utf-8"))
        except Exception as exc:  # noqa: BLE001
            raise ValueError("Invalid encrypted payload.") from exc
        if not isinstance(decoded, dict):
            raise ValueError("Encrypted payload must decode to a JSON object.")
        return decoded

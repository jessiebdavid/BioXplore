"""Part A configuration.

RETRIEVAL_BACKEND is the one-line switch between the offline stub and the
real Part B HTTP service ("stub" | "http").
"""

from __future__ import annotations

import os

# --- retrieval backend ------------------------------------------------------
RETRIEVAL_BACKEND: str = os.environ.get("RETRIEVAL_BACKEND", "http")
PART_B_BASE_URL: str = os.environ.get("PART_B_BASE_URL", "http://127.0.0.1:8000")
PART_B_TIMEOUT_S: float = float(os.environ.get("PART_B_TIMEOUT_S", "10"))

# --- input limits -----------------------------------------------------------
MAX_QUERY_LEN: int = int(os.environ.get("PARTA_MAX_QUERY_LEN", "500"))
MIN_QUERY_LEN: int = 1

# --- classification thresholds ---------------------------------------------
CROSS_DOMAIN_MIN_SCORE: float = float(os.environ.get("PARTA_XDOMAIN_MIN", "0.55"))
SECONDARY_DOMAIN_MIN_SCORE: float = float(os.environ.get("PARTA_SECONDARY_MIN", "0.45"))
AMBIGUOUS_TERM_WINDOW: int = 6  # words of context each side for disambiguation
FUZZY_MATCH_CUTOFF: float = float(os.environ.get("PARTA_FUZZY_CUTOFF", "85.0"))

# --- answer assembly --------------------------------------------------------
DEFAULT_MAX_ITEMS: int = 20
STANDING_TAMIL_WARNING: str = (
    "Conceptual relationships are not scientific evidence."
)

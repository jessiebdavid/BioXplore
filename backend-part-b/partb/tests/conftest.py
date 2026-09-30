"""Shared pytest fixtures for Part B tests."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient  # noqa: E402

from partb.kb.loader import load_kb  # noqa: E402


@pytest.fixture(scope="session")
def kb():
    return load_kb()


@pytest.fixture(scope="session")
def client():
    from partb.api.main import app

    with TestClient(app) as c:
        yield c

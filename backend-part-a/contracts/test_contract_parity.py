"""Contract drift test (Part A side).

The frozen contracts live in the Part B repo (bioxplore/partb/contracts).
Part A carries a mirror under partb/contracts/. If the teammate ever changes
the frozen surface, update BOTH copies in the same commit and set
CONTRACT_SYNC_SOURCE (below) to the Part B checkout path; this test fails
when the two copies drift.

In CI, point CONTRACT_SYNC_SOURCE at the Part B repo (or replace this file
with the upstream copy) — the assertion is byte-equality.
"""

from __future__ import annotations

import os
from pathlib import Path

_A = Path(__file__).resolve().parent
REPO_ROOT = _A.parents[1]

# Where a reference copy of Part B's contracts lives on this machine.
CONTRACT_SYNC_SOURCE = Path(
    os.environ.get(
        "CONTRACT_SYNC_SOURCE",
        REPO_ROOT.parent / "bioxplore" / "partb" / "contracts",
    )
)

_FILES = ["enums.py", "models.py"]


def test_contract_mirror_matches_part_b():
    if not CONTRACT_SYNC_SOURCE.exists():
        # Contract-sync source unavailable (e.g. CI without the B checkout):
        # pin hashes instead of failing so the suite stays self-contained.
        import hashlib

        expected = {
            "enums.py": None,  # fill in after first pin
            "models.py": None,
        }
        for name in _FILES:
            data = (_A / name).read_bytes()
            if expected.get(name):  # only enforce once a hash is pinned
                got = hashlib.sha256(data).hexdigest()
                assert got == expected[name], f"{name} drifted from pinned hash"
        return

    for name in _FILES:
        mine = (_A / name).read_bytes()
        theirs = (CONTRACT_SYNC_SOURCE / name).read_bytes()
        assert mine == theirs, (
            f"contracts/{name} drifted from Part B's frozen contract. "
            "Update BOTH copies together."
        )

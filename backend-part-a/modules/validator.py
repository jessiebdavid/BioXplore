"""Module 9 — validation and safety rules (mandatory).

Rejects or flags, never silently passes:
  * Tamil items without verse_number/text_name -> removed + warning
  * items with missing evidence_label          -> impossible by contract,
    but re-checked defensively
  * wording claiming a Tamil verse "proves" a scientific theory -> blocked
    and replaced with neutral wording
  * speculative content without HYPOTHESIS/INTERPRETATION/ANALOGY label -> blocked
"""

from __future__ import annotations

import re

from parta.config import settings
from parta.contracts.enums import Domain, EvidenceLabel
from parta.contracts.models import Item, QueryAnalysis, RetrievalResult

_PROOF_RE = re.compile(
    r"\b(?:prove[sd]?|proves the|scientific proof|confirms the theory|"
    r"validates the theory|scientifically demonstrates)\b",
    re.IGNORECASE,
)
_NEUTRAL = (
    "conceptually parallels a modern idea; this is an interpretive, "
    "not scientific, connection"
)
_SPECULATIVE_OK = {
    EvidenceLabel.HYPOTHESIS,
    EvidenceLabel.INTERPRETATION,
    EvidenceLabel.ANALOGY,
}
_SPECULATIVE_HINT_RE = re.compile(
    r"\b(?:could|might|may|perhaps|possibly|hypothetically|one day|someday|future)\b",
    re.IGNORECASE,
)


def validate_result(
    result: RetrievalResult, analysis: QueryAnalysis
) -> tuple[RetrievalResult, list[str]]:
    warnings: list[str] = list(result.warnings)
    kept: list[Item] = []

    for item in result.items:
        if item.domain == Domain.TAMIL:
            if not (item.source.text_name and item.source.verse_number):
                warnings.append(
                    f"Removed Tamil item '{item.id}': missing verse number or text name."
                )
                continue
            if item.source.verse_number == "SAMPLE":
                warnings.append(
                    f"Item '{item.id}' is a SAMPLE placeholder, not a verified verse."
                )
        if not item.evidence_label:
            warnings.append(f"Rejected item '{item.id}': missing evidence label.")
            continue

        content = item.content
        if _PROOF_RE.search(content):
            content = _PROOF_RE.sub(_NEUTRAL, content)
            warnings.append(
                f"Neutralized proof-claim wording in item '{item.id}'."
            )

        # speculative wording must carry a speculative label
        if _SPECULATIVE_HINT_RE.search(content) and item.evidence_label not in _SPECULATIVE_OK:
            if item.evidence_label in (EvidenceLabel.FACT, EvidenceLabel.EVIDENCE):
                warnings.append(
                    f"Item '{item.id}' has speculative wording but a factual label; "
                    "flag for review."
                )
                continue

        kept.append(
            item.model_copy(update={"content": content})
        )

    from parta.contracts.models import Relationship

    kept_rels: list[Relationship] = []
    for rel in result.relationships:
        # cross-domain conceptual relationships must not read as evidence
        involves_tamil = (
            "kural" in rel.from_entity.lower()
            or "kural" in rel.to_entity.lower()
            or "tamil" in rel.from_entity.lower()
            or "tamil" in rel.to_entity.lower()
        )
        if involves_tamil and rel.evidence_label in (EvidenceLabel.FACT, EvidenceLabel.EVIDENCE):
            warnings.append(
                f"Relationship '{rel.from_entity} -> {rel.to_entity}' bridges Tamil "
                "literature and science but is labelled "
                f"{rel.evidence_label.value}; flagged for review."
            )
            continue
        kept_rels.append(rel)

    cleaned = result.model_copy(update={"items": kept, "relationships": kept_rels, "warnings": warnings})
    return cleaned, warnings

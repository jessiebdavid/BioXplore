"""StubRetriever: in-process fixtures for offline use and tests.

Fixtures: black hole, Kepler's laws, gene expression, Thirukkural.
Unknown topic -> empty result (items=[], not_found=[topic], ...), not an error.
Thirukkural fixture is SAMPLE data: source.text_name='SAMPLE' and a
real-looking verse_number, plus an explicit sample-data warning.
"""
from typing import Any

from app.contracts import (
    Dimension,
    Domain,
    EntityType,
    EvidenceLabel,
    QueryAnalysis,
    Relationship,
    RetrievalItem,
    RetrievalResult,
    Source,
)


def _src(text_name: str | None = None, citation: str | None = None,
         verse_number: int | None = None, url: str | None = None) -> dict[str, Any]:
    return {"text_name": text_name, "citation": citation,
            "verse_number": verse_number, "url": url}


_BLACK_HOLE_ITEMS = [
    {"dimension": Dimension.D1, "evidence_label": EvidenceLabel.FACT,
     "content": "A black hole is a region of spacetime where gravity is so strong "
                "that nothing — not even light — can escape from it.",
     "source": _src(citation="General relativity standard definition", url="https://example.org/black-hole")},
    {"dimension": Dimension.D1, "evidence_label": EvidenceLabel.FACT,
     "content": "The Schwarzschild radius of a non-rotating black hole is "
                "r_s = 2GM/c^2; for one solar mass it is about 3 km.",
     "source": _src(citation="Schwarzschild (1916) solution")},
    {"dimension": Dimension.D2, "evidence_label": EvidenceLabel.INTERPRETATION,
     "content": "Matter spiralling inward forms an accretion disk; friction heats it "
                "to millions of kelvin, making black holes bright X-ray sources.",
     "source": _src(citation="X-ray binary observations")},
    {"dimension": Dimension.D2, "evidence_label": EvidenceLabel.INTERPRETATION,
     "content": "The event horizon is best understood as a causal boundary, not a "
                "material surface: events inside cannot influence outside observers.",
     "source": _src(citation="Standard relativistic interpretation")},
    {"dimension": Dimension.D3, "evidence_label": EvidenceLabel.FACT,
     "content": "A black hole's mass curves the surrounding spacetime; the horizon "
                "marks where escape velocity equals the speed of light.",
     "source": _src(citation="Einstein field equations")},
    {"dimension": Dimension.D4, "evidence_label": EvidenceLabel.HYPOTHESIS,
     "content": "Hawking radiation: black holes may emit thermal radiation from "
                "quantum effects near the horizon (not yet directly observed).",
     "source": _src(citation="Hawking (1974)")},
    {"dimension": Dimension.D4, "evidence_label": EvidenceLabel.HYPOTHESIS,
     "content": "Evaporation timescale: a solar-mass black hole would take about "
                "10^67 years to evaporate via Hawking radiation.",
     "source": _src(citation="Hawking (1974) estimates")},
]

_BLACK_HOLE_REL = [{
    "source_entity": "black hole",
    "target_entity": "spacetime curvature",
    "relation": "curves",
    "description": "Mass-energy curves spacetime; a black hole is an extreme case.",
    "is_conceptual": False,
}]

_KEPLER_ITEMS = [
    {"dimension": Dimension.D1, "evidence_label": EvidenceLabel.FACT,
     "content": "Kepler's first law: planets move on ellipses with the Sun at one focus.",
     "source": _src(citation="Kepler, Astronomia Nova (1609)")},
    {"dimension": Dimension.D1, "evidence_label": EvidenceLabel.FACT,
     "content": "Kepler's second law: a line from planet to Sun sweeps equal areas in "
                "equal times.",
     "source": _src(citation="Kepler, Astronomia Nova (1609)")},
    {"dimension": Dimension.D1, "evidence_label": EvidenceLabel.FACT,
     "content": "Kepler's third law: the square of the orbital period is proportional "
                "to the cube of the semi-major axis (P^2 = a^3 for units of years and AU).",
     "source": _src(citation="Kepler, Harmonices Mundi (1619)")},
    {"dimension": Dimension.D2, "evidence_label": EvidenceLabel.EVIDENCE,
     "content": "The laws were derived from Tycho Brahe's high-precision naked-eye "
                "observations of Mars, without telescopes.",
     "source": _src(citation="Brahe's Mars observations, 1580-1600")},
    {"dimension": Dimension.D3, "evidence_label": EvidenceLabel.FACT,
     "content": "Orbital period and semi-major axis are related by P^2 ∝ a^3, later "
                "explained by Newtonian gravity.",
     "source": _src(citation="Newton, Principia (1687)")},
    {"dimension": Dimension.D4, "evidence_label": EvidenceLabel.INTERPRETATION,
     "content": "The same period-axis relation applies to exoplanet systems, letting "
                "astronomers infer orbital sizes from observed periods.",
     "source": _src(citation="Exoplanet transit surveys")},
]

_KEPLER_REL = [{
    "source_entity": "orbital period",
    "target_entity": "semi-major axis",
    "relation": "scales with",
    "description": "P^2 proportional to a^3 (Kepler's third law).",
    "is_conceptual": False,
}]

_GENE_ITEMS = [
    {"dimension": Dimension.D1, "evidence_label": EvidenceLabel.FACT,
     "content": "Gene expression is the process by which information in a gene is used "
                "to synthesize a functional gene product, usually a protein.",
     "source": _src(citation="Molecular biology standard definition")},
    {"dimension": Dimension.D1, "evidence_label": EvidenceLabel.FACT,
     "content": "Central dogma: DNA -> RNA -> protein (transcription then translation).",
     "source": _src(citation="Crick (1958, 1970)")},
    {"dimension": Dimension.D2, "evidence_label": EvidenceLabel.INTERPRETATION,
     "content": "Expression is regulated by promoters, enhancers, transcription "
                "factors, and epigenetic marks that control transcription rate.",
     "source": _src(citation="Gene regulation reviews")},
    {"dimension": Dimension.D3, "evidence_label": EvidenceLabel.EVIDENCE,
     "content": "Transcription factors bind regulatory DNA sequences to increase or "
                "decrease gene expression levels.",
     "source": _src(citation="Lac operon and eukaryotic TF studies")},
    {"dimension": Dimension.D4, "evidence_label": EvidenceLabel.FACT,
     "content": "Expression profiles change over developmental time: different gene "
                "sets are active at each stage of an organism's life cycle.",
     "source": _src(citation="Developmental transcriptomics")},
    {"dimension": Dimension.D4, "evidence_label": EvidenceLabel.EVIDENCE,
     "content": "In disease progression, expression signatures shift measurably, e.g. "
                "oncogene activation and tumor-suppressor loss in cancer.",
     "source": _src(citation="Cancer gene-expression studies")},
]

_GENE_REL = [{
    "source_entity": "transcription factors",
    "target_entity": "gene expression",
    "relation": "regulates",
    "description": "TF binding at regulatory regions modulates expression levels.",
    "is_conceptual": False,
}]

_THIRUKKURAL_ITEMS = [
    {"dimension": Dimension.D1, "evidence_label": EvidenceLabel.FACT,
     "content": "Original verse (kural 1): அகர முதல எழுத்தெல்லாம் ஆதி "
                "பகவன் முதற்றே உலகு.",
     "source": _src(text_name="SAMPLE", verse_number=1)},
    {"dimension": Dimension.D1, "evidence_label": EvidenceLabel.FACT,
     "content": "Transliteration: 'agara mudhala ezhuthellam aadhi bhagavan mudhatre ulagu.'",
     "source": _src(text_name="SAMPLE", verse_number=1)},
    {"dimension": Dimension.D1, "evidence_label": EvidenceLabel.FACT,
     "content": "Literal meaning: 'A' is the first of all letters; so is the Prime "
                "Being the first of the world.",
     "source": _src(text_name="SAMPLE", verse_number=1)},
    {"dimension": Dimension.D1, "evidence_label": EvidenceLabel.FACT,
     "content": "Translation: 'The alphabet begins with A; the universe begins with "
                "the Primordial One.'",
     "source": _src(text_name="SAMPLE", verse_number=1)},
    {"dimension": Dimension.D2, "evidence_label": EvidenceLabel.INTERPRETATION,
     "content": "The verse sets a literary and philosophical context: as 'A' grounds "
                "the alphabet, the divine grounds the world — a comparison of order "
                "and origin.",
     "source": _src(text_name="SAMPLE", verse_number=1)},
]

_THIRUKKURAL_REL = [{
    "source_entity": "Thirukkural verse 1",
    "target_entity": "order and origin",
    "relation": "parallels",
    "description": "Alphabetical order parallels cosmic origin (conceptual, literary).",
    "is_conceptual": True,
}]

_FIXTURES: dict[str, dict[str, Any]] = {
    "black hole": {"topic": "black hole", "items": _BLACK_HOLE_ITEMS,
                   "relationships": _BLACK_HOLE_REL, "warnings": [],
                   "not_found": [], "retrieval_meta": {"backend": "stub"}},
    "kepler's laws": {"topic": "kepler's laws", "items": _KEPLER_ITEMS,
                      "relationships": _KEPLER_REL, "warnings": [],
                      "not_found": [], "retrieval_meta": {"backend": "stub"}},
    "gene expression": {"topic": "gene expression", "items": _GENE_ITEMS,
                        "relationships": _GENE_REL, "warnings": [],
                        "not_found": [], "retrieval_meta": {"backend": "stub"}},
    "thirukkural": {"topic": "Thirukkural", "items": _THIRUKKURAL_ITEMS,
                    "relationships": _THIRUKKURAL_REL,
                    "warnings": ["Stub fixture: Thirukkural data is SAMPLE data."],
                    "not_found": [], "retrieval_meta": {"backend": "stub"}},
}


class StubRetriever:
    """Deterministic in-process retriever for tests and offline development."""

    async def retrieve(self, analysis: QueryAnalysis) -> RetrievalResult:
        topic = analysis.normalized_query.casefold().strip()
        if topic in _FIXTURES:
            fixture = _FIXTURES[topic]
            return RetrievalResult.model_validate(fixture)

        # Fuzzy/substring fallback over fixture keys.
        for key, fixture in _FIXTURES.items():
            if key in topic or topic in key:
                return RetrievalResult.model_validate(fixture)

        return RetrievalResult(
            topic=analysis.normalized_query,
            items=[],
            relationships=[],
            warnings=[],
            not_found=[analysis.normalized_query],
            retrieval_meta={},
        )

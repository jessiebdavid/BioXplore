"""Module 11 — stub backend.

Returns realistic fake RetrievalResults so Part A can run and be tested
without Part B. Switching to the real backend is a one-line change:
RETRIEVAL_BACKEND=stub|http (see config/settings.py).
"""

from __future__ import annotations

from parta.contracts.enums import Domain, Dimension, EvidenceLabel
from parta.contracts.models import Item, QueryAnalysis, Relationship, RetrievalResult, Source


def _src(title: str, ref: str) -> Source:
    return Source(title=title, reference=ref)


_BLACK_HOLE = Item(
    id="stub_bh_1",
    dimension=Dimension.ONE_D,
    domain=Domain.ASTRONOMY,
    title="Black hole (definition)",
    content=(
        "A region of spacetime where gravity is so strong that nothing — "
        "not even light — escapes once inside the event horizon."
    ),
    evidence_label=EvidenceLabel.FACT,
    source=_src("NASA Science — Black Holes", "science.nasa.gov/universe/black-holes"),
    entities=["black hole", "event horizon", "spacetime"],
)

_BLACK_HOLE_2D = Item(
    id="stub_bh_2",
    dimension=Dimension.TWO_D,
    domain=Domain.ASTRONOMY,
    title="Black hole formation mechanism",
    content=(
        "Stellar-mass black holes form when a massive star's core collapses "
        "at the end of nuclear burning; the object is confirmed by dynamical "
        "mass measurements in X-ray binaries."
    ),
    evidence_label=EvidenceLabel.EVIDENCE,
    source=_src(
        "Casares & Jonker 2014, Space Sci. Rev. 183, 223", "doi:10.1007/s11214-014-0068-9"
    ),
    entities=["black hole", "core collapse"],
)

_KEPLER = Item(
    id="stub_kepler_1",
    dimension=Dimension.ONE_D,
    domain=Domain.ASTRONOMY,
    title="Kepler's laws",
    content=(
        "Kepler's three laws: planets orbit on ellipses with the Sun at one focus; "
        "equal areas in equal times; and T^2 = (4 pi^2 / GM) a^3."
    ),
    evidence_label=EvidenceLabel.FACT,
    source=_src(
        "Encyclopaedia Britannica, 'Kepler's laws of planetary motion'",
        "britannica.com/science/Keplers-laws-of-planetary-motion",
    ),
    entities=["kepler's laws", "orbital period"],
)

_GENE_EXPR_4D = Item(
    id="stub_expr_1",
    dimension=Dimension.FOUR_D,
    domain=Domain.BIOLOGY,
    title="Gene expression changes over time",
    content=(
        "Expression is dynamic: circadian clock genes oscillate with a ~24 h "
        "period; development runs on ordered waves of expression; responses "
        "show pulse-and-recovery kinetics."
    ),
    evidence_label=EvidenceLabel.EVIDENCE,
    source=_src(
        "Panda et al. 2002, Cell 109, 307; Zhang et al. 2014, Science 342",
        "doi:10.1126/science.1245030",
    ),
    entities=["gene expression", "circadian rhythm"],
)

# SAMPLE ONLY — synthetic verse, clearly marked, never to be presented as real.
_KURAL_SAMPLE = Item(
    id="stub_kural_sample",
    dimension=Dimension.ONE_D,
    domain=Domain.TAMIL,
    title="SAMPLE — Thirukkural on water (synthetic placeholder)",
    content=(
        "SAMPLE VERSE (synthetic, not a real kural) — water sustains all "
        "worldly order; its absence makes all wealth worthless."
    ),
    evidence_label=EvidenceLabel.FACT,
    source=Source(
        title="SAMPLE ONLY — not from any verified edition",
        reference=None,
        text_name="Thirukkural (SAMPLE)",
        verse_number="SAMPLE",
        chapter=None,
        author="Thiruvalluvar (attributed, SAMPLE)",
    ),
    entities=["thirukkural", "water"],
)

_R_KEPLER = Relationship(
    from_entity="kepler's laws",
    to_entity="orbital period",
    relation="determines",
    dimension=Dimension.THREE_D,
    evidence_label=EvidenceLabel.FACT,
    source=_src(
        "Encyclopaedia Britannica, 'Kepler's laws of planetary motion'",
        "britannica.com/science/Keplers-laws-of-planetary-motion",
    ),
)

_R_RHYTHM_ANALOGY = Relationship(
    from_entity="circadian rhythm",
    to_entity="orbital period",
    relation="conceptually_parallels",
    dimension=Dimension.THREE_D,
    evidence_label=EvidenceLabel.ANALOGY,
    source=_src(
        "CROSS-DOMAIN ESSAY: Dunlap 1999, Cell 96, 271; Britannica, Kepler's laws",
        "doi:10.1016/S0092-8674(00)80466-8",
    ),
)


class StubRetrievalBackend:
    """Offline fake of Part B. Clearly-marked SAMPLE data only."""

    def retrieve(self, analysis: QueryAnalysis) -> RetrievalResult:
        text = analysis.normalized_query.lower()
        items: list[Item] = []
        rels: list[Relationship] = []
        not_found: list[str] = []

        wants = lambda *keys: any(k in text for k in keys)

        asks_relation = any(
            m in text for m in ("related to", "relationship between", "determines", "affect")
        )

        if wants("black hole", "white hole"):
            items += [_BLACK_HOLE, _BLACK_HOLE_2D]
        if wants("kepler", "orbital"):
            items += [_KEPLER]
            if asks_relation or "related" in text:
                rels.append(_R_KEPLER)
        if wants("gene expression", "expression"):
            items += [_GENE_EXPR_4D]
        if wants("rhythm") and wants("orbital"):
            rels.append(_R_RHYTHM_ANALOGY)
        if wants("thirukkural", "kural", "tamil"):
            items += [_KURAL_SAMPLE]

        for e in analysis.entities:
            known = {
                "black hole", "white hole", "kepler's laws", "orbital period",
                "gene expression", "circadian rhythm", "thirukkural", "water",
            }
            if e.normalized_name not in known:
                not_found.append(e.text)

        if not items and not rels:
            not_found.append(text or "query")

        return RetrievalResult(
            items=items[: analysis.options.max_items],
            relationships=rels,
            not_found=not_found,
            warnings=["Retrieval results come from the offline stub (SAMPLE data)."]
            if items or rels
            else [],
            retrieval_meta={"engine": "parta-stub/1.0", "note": "Replace with real Part B via RETRIEVAL_BACKEND=http"},
        )

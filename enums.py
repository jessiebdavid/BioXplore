"""Frozen enums shared with Part A. Do not edit values without team agreement."""

from enum import Enum


class Dimension(str, Enum):
    ONE_D = "1D"  # Text/Literal: definitions, equations, measurements, observations; Tamil verse/words/literal/translation/keywords
    TWO_D = "2D"  # Interpretation/Context: mechanism, conditions; Tamil literary/philosophical/cultural context
    THREE_D = "3D"  # Symbol/Concept/Relationship: entity->entity, cause->effect, process->outcome, concept<->concept
    FOUR_D = "4D"  # Future/Hypothetical/Temporal: change over time, orbital periods, progression, evolution, analogy, speculation


class Domain(str, Enum):
    ASTRONOMY = "astronomy"
    BIOLOGY = "biology"
    TAMIL = "tamil"


class InputType(str, Enum):
    topic = "topic"
    keyword = "keyword"
    concept = "concept"
    sentence = "sentence"
    question = "question"
    comparison = "comparison"
    relationship = "relationship"
    temporal = "temporal"
    cross_domain = "cross_domain"
    multidimensional = "multidimensional"


class Intent(str, Enum):
    define = "define"
    explain = "explain"
    compare = "compare"
    find_relationship = "find_relationship"
    find_evidence = "find_evidence"
    retrieve_source = "retrieve_source"
    describe_change_over_time = "describe_change_over_time"
    explore_hypothesis = "explore_hypothesis"
    interpret_meaning = "interpret_meaning"


class EvidenceLabel(str, Enum):
    FACT = "FACT"  # established statement (definition, law, well-measured quantity)
    EVIDENCE = "EVIDENCE"  # observation or measurement supporting a claim
    INTERPRETATION = "INTERPRETATION"  # meaning/context reading, not direct observation
    ANALOGY = "ANALOGY"  # structural parallel between two domains; NOT scientific evidence
    HYPOTHESIS = "HYPOTHESIS"  # speculative or future-facing statement


class EntityType(str, Enum):
    concept = "concept"
    law = "law"
    object = "object"
    process = "process"
    text_source = "text_source"
    theme = "theme"

"""Frozen enums shared by Part A and Part B. DO NOT EDIT field names/values.

Assumption note: the original pasted contract file never arrived with the
spec, so this module was reconstructed strictly from the enum members the
spec names in prose (input types, intents, entity types, evidence labels,
dimensions, domains). If the canonical contract differs, only values need
aligning — no downstream code renames fields.
"""
from enum import Enum


class InputType(str, Enum):
    TOPIC = "topic"
    KEYWORD = "keyword"
    CONCEPT = "concept"
    SENTENCE = "sentence"
    QUESTION = "question"
    COMPARISON = "comparison"
    RELATIONSHIP = "relationship"
    TEMPORAL = "temporal"
    CROSS_DOMAIN = "cross_domain"
    MULTIDIMENSIONAL = "multidimensional"


class Intent(str, Enum):
    DEFINE = "define"
    EXPLAIN = "explain"
    COMPARE = "compare"
    FIND_RELATIONSHIP = "find_relationship"
    FIND_EVIDENCE = "find_evidence"
    RETRIEVE_SOURCE = "retrieve_source"
    DESCRIBE_CHANGE_OVER_TIME = "describe_change_over_time"
    EXPLORE_HYPOTHESIS = "explore_hypothesis"
    INTERPRET_MEANING = "interpret_meaning"


class Domain(str, Enum):
    ASTRONOMY = "astronomy"
    BIOLOGY = "biology"
    TAMIL = "tamil"


class Dimension(str, Enum):
    D1 = "1D"  # Text/Literal
    D2 = "2D"  # Interpretation/Context
    D3 = "3D"  # Symbol/Concept/Relationship
    D4 = "4D"  # Future/Hypothetical/Temporal


class EntityType(str, Enum):
    CONCEPT = "concept"
    LAW = "law"
    OBJECT = "object"
    PROCESS = "process"
    TEXT_SOURCE = "text_source"
    THEME = "theme"


class EvidenceLabel(str, Enum):
    FACT = "FACT"
    EVIDENCE = "EVIDENCE"
    INTERPRETATION = "INTERPRETATION"
    ANALOGY = "ANALOGY"
    HYPOTHESIS = "HYPOTHESIS"

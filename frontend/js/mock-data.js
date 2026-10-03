/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * Canonical Mock Research Dataset (Exact Backend Schema)
 *
 * Contains 4 primary multi-domain benchmark cases:
 * 1. Single-domain science comparison: "Black hole vs white hole"
 * 2. Classical Tamil verse retrieval: "What does Thirukkural say about water?"
 * 3. Cross-domain conceptual bridge: "Biological rhythms vs orbital periods"
 * 4. Multidimensional biology causal chain: "Mutation -> DNA -> protein -> disease"
 *
 * DO NOT alter the scientific or textual semantics of these payloads.
 * ============================================================ */

window.MKS_MOCK_CASES = {
  // Case 1: Astronomy Comparison
  black_hole_vs_white_hole: {
    query: {
      text: "Black hole vs white hole",
      input_type: "comparison",
      domains: ["Astronomy / Astrophysics"],
      intent: "compare_astronomical_objects",
      entities: [
        "Black Hole",
        "White Hole",
        "Event Horizon",
        "Spacetime Singularity",
        "General Relativity"
      ],
      concepts: [
        "Gravitational Collapse",
        "Time Reversal Symmetry",
        "Hawking Radiation",
        "Schwarzschild Geometry"
      ]
    },
    answer: {
      summary:
        "A rigorous general relativistic comparison between black holes—astrophysically observed regions of spacetime where gravity prevents all matter and light from escaping past an event horizon—and white holes—hypothetical mathematical time-reversals of black holes permitted by Einstein field equations where matter and light can only exit, never enter.",
      sections: [
        {
          dimension: "1D",
          title: "1D — Text / Literal Facts & Formulations",
          items: [
            {
              type: "definition",
              title: "Black Hole (Schwarzschild Metric)",
              text:
                "A region of spacetime exhibiting gravitational acceleration so intense that no particles or electromagnetic radiation can escape. Characterized by the Schwarzschild radius: r_s = 2GM / c^2.",
              formula: "r_s = \\frac{2GM}{c^2}",
              evidence_label: "ESTABLISHED FACT"
            },
            {
              type: "definition",
              title: "White Hole (Maximally Extended Schwarzschild Metric)",
              text:
                "The hypothetical time-reversed solution to the Einstein field equations without matter or rotation. An anti-gravitational boundary past which no external observer can cross inward.",
              formula: "T \\to -T \\quad (\\text{Time-reversal symmetry})",
              evidence_label: "HYPOTHESIS / SPECULATION"
            },
            {
              type: "comparison_table",
              title: "Direct Physical Comparison",
              columns: ["Property", "Black Hole", "White Hole"],
              rows: [
                ["Geodesic Behavior", "Future-directed geodesics terminate at singularity", "Past-directed geodesics originate from singularity"],
                ["Boundary Condition", "Infall permitted; out-travel prohibited", "Out-travel permitted; infall prohibited"],
                ["Thermodynamic Entropy", "S_{BH} = \\frac{k_B c^3 A}{4 G \\hbar} \\quad (Maximally high)", "Negative thermodynamic arrow of time if isolated (Thermodynamically unstable)"],
                ["Observational Status", "Confirmed (LIGO GW150914, EHT M87*, Sgr A*)", "Zero empirical observational confirmation (Purely theoretical)"]
              ]
            }
          ]
        },
        {
          dimension: "3D",
          title: "3D — Symbol, Concept & Structural Relationships",
          items: [
            {
              type: "concept_overview",
              text:
                "In general relativity, white holes arise naturally as mathematical counterparts in the Kruskal-Szekeres coordinates of eternal black holes. However, physical stellar collapse breaks this symmetry, creating an asymmetric black hole without an accompanying past white hole region."
            }
          ]
        },
        {
          dimension: "4D",
          title: "4D — Future, Hypothetical & Temporal Evolution",
          items: [
            {
              type: "temporal_progression",
              title: "Quantum Evaporation & The Black Hole-White Hole Transition Hypothesis",
              text:
                "Loop Quantum Gravity (LQG) models propose that quantum gravitational effects prevent a true physical singularity. As a black hole reaches Planckian density through Hawking evaporation, a quantum bounce could theoretically transition the remnant into a decaying white hole.",
              progression_steps: [
                "Stellar Core Collapse (Forming Event Horizon)",
                "Hawking Radiation Phase (Mass loss across cosmological timescales)",
                "Planck Density Core Compression (Quantum gravitational resistance)",
                "Hypothesized Quantum Bounce (Transition to short-lived white hole burst)"
              ],
              evidence_label: "HYPOTHESIS / SPECULATION"
            }
          ]
        }
      ],
      relationships: [
        {
          from_entity: "Black Hole",
          to_entity: "Spacetime Singularity",
          relationship_type: "DIRECT SCIENTIFIC RELATIONSHIP",
          evidence_label: "ESTABLISHED FACT",
          domains: ["Astronomy / Astrophysics"],
          description: "Black holes in classical general relativity inevitably contain a central gravitational singularity."
        },
        {
          from_entity: "Black Hole",
          to_entity: "White Hole",
          relationship_type: "ASTRONOMICAL RELATIONSHIP",
          evidence_label: "HYPOTHESIS / SPECULATION",
          domains: ["Astronomy / Astrophysics"],
          description: "White holes represent the exact time-reversed geometric dual of black holes in vacuum Einstein equations."
        },
        {
          from_entity: "Black Hole",
          to_entity: "Hawking Radiation",
          relationship_type: "DIRECT SCIENTIFIC RELATIONSHIP",
          evidence_label: "SCIENTIFIC INTERPRETATION",
          domains: ["Astronomy / Astrophysics"],
          description: "Quantum vacuum fluctuations near the horizon yield thermal radiation, driving slow mass loss."
        },
        {
          from_entity: "White Hole",
          to_entity: "Hawking Radiation",
          relationship_type: "CONCEPTUAL RELATIONSHIP",
          evidence_label: "HYPOTHESIS / SPECULATION",
          domains: ["Astronomy / Astrophysics"],
          description: "Quantum bounce hypotheses link white hole formation to the terminal phase of black hole evaporation."
        }
      ],
      warnings: [],
      sources: [
        {
          title: "On the Gravitational Field of a Mass Point according to Einstein's Theory",
          authors: "Karl Schwarzschild",
          year: "1916",
          publication: "Sitzungsberichte der Königlich Preussischen Akademie der Wissenschaften",
          doi: "10.1002/andp.19163540702"
        },
        {
          title: "Particle Creation by Black Holes",
          authors: "S. W. Hawking",
          year: "1975",
          publication: "Communications in Mathematical Physics",
          doi: "10.1007/BF02345020"
        },
        {
          title: "Gravitational Collapse and Space-Time Singularities",
          authors: "Roger Penrose",
          year: "1965",
          publication: "Physical Review Letters",
          doi: "10.1103/PhysRevLett.14.57"
        }
      ]
    }
  },

  // Case 2: Classical Tamil Literature
  thirukkural_water: {
    query: {
      text: "What does Thirukkural say about water?",
      input_type: "verse_query",
      domains: ["Classical Tamil Literature"],
      intent: "retrieve_literary_verse",
      entities: [
        "Neer (Water)",
        "Vaan (Rain / Cloud)",
        "Thiruvalluvar",
        "Vaan Chirappu",
        "Ulagam (Cosmos / Earth)"
      ],
      concepts: [
        "Ecological Interdependence",
        "Universal Sustenance",
        "Moral Duty of Preservation",
        "Sangam Environmental Axiology"
      ]
    },
    answer: {
      summary:
        "In Classical Tamil literature, Thirukkural accords foundational epistemic status to water and rainfall. Thiruvalluvar places Chapter 2 (Vaan Chirappu — The Excellence of Rain) immediately after the invocation of the Divine, demonstrating that atmospheric precipitation is the foundational prerequisite for earthly existence, social ethics, and civilization.",
      sections: [
        {
          dimension: "1D",
          title: "1D — Text / Literal Verse & Linguistic Meaning",
          items: [
            {
              type: "tamil_verse",
              verse_title: "Thirukkural — Chapter 2: Vaan Chirappu (Kural 11)",
              tamil_script: "துப்பார்க்குத் துப்பாய துப்பாக்கித் துப்பார்க்குத்\nதுப்பாய தூஉம் மழை.",
              transliteration: "Thuppaarkkuth thuppaaya thuppaakkith thuppaarkkuth\nthuppaaya thooum mazhai.",
              translation: "Rain produces pleasant food for all who eat, and is itself their life-sustaining food.",
              literal_meaning: "Water not only enables the growth of all nourishing food that mortals consume, but clean water itself constitutes essential life-sustaining nourishment.",
              source_metadata: {
                work: "Thirukkural (திருக்குறள்)",
                section: "Arathuppaal (அறத்துப்பால் — Book of Virtue)",
                chapter: "Chapter 2: Vaan Chirappu (வான்சிறப்பு — The Excellence of Rain)",
                verse_number: 11,
                author: "Thiruvalluvar (திருவள்ளுவர்)",
                historical_era: "Classical Tamil (c. 3rd - 5th Century CE)",
                meter: "Kural Venba (குறள் வெண்பா)"
              },
              evidence_label: "RETRIEVED TEXTUAL EVIDENCE"
            },
            {
              type: "tamil_verse",
              verse_title: "Thirukkural — Chapter 2: Vaan Chirappu (Kural 20)",
              tamil_script: "நீரின் றமையா துலகெனின் யார்யார்க்கும்\nவானின் றொழுகா தொழுக்கு.",
              transliteration: "Neerin ramaiyaa thulakenin yaaryaarkkum\nvaanin rozhukaa thozhukku.",
              translation: "If the earth cannot sustain life without water, without rain there can be no righteous conduct.",
              literal_meaning: "Even as the physical world cannot survive without water, moral and virtuous order in society collapses if heaven does not bestow rainfall.",
              source_metadata: {
                work: "Thirukkural (திருக்குறள்)",
                section: "Arathuppaal (Book of Virtue)",
                chapter: "Chapter 2: Vaan Chirappu",
                verse_number: 20,
                author: "Thiruvalluvar",
                historical_era: "Classical Tamil",
                meter: "Kural Venba"
              },
              evidence_label: "RETRIEVED TEXTUAL EVIDENCE"
            }
          ]
        },
        {
          dimension: "2D",
          title: "2D — Interpretation / Cultural & Environmental Context",
          items: [
            {
              type: "contextual_analysis",
              title: "Ainthinai and Hydraulic Civilization",
              text:
                "In ancient Tamil geographic philosophy (Ainthinai), water systems governed societal survival across landscapes (Marutham agrarians and Neithal coastal zones). Thiruvalluvar's verse links physical hydrology with social morality: an environmental catastrophe directly produces moral degradation.",
              evidence_label: "SCIENTIFIC INTERPRETATION"
            }
          ]
        },
        {
          dimension: "3D",
          title: "3D — Symbol, Concept & Textual Relationships",
          items: [
            {
              type: "concept_overview",
              text:
                "The text models water as both physical substance (parupporul) and cosmic regulator. The relationships below map the textual claims of Thirukkural."
            }
          ]
        }
      ],
      relationships: [
        {
          from_entity: "Vaan (Rain / Cloud)",
          to_entity: "Neer (Water)",
          relationship_type: "TEXTUAL RELATIONSHIP",
          evidence_label: "RETRIEVED TEXTUAL EVIDENCE",
          domains: ["Classical Tamil Literature"],
          description: "Thirukkural identifies atmospheric precipitation as the singular origin of earthly fresh water."
        },
        {
          from_entity: "Neer (Water)",
          to_entity: "Ulagam (Cosmos / Life)",
          relationship_type: "TEXTUAL RELATIONSHIP",
          evidence_label: "RETRIEVED TEXTUAL EVIDENCE",
          domains: ["Classical Tamil Literature"],
          description: "'Neerinramaiyathu Ulagu' (Water is the non-negotiable prerequisite for earthly life)."
        },
        {
          from_entity: "Neer (Water)",
          to_entity: "Ethical Order (Aram)",
          relationship_type: "INTERPRETATION",
          evidence_label: "SCIENTIFIC INTERPRETATION",
          domains: ["Classical Tamil Literature"],
          description: "Drought and hydrological scarcity disrupt human social ethics and civilizational virtue."
        }
      ],
      warnings: [],
      sources: [
        {
          title: "Tirukkural: With English Translation and Commentary",
          authors: "G. U. Pope, W. H. Drew, John Lazarus",
          year: "1886",
          publication: "W. H. Allen & Co., London",
          citation: "Chapter 2: Vaan Chirappu, Verses 11 & 20"
        },
        {
          title: "The Smile of Murugan on Tamil Literature of South India",
          authors: "Kamil V. Zvelebil",
          year: "1973",
          publication: "E. J. Brill, Leiden",
          doi: "10.1163/9789004492752"
        }
      ]
    }
  },

  // Case 3: Cross-Domain Conceptual Analogy
  circadian_vs_orbital: {
    query: {
      text: "Can biological rhythms be compared conceptually with orbital periods?",
      input_type: "cross_domain",
      domains: ["Astronomy / Astrophysics", "Biology / Biological Systems"],
      intent: "conceptual_comparison",
      entities: [
        "Earth Planetary Rotation (24h)",
        "Solar Insolation Cycle",
        "Suprachiasmatic Nucleus (SCN)",
        "Circadian Molecular Oscillator",
        "Keplerian Orbital Period"
      ],
      concepts: [
        "Periodic Harmonic Motion",
        "Evolutionary Entrainment",
        "Zeitgeber (Time-giver)",
        "Transcription-Translation Feedback Loop (TTFL)"
      ]
    },
    answer: {
      summary:
        "A multi-domain analysis exploring the conceptual and evolutionary relationship between astronomical periodicities (planetary rotation and orbital cycles) and biological periodicities (cellular circadian rhythms). While celestial mechanics is governed by gravitational physics and biological clocks are driven by biochemical autoregulatory feedback loops, biological clocks evolved specifically as an adaptive resonance mechanism to the planetary diurnal cycle.",
      sections: [
        {
          dimension: "1D",
          title: "1D — Text / Literal Formulations",
          items: [
            {
              type: "definition",
              title: "Astronomical Diurnal Period (Earth)",
              text:
                "The sidereal day represents the period required for Earth to complete one rotation relative to inertial space (~86,164.1 seconds; mean solar day: 86,400 seconds).",
              formula: "T = \\frac{2\\pi}{\\omega}",
              evidence_label: "ESTABLISHED FACT"
            },
            {
              type: "definition",
              title: "Biological Circadian Clock (Molecular TTFL)",
              text:
                "An endogenous, cell-autonomous biochemical timing system with a free-running period of approximately 24 hours, maintained through interlocking transcriptional-translational feedback loops involving CLOCK, BMAL1, PER, and CRY genes.",
              evidence_label: "ESTABLISHED FACT"
            }
          ]
        },
        {
          dimension: "2D",
          title: "2D — Interpretation / Evolutionary & Physical Context",
          items: [
            {
              type: "contextual_analysis",
              title: "Entrainment Mechanisms: Photic Zeitgebers",
              text:
                "Astronomical orbital motion establishes predictable solar irradiance swings. Biological organisms do not passively react to sunlight; they anticipate daylight cycles via retinal ganglion cells stimulating the suprachiasmatic nucleus (SCN), resetting the molecular phase daily.",
              evidence_label: "OBSERVATIONAL EVIDENCE"
            }
          ]
        },
        {
          dimension: "3D",
          title: "3D — Symbol, Concept & Cross-Domain Bridges",
          items: [
            {
              type: "bridge_description",
              text:
                "A structural bridge links the celestial rotation of the planet with molecular gene expression. The connection is evolutionary and entrainment-based, rather than an identical physical law."
            }
          ]
        },
        {
          dimension: "4D",
          title: "4D — Future Scenarios & Hypothetical Temporal Dynamics",
          items: [
            {
              type: "temporal_progression",
              title: "Extraterrestrial Chronobiology (Hypothetical Martian Sol Adaptation)",
              text:
                "Human circadian clocks free-run at ~24.2 hours. In proposed space colonization environments (e.g., Mars with a 24.65-hour sol), chronic circadian misalignment represents an active space medicine investigation area.",
              progression_steps: [
                "Terrestrial 24.0h Baseline (Optimum SCN Phase Locking)",
                "Martian 24.65h Desynchronization Phase",
                "Photic Countermeasure Application (Targeted blue-wavelength pulses)",
                "Genetic or Epigenetic Chronobiological Adaptation"
              ],
              evidence_label: "HYPOTHESIS / SPECULATION"
            }
          ]
        }
      ],
      relationships: [
        {
          from_entity: "Earth Planetary Rotation (24h)",
          to_entity: "Solar Insolation Cycle",
          relationship_type: "ASTRONOMICAL RELATIONSHIP",
          evidence_label: "ESTABLISHED FACT",
          domains: ["Astronomy / Astrophysics"],
          description: "Axial rotation under solar irradiation creates the diurnal photic cycle."
        },
        {
          from_entity: "Solar Insolation Cycle",
          to_entity: "Suprachiasmatic Nucleus (SCN)",
          relationship_type: "BIOLOGICAL RELATIONSHIP",
          evidence_label: "OBSERVATIONAL EVIDENCE",
          domains: ["Biology / Biological Systems"],
          description: "Light input entrains the neural master clock in mammals."
        },
        {
          from_entity: "Suprachiasmatic Nucleus (SCN)",
          to_entity: "Circadian Molecular Oscillator",
          relationship_type: "BIOLOGICAL RELATIONSHIP",
          evidence_label: "ESTABLISHED FACT",
          domains: ["Biology / Biological Systems"],
          description: "The SCN synchronizes peripheral cellular clocks across organismal tissues."
        },
        {
          from_entity: "Earth Planetary Rotation (24h)",
          to_entity: "Circadian Molecular Oscillator",
          relationship_type: "CROSS-DOMAIN ANALOGY",
          evidence_label: "CONCEPTUAL ANALOGY",
          domains: ["Astronomy / Astrophysics", "Biology / Biological Systems"],
          description: "Conceptual analogy linking cosmic rotational periods with evolutionary cellular oscillator dynamics."
        }
      ],
      warnings: [
        "CONCEPTUAL RELATIONSHIPS ARE NOT SCIENTIFIC EVIDENCE. The analogy between orbital mechanics and molecular rhythms does not imply identical physical laws or shared equations."
      ],
      sources: [
        {
          title: "Molecular Bases of Circadian Rhythms",
          authors: "Jay C. Dunlap",
          year: "1999",
          publication: "Cell",
          doi: "10.1016/S0092-8674(00)80566-8"
        },
        {
          title: "Circadian Rhythms in Man: A self-sustained oscillator with an inherent frequency",
          authors: "Jürgen Aschoff",
          year: "1965",
          publication: "Science",
          doi: "10.1126/science.148.3676.1427"
        },
        {
          title: "Kepler's Physical Astronomy",
          authors: "Bruce Stephenson",
          year: "1987",
          publication: "Springer-Verlag",
          doi: "10.1007/978-1-4613-8737-4"
        }
      ]
    }
  },

  // Case 4: Multidimensional Biology Causal Chain
  mutation_to_disease: {
    query: {
      text: "Gene expression",
      input_type: "causal_chain",
      domains: ["Biology / Biological Systems"],
      intent: "analyze_biological_system",
      entities: [
        "Genomic DNA",
        "mRNA Transcript",
        "Polypeptide Chain",
        "Enzymatic Protein",
        "Cellular Phenotype"
      ],
      concepts: [
        "Transcription Regulation",
        "Post-Transcriptional Splicing",
        "Ribosomal Translation",
        "Tertiary Folding Kinetics",
        "Metabolic Feedback"
      ]
    },
    answer: {
      summary:
        "A multidimensional molecular biological analysis of gene expression, tracing the flow of genetic information from nucleotide encoding through transcriptional dynamics, post-transcriptional processing, and ribosomal translation to cellular phenotypic manifestation.",
      sections: [
        {
          dimension: "1D",
          title: "1D — Text / Literal Formulations & Dogma",
          items: [
            {
              type: "definition",
              title: "The Central Dogma of Molecular Biology",
              text:
                "Sequential residue-by-residue transfer of genetic information: DNA is transcribed into messenger RNA (mRNA), which is then translated by ribosomes into catalytic and structural proteins.",
              formula: "\\text{DNA} \\xrightarrow{\\text{RNA Pol II}} \\text{mRNA} \\xrightarrow{\\text{Ribosome}} \\text{Polypeptide}",
              evidence_label: "ESTABLISHED FACT"
            }
          ]
        },
        {
          dimension: "2D",
          title: "2D — Interpretation / Regulatory Context & Kinetics",
          items: [
            {
              type: "contextual_analysis",
              title: "Epigenetic & Environmental Context",
              text:
                "Gene expression is non-linear and context-dependent. Chromatin remodeling (histone acetylation, DNA methylation) and transcription factor availability dictate transcription rates in response to metabolic and external signals.",
              evidence_label: "ESTABLISHED FACT"
            }
          ]
        },
        {
          dimension: "3D",
          title: "3D — Symbol, Concept & Molecular Pathways",
          items: [
            {
              type: "concept_overview",
              text:
                "The molecular interactions form a directed biochemical signaling cascade as mapped in the relationship network below."
            }
          ]
        },
        {
          dimension: "4D",
          title: "4D — Temporal Dynamics & Phenotypic Evolution",
          items: [
            {
              type: "temporal_progression",
              title: "Temporal Stages of Gene Activation",
              text:
                "The temporal kinetic cascade following signal induction proceeds through distinct phases across minutes to hours.",
              progression_steps: [
                "Signal Transduction (0 - 5 min): Kinase cascade activates nuclear transcription factors",
                "Transcriptional Induction (5 - 30 min): RNA Polymerase II clears promoter; primary pre-mRNA synthesized",
                "Splicing & Nuclear Export (20 - 60 min): Intron excision and 5' capping; export via nuclear pore complexes",
                "Translation & Maturation (45 - 120 min): Ribosomal elongation, chaperone-mediated folding, and functional state"
              ],
              evidence_label: "ESTABLISHED FACT"
            }
          ]
        }
      ],
      relationships: [
        {
          from_entity: "Genomic DNA",
          to_entity: "mRNA Transcript",
          relationship_type: "BIOLOGICAL RELATIONSHIP",
          evidence_label: "ESTABLISHED FACT",
          domains: ["Biology / Biological Systems"],
          description: "Transcription by RNA Polymerase creates complementary messenger RNA."
        },
        {
          from_entity: "mRNA Transcript",
          to_entity: "Polypeptide Chain",
          relationship_type: "BIOLOGICAL RELATIONSHIP",
          evidence_label: "ESTABLISHED FACT",
          domains: ["Biology / Biological Systems"],
          description: "Ribosomal complexes translate nucleotide codons into amino acid chains."
        },
        {
          from_entity: "Polypeptide Chain",
          to_entity: "Enzymatic Protein",
          relationship_type: "BIOLOGICAL RELATIONSHIP",
          evidence_label: "ESTABLISHED FACT",
          domains: ["Biology / Biological Systems"],
          description: "Chaperone-assisted conformational folding yields active tertiary enzymes."
        },
        {
          from_entity: "Enzymatic Protein",
          to_entity: "Cellular Phenotype",
          relationship_type: "DIRECT SCIENTIFIC RELATIONSHIP",
          evidence_label: "OBSERVATIONAL EVIDENCE",
          domains: ["Biology / Biological Systems"],
          description: "Catalytic biochemical output directly regulates cellular metabolic state."
        }
      ],
      warnings: [],
      sources: [
        {
          title: "Molecular Biology of the Cell (6th ed.)",
          authors: "Bruce Alberts, Alexander Johnson, Julian Lewis, David Morgan, Martin Raff, Keith Roberts, Peter Walter",
          year: "2014",
          publication: "Garland Science, New York",
          doi: "10.1201/9781315735368"
        },
        {
          title: "Central Dogma of Molecular Biology",
          authors: "Francis Crick",
          year: "1970",
          publication: "Nature",
          doi: "10.1038/227561a0"
        }
      ]
    }
  }
};

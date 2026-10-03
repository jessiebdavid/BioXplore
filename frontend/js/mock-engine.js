/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * Client-Side Mock Evaluation Engine
 *
 * Matches incoming user queries to canonical research cases
 * and constructs exact-schema response payloads for offline testing.
 * ============================================================ */

(function () {
  const CASES = window.MKS_MOCK_CASES || {};

  function normalizeText(str) {
    return (str || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
  }

  // Pre-configured derived cases for example chips to give rich answers
  const DERIVED_CASES = {
    keplers_laws: {
      query: {
        text: "Kepler's laws",
        input_type: "topic_query",
        domains: ["Astronomy / Astrophysics"],
        intent: "retrieve_astronomical_principles",
        entities: ["Johannes Kepler", "Elliptical Orbit", "Semi-major Axis", "Orbital Period"],
        concepts: ["Areal Velocity Conservation", "Gravitational Central Force", "Harmonic Law", "Celestial Mechanics"]
      },
      answer: {
        summary:
          "Kepler's three empirical laws describe planetary kinematics: 1. Planetary orbits are ellipses with the Sun at one focus; 2. A line joining planet and Sun sweeps out equal areas in equal times (areal velocity conservation); 3. The square of the orbital period is proportional to the cube of the semi-major axis.",
        sections: [
          {
            dimension: "1D",
            title: "1D — Text / Literal Formulations",
            items: [
              {
                type: "definition",
                title: "Third Law (Harmonic Law)",
                text: "The ratio of the square of an orbital period to the cube of its semi-major axis is constant for all bodies orbiting a central mass.",
                formula: "\\frac{T^2}{a^3} = \\frac{4\\pi^2}{G(M + m)}",
                evidence_label: "ESTABLISHED FACT"
              }
            ]
          },
          {
            dimension: "2D",
            title: "2D — Physical & Historical Context",
            items: [
              {
                type: "contextual_analysis",
                title: "Newtonian Synthesis",
                text: "Kepler's phenomenological laws formed the empirical foundation from which Isaac Newton derived the inverse-square law of universal gravitation.",
                evidence_label: "ESTABLISHED FACT"
              }
            ]
          },
          {
            dimension: "3D",
            title: "3D — Relationships",
            items: [
              {
                type: "concept_overview",
                text: "Kinematic relationships connecting orbital geometry to gravitational attraction."
              }
            ]
          }
        ],
        relationships: [
          {
            from_entity: "Elliptical Orbit",
            to_entity: "Areal Velocity Conservation",
            relationship_type: "ASTRONOMICAL RELATIONSHIP",
            evidence_label: "ESTABLISHED FACT",
            domains: ["Astronomy / Astrophysics"],
            description: "Conservation of angular momentum dictates variable speed along the orbital ellipse."
          },
          {
            from_entity: "Orbital Period",
            to_entity: "Semi-major Axis",
            relationship_type: "DIRECT SCIENTIFIC RELATIONSHIP",
            evidence_label: "ESTABLISHED FACT",
            domains: ["Astronomy / Astrophysics"],
            description: "Direct power-law coupling governed by central gravitational mass."
          }
        ],
        warnings: [],
        sources: [
          {
            title: "Astronomia Nova",
            authors: "Johannes Kepler",
            year: "1609",
            publication: "Prague",
            citation: "Laws 1 and 2"
          },
          {
            title: "Harmonices Mundi",
            authors: "Johannes Kepler",
            year: "1619",
            publication: "Linz",
            citation: "Law 3"
          }
        ]
      }
    },

    nature_tholkappiyam: {
      query: {
        text: "Nature in Tholkappiyam",
        input_type: "literary_query",
        domains: ["Classical Tamil Literature"],
        intent: "analyze_environmental_poetics",
        entities: ["Tholkappiyar", "Ainthinai (Five Landscapes)", "Muthatporul", "Karupporul", "Uripporul"],
        concepts: ["Ecological Determinism", "Landscape Humanism", "Bioregional Poetics", "Sangam Geography"]
      },
      answer: {
        summary:
          "Tholkappiyam, the foundational grammar and poetics treatise of Classical Tamil, articulates an advanced bioregional philosophy in Porulathikaaram. Human emotions, social duty, and literature are organized into five distinct physiographic zones (Ainthinai: Kurinji, Mullai, Marutham, Neithal, Palai), where physical space and flora/fauna dynamically shape human consciousness.",
        sections: [
          {
            dimension: "1D",
            title: "1D — Text / Literal Formulations",
            items: [
              {
                type: "definition",
                title: "Tholkappiyam: Porulathikaaram (Akathinaiyiyal)",
                text: "Poetic reality is constructed through threefold ecological layers: Muthatporul (time and space/landscape), Karupporul (native flora, fauna, and elements), and Uripporul (human emotional conduct).",
                evidence_label: "RETRIEVED TEXTUAL EVIDENCE"
              }
            ]
          },
          {
            dimension: "2D",
            title: "2D — Interpretation / Bioregional Context",
            items: [
              {
                type: "contextual_analysis",
                title: "Symbiosis of Geography and Culture",
                text: "Unlike Cartesian dualism, classical Tamil literature treats the natural world not as a passive backdrop, but as an active constituent of psychology and culture.",
                evidence_label: "SCIENTIFIC INTERPRETATION"
              }
            ]
          },
          {
            dimension: "3D",
            title: "3D — Relationships",
            items: [
              {
                type: "concept_overview",
                text: "Structural taxonomy linking landscape geography with cultural expression."
              }
            ]
          }
        ],
        relationships: [
          {
            from_entity: "Muthatporul (Space-Time)",
            to_entity: "Karupporul (Ecology)",
            relationship_type: "TEXTUAL RELATIONSHIP",
            evidence_label: "RETRIEVED TEXTUAL EVIDENCE",
            domains: ["Classical Tamil Literature"],
            description: "Landscape and season dictate the specific biological species and social activities."
          },
          {
            from_entity: "Karupporul (Ecology)",
            to_entity: "Uripporul (Human Conduct)",
            relationship_type: "INTERPRETATION",
            evidence_label: "SCIENTIFIC INTERPRETATION",
            domains: ["Classical Tamil Literature"],
            description: "Psychological interiority reflects exterior ecological surroundings."
          }
        ],
        warnings: [],
        sources: [
          {
            title: "Tholkappiyam: Porulathikaaram",
            authors: "Tholkappiyar",
            year: "c. 3rd Century BCE - 1st Century CE",
            publication: "Classical Tamil Sangam Anthology",
            citation: "Akathinaiyiyal, Sutras 1–14"
          }
        ]
      }
    },

    plasma_oscillation: {
      query: {
        text: "Plasma oscillation",
        input_type: "physics_query",
        domains: ["Astronomy / Astrophysics"],
        intent: "explain_plasma_phenomenon",
        entities: ["Electron Plasma", "Langmuir Wave", "Debye Length", "Dielectric Permittivity"],
        concepts: ["Collective Electrostatic Oscillation", "Plasma Frequency", "Astrophysical Jets", "Interstellar Medium"]
      },
      answer: {
        summary:
          "Plasma oscillations (Langmuir waves) are rapid collective oscillations of the electron density in a conducting plasma relative to the heavier background ions. In astrophysics, plasma oscillations govern radio wave propagation in stellar coronas, pulsar magnetospheres, and the interstellar medium.",
        sections: [
          {
            dimension: "1D",
            title: "1D — Text / Literal Formulations",
            items: [
              {
                type: "definition",
                title: "Plasma Frequency (Langmuir Frequency)",
                text: "The natural resonance frequency at which electron displacement produces a restoring electrostatic electric field.",
                formula: "\\omega_{pe} = \\sqrt{\\frac{n_e e^2}{m_e \\varepsilon_0}}",
                evidence_label: "ESTABLISHED FACT"
              }
            ]
          },
          {
            dimension: "2D",
            title: "2D — Astrophysical Context",
            items: [
              {
                type: "contextual_analysis",
                title: "Astrophysical Radio Cutoff",
                text: "Electromagnetic radiation with frequency below the plasma frequency cannot propagate through interstellar or ionospheric plasma, creating observational radio cutoff horizons.",
                evidence_label: "OBSERVATIONAL EVIDENCE"
              }
            ]
          },
          {
            dimension: "3D",
            title: "3D — Relationships",
            items: [
              {
                type: "concept_overview",
                text: "Electrostatic and electromagnetic coupling in ionized astrophysical environments."
              }
            ]
          }
        ],
        relationships: [
          {
            from_entity: "Electron Plasma",
            to_entity: "Langmuir Wave",
            relationship_type: "DIRECT SCIENTIFIC RELATIONSHIP",
            evidence_label: "ESTABLISHED FACT",
            domains: ["Astronomy / Astrophysics"],
            description: "Charge displacement induces coherent macroscopic electrostatic wavepackets."
          },
          {
            from_entity: "Langmuir Wave",
            to_entity: "Debye Length",
            relationship_type: "DIRECT SCIENTIFIC RELATIONSHIP",
            evidence_label: "ESTABLISHED FACT",
            domains: ["Astronomy / Astrophysics"],
            description: "Thermal dispersion sets the minimum wavelength threshold for undamped plasma waves."
          }
        ],
        warnings: [],
        sources: [
          {
            title: "Oscillations in Ionized Gases",
            authors: "Tonks, L., & Langmuir, I.",
            year: "1929",
            publication: "Physical Review",
            doi: "10.1103/PhysRev.33.195"
          }
        ]
      }
    },

    radiation_laws: {
      query: {
        text: "Radiation laws",
        input_type: "physics_query",
        domains: ["Astronomy / Astrophysics"],
        intent: "explain_thermodynamic_radiation",
        entities: ["Blackbody", "Planck Function", "Stefan-Boltzmann Law", "Wien Displacement Law"],
        concepts: ["Electromagnetic Radiation", "Thermal Equilibrium", "Stellar Luminosity", "Spectral Energy Distribution"]
      },
      answer: {
        summary:
          "Fundamental physical laws governing the emission of electromagnetic radiation from matter in thermodynamic equilibrium. Crucial for determining stellar surface temperatures, effective radiating areas, and cosmic microwave background properties.",
        sections: [
          {
            dimension: "1D",
            title: "1D — Text / Literal Formulations",
            items: [
              {
                type: "definition",
                title: "Stefan-Boltzmann Law",
                text: "Total energy radiated per unit surface area of a blackbody across all wavelengths per unit time is directly proportional to the fourth power of the thermodynamic temperature.",
                formula: "j^* = \\sigma T^4 \\quad (\\sigma \\approx 5.670374 \\times 10^{-8} \\text{ W m}^{-2}\\text{K}^{-4})",
                evidence_label: "ESTABLISHED FACT"
              },
              {
                type: "definition",
                title: "Wien's Displacement Law",
                text: "The peak emission wavelength is inversely proportional to temperature.",
                formula: "\\lambda_{\\text{max}} T = b \\quad (b \\approx 2.897771955 \\times 10^{-3} \\text{ m K})",
                evidence_label: "ESTABLISHED FACT"
              }
            ]
          },
          {
            dimension: "2D",
            title: "2D — Astrophysical Application",
            items: [
              {
                type: "contextual_analysis",
                title: "Stellar Spectral Classification",
                text: "Enables determination of stellar radii and temperatures through Hertzsprung-Russell photometric analyses.",
                evidence_label: "OBSERVATIONAL EVIDENCE"
              }
            ]
          },
          {
            dimension: "3D",
            title: "3D — Relationships",
            items: [
              {
                type: "concept_overview",
                text: "Thermodynamic and quantum electrodynamic radiation relationships."
              }
            ]
          }
        ],
        relationships: [
          {
            from_entity: "Planck Function",
            to_entity: "Stefan-Boltzmann Law",
            relationship_type: "DIRECT SCIENTIFIC RELATIONSHIP",
            evidence_label: "ESTABLISHED FACT",
            domains: ["Astronomy / Astrophysics"],
            description: "Integrating Planck's spectral radiance over all frequencies produces the Stefan-Boltzmann T^4 law."
          },
          {
            from_entity: "Planck Function",
            to_entity: "Wien Displacement Law",
            relationship_type: "DIRECT SCIENTIFIC RELATIONSHIP",
            evidence_label: "ESTABLISHED FACT",
            domains: ["Astronomy / Astrophysics"],
            description: "Differentiating Planck's law with respect to wavelength reveals the Wien peak condition."
          }
        ],
        warnings: [],
        sources: [
          {
            title: "On the Law of Distribution of Energy in the Normal Spectrum",
            authors: "Max Planck",
            year: "1901",
            publication: "Annalen der Physik",
            doi: "10.1002/andp.19013090310"
          }
        ]
      }
    }
  };

  async function evaluate(query) {
    // Artificial research latency simulation (350ms) for smooth loading state presentation
    await new Promise((resolve) => setTimeout(resolve, 350));

    const norm = normalizeText(query);

    // 1. Cross-domain comparison
    if (
      (norm.includes("biological") || norm.includes("rhythm") || norm.includes("circadian")) &&
      (norm.includes("orbital") || norm.includes("period") || norm.includes("rotation"))
    ) {
      return CASES.circadian_vs_orbital;
    }

    // 2. Black hole vs white hole
    if (
      norm.includes("white hole") ||
      (norm.includes("black hole") && (norm.includes("vs") || norm.includes("compare") || norm.includes("white")))
    ) {
      return CASES.black_hole_vs_white_hole;
    }

    // 3. Black holes (single)
    if (norm.includes("black hole")) {
      return CASES.black_hole_vs_white_hole;
    }

    // 4. Thirukkural water query
    if (
      norm.includes("thirukkural") ||
      norm.includes("kural") ||
      (norm.includes("tamil") && norm.includes("water"))
    ) {
      return CASES.thirukkural_water;
    }

    // 5. Nature in Tholkappiyam
    if (norm.includes("tholkappiyam") || norm.includes("tolkappiyam")) {
      return DERIVED_CASES.nature_tholkappiyam;
    }

    // 6. Kepler's laws
    if (norm.includes("kepler")) {
      return DERIVED_CASES.keplers_laws;
    }

    // 7. Plasma oscillation
    if (norm.includes("plasma")) {
      return DERIVED_CASES.plasma_oscillation;
    }

    // 8. Radiation laws
    if (norm.includes("radiation") || norm.includes("stefan") || norm.includes("planck")) {
      return DERIVED_CASES.radiation_laws;
    }

    // 9. Gene expression / Mutation
    if (
      norm.includes("gene") ||
      norm.includes("expression") ||
      norm.includes("mutation") ||
      norm.includes("dna") ||
      norm.includes("protein")
    ) {
      return CASES.mutation_to_disease;
    }

    // Standardized fallback when no domain match is detected
    throw {
      code: "NO_DOMAIN_MATCH",
      message:
        `No matching knowledge entities were retrieved for "${query}". The research system indexes Astronomy/Astrophysics, Biology/Biological Systems, and Classical Tamil Literature.`,
      details: {
        searchedQuery: query,
        suggestedQueries: window.MKS_API ? window.MKS_API.EXAMPLE_QUERIES : []
      }
    };
  }

  window.MKS_MOCK_ENGINE = {
    evaluate
  };
})();

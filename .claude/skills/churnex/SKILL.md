---
name: churnex
description: >
  Hotspot analysis: run churnex, interpret the ranked results, and
  recommend specific files to review or refactor with concrete strategies.
  Use before a PR review, before splitting a large diff, or when asked to
  identify the highest-risk code in a codebase.
compatibility: Requires git history. Must be run inside a git repository. churnex binary must be installed (cargo install).
---

# Hotspot Analyst

Act as a top-tier software quality analyst to identify high-risk files and
recommend targeted refactoring strategies using composite hotspot scoring.

Competencies {
  hotspot analysis (LoC × churn × complexity scoring)
  code quality interpretation (density as duplication signal)
  refactoring strategy (decomposition, complexity reduction, interface extraction)
  PR scoping (splitting diffs by risk profile)
}

Constraints {
  Before running churnex, check if it is installed (`which churnex`).
  If not installed, install it: `cargo install --git https://github.com/janhesters/churnex`
  (Requires Rust toolchain — if `cargo` is missing, install via `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y`)
  Always run churnex before making recommendations — never guess at hotspots
  Read references/interpreting-scores.md for metric definitions and interpretation ranges
  Name specific files; explain which signal (LoC, churn, complexity, or density) drives each score
  For each recommendation, propose a concrete strategy — not generic advice
  Communicate as friendly markdown prose — not raw SudoLang syntax
}

## Step 1 — Collect hotspot data

```sudolang
collectHotspots({ days = 90, top = 20, minLoc = 50 } = {}) => hotspotReport {
  run `churnex . --days $days --top $top --min-loc $minLoc`
  prReview => run `churnex . --json` to cross-reference file paths against the diff
}
```

Determine scope before running:
- Whole repo: `churnex .`
- PR files: `git diff --name-only main..HEAD | churnex --stdin --json`
- Specific files: `churnex file1.ts file2.ts`

## Step 2 — Interpret results

```sudolang
interpretResults(hotspotReport) => analysis {
  for each file in hotspotReport {
    identify the dominant signal {
      highLoC      => large file; review surface area risk
      highChurn    => frequently changed; instability risk
      highCx       => complex branches; test and comprehension risk
      lowDensity   => compresses heavily; structural repetition likely present
    }
    note: a file scoring high on multiple signals is the highest-priority target
  }
}
```

See references/interpreting-scores.md for score ranges and density interpretation.

## Step 3 — Recommend

```sudolang
recommend(analysis, { context = "standalone" } = {}) => recommendations {
  for each top hotspot {
    state: file path and score
    explain: WHY it ranks high — cite the specific metric(s) driving the score
    propose a strategy {
      highLoC      => extract cohesive sub-modules or pure utility functions into separate files
      highChurn    => split responsibilities so stable interfaces churn less
      highCx       => flatten conditionals, extract named predicates, replace switch trees with lookup maps
      lowDensity   => eliminate copy-paste by extracting shared helpers
    }
    estimate: which metric drops the most after the refactor
  }

  if context === "prReview" {
    cross-reference: identify files in both the diff AND the top hotspot results
    for each match {
      flag: "This file is a hotspot"
      explain: which signal is driving the risk
      reviewGuidance: prioritize for extra scrutiny — changes here have higher blast radius
      recommend: consider splitting or extracting stable interfaces before merging
    }
    if no matches found => note that the diff avoids known hotspots (lower risk)
  }
}
```

analyze = collectHotspots |> interpretResults |> recommend

## CLI reference

```bash
# Default: top 20 files, 90-day git window, minimum 50 LoC
churnex .

# Adjust window and thresholds
churnex . --days 30 --top 10 --min-loc 100

# Machine-readable output (for cross-referencing with a PR diff)
churnex . --json

# Pipe PR files
git diff --name-only main..HEAD -- '*.ts' '*.tsx' | churnex --stdin --json

# Skip git churn (score = LoC × complexity only)
churnex . --no-churn

# CI gates (exit 1 on threshold violation)
churnex . --max-complexity 25
churnex . --max-score 50000
```

Commands {
  /churnex — run hotspot analysis and get specific recommendations for the highest-risk files
}

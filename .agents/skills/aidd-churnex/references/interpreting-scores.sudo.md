# Interpreting churnex Scores

## Score formula

```
score = LoC × churn × complexity
```

A file ranked #1 is large, touched constantly, and full of branches — the true
hotspot where refactoring effort pays off most.

## Metric definitions

| Metric | Column | Description |
|--------|--------|-------------|
| LoC (SLOC) | `LoC` | Total lines including blanks and comments. Crude size measure. |
| Churn | `Churn` | Commits touching this file in the `--days` window (default 90). |
| Cyclomatic complexity | `Cx` | Independent paths through code. Each `if`, `else`, `for`, `while`, `case`, `&&`, `\|\|`, `catch` adds 1. |
| Density | `Density` | `gzip_size / raw_size × 100`. NOT in the score — display only. |

## Score ranges (rules of thumb)

ScoreRanges {
  > 100_000  => critical hotspot — refactor urgently
  10_000–100_000 => significant hotspot — prioritize for review
  1_000–10_000   => moderate — monitor, address when touching
  < 1_000        => low risk — no immediate action needed
}

## Complexity ranges

ComplexityRanges {
  1–10   => simple, easy to test
  11–20  => moderate, review for split opportunities
  21–50  => high — consider extracting functions
  > 50   => very high — strongly recommend decomposition
}

## Density interpretation

DensityRanges {
  80–95%   => compresses poorly — unique, non-repetitive code (generally healthy)
  50–80%   => typical application code range
  20–50%   => compresses heavily — likely copy-paste, boilerplate, or bloated conditionals
  < 20%    => extreme repetition — strong refactoring candidate
  > 95%    => rarely seen — may be minified, obfuscated, or auto-generated
}

A file with low density AND a high hotspot score is doubly worth refactoring:
high risk AND structural repetition a refactor could eliminate.

## Identifying the dominant signal

When explaining WHY a file ranks high, identify which factor contributes most:

```sudolang
dominantSignal(file) => {
  compare: LoC, churn, complexity against their respective medians in the result set
  the factor furthest above its median is the dominant signal
  if multiple factors are elevated => the file is a compound hotspot (highest priority)
}
```

## Refactoring strategies by signal

RefactoringStrategies {
  highLoC => {
    extract cohesive sub-modules or utility functions into separate files
    look for "sections" separated by comments — each is a module candidate
    target: reduce file below 300 LoC
  }
  highChurn => {
    split responsibilities so the stable interface changes less often
    identify the parts that change vs. parts that stay constant
    extract the volatile logic behind a stable API boundary
    target: isolate the frequently-changing code into its own module
  }
  highCx => {
    flatten conditionals: early returns, guard clauses
    extract named predicates: `isEligible()` instead of inline boolean expressions
    replace switch/if trees with lookup maps or strategy patterns
    target: reduce Cx below 20 per function
  }
  lowDensity => {
    identify repeated patterns in the file
    extract shared helpers, templates, or configuration-driven logic
    target: raise density above 50%
  }
}

---
name: aidd-review
description: Conduct a thorough code review focusing on code quality, best practices, security, test coverage, and adherence to project standards and functional requirements. Use when reviewing code, pull requests, or completed epics.
allowed-tools: Read Grep Glob Bash(git:*)
---

# Code Review

Act as a top-tier principal software engineer to conduct a thorough code review
focusing on code quality, best practices, and adherence to requirements, plan,
and project standards.

Criteria {
  Use [aidd-tdd](../aidd-tdd/SKILL.md) for test coverage and test quality assessment.
  Use [aidd-test-writing](../aidd-test-writing/SKILL.md) for test structure and RITE principles.
  Use [aidd-implementation-writing](../aidd-implementation-writing/SKILL.md) for code quality and conventions.
  Use [JS/TS guide](../aidd-implementation-writing/references/javascript-typescript.sudo.md) for JavaScript/TypeScript code quality, naming, functional style, and comment standards.
  Use [React guide](../aidd-implementation-writing/references/react.sudo.md) for React components, types, forms, accessibility, and i18n patterns.
  Use [Facades guide](../aidd-implementation-writing/references/facades.sudo.md) for database facade naming and constraints.
  Use [SudoLang guide](../aidd-skill-creating/references/sudolang.sudo.md) for prompts in app code, skills, and agents — all should follow SudoLang conventions.
  Use [OWASP Top 10:2025](references/owasp-2025.sudo.md) — inspect for all 10 categories. Use search. Explicitly list each category, review all changes, and inspect for violations.
  Use [JWT security](references/jwt-security.sudo.md) when reviewing authentication code. Recommend opaque tokens over JWT.
  Use [timing-safe compare](references/timing-safe-compare.sudo.md) when reviewing secret/token comparisons (CSRF, API keys, sessions).
  Compare the completed work to the functional requirements to ensure adherence and that all requirements are met.
  Compare the task plan in $projectRoot/tasks/ to the completed work to ensure all tasks were completed and the work adheres to the plan.
  Ensure code comments comply with project style guides.
  Use docblocks for public APIs — but keep them minimal.
  Ensure there are no unused stray files or dead code.
  Dig deep. Look for: redundancies, forgotten files (.d.ts, etc), things that should have been moved or deleted that were not. Simplicity is removing the obvious and adding the meaningful. Perfection is attained not when there is nothing more to add, but when there is nothing more to remove.
}

Constraints {
  Don't make changes. Review-only. Output will serve as input for planning.
  Avoid unfounded assumptions. If you're unsure, note and ask in the review response.
}

For each step, show your work:
    🎯 restate |> 💡 ideate |> 🪞 reflectCritically |> 🔭 expandOrthogonally |> ⚖️ scoreRankEvaluate |> 💬 respond

ReviewProcess {
  1. Analyze code structure and organization
  2. Check adherence to coding standards and best practices
  3. Evaluate test coverage and quality
  4. Assess performance considerations
  5. Deep scan for security vulnerabilities, visible keys, etc.
  6. Review UI/UX implementation and accessibility
  7. Validate architectural patterns and design decisions
  8. Check documentation and commit message quality
  9. Provide actionable feedback with specific improvement suggestions
}

Commands {
  /review - conduct a thorough code review focusing on code quality, best practices, and adherence to project standards
}

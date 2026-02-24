---
name: aidd-tdd
description: Run a test-driven development cycle. Use when implementing features, fixing bugs via TDD, or when the user asks for TDD, red-green-refactor, or test-first development.
allowed-tools: Bash Read Glob Grep
---

# TDD Orchestrator

Act as a top-tier software engineer with serious TDD discipline to
systematically implement software using the red-green-refactor process.
You orchestrate the cycle by coordinating the **aidd-tdd-test-writer** and
**aidd-tdd-implementer** subagents and running the test suite yourself between steps.
You do NOT write test or implementation code yourself — you delegate and verify.

constraint TestRunner {
  Detect the project's test runner from package.json scripts.
  If ambiguous, ask the user which command to use.
}

constraint APIDesign {
  If the calling API is unspecified, propose one that serves the functional
  requirements and creates an optimal developer experience. Get user approval
  before proceeding.
}

constraint Scope {
  Tackle one unit/component/function at a time. Multiple tests for that
  single unit are fine — but complete the full TDD cycle for it before
  moving to the next unit.
}

constraint WhatToTest {
  Not every function needs a test. Focus tests on logic — functions with
  conditionals, calculations, or transformations. Skip pure composition
  (glue code that just wires other tested functions together).
  Mocking is a code smell. If the aidd-tdd-implementer needs mocks to make tests
  pass, treat it as a design signal: decompose into pure logic + isolated
  side effects instead.
  Note: aidd-test-writing has its own WhatToTest/Mocking sections with
  test-specific detail. Both are intentional — keep them in sync.
}

## Cycle

For each requirement, run one complete cycle:

### Step 1: Red — Write Failing Tests

Delegate to the **aidd-tdd-test-writer** subagent. Pass it:
- The feature requirement or bug description
- Relevant file paths for context (existing types, interfaces, modules)

### Step 2: Verify Red

Run the test suite using the appropriate `package.json` script. Confirm new tests fail.

match (result) {
  case (new test passes already) =>
    Ask aidd-tdd-test-writer to revise — the test is not specifying new behavior.
  case (unexpected failure: syntax error, import issue) =>
    Ask aidd-tdd-test-writer to fix.
  case (new tests fail as expected) =>
    Proceed to Step 3.
}

### Step 3: Green — Write Implementation

Delegate to the **aidd-tdd-implementer** subagent. Pass it:
- The test file paths from Step 1
- The failure output from Step 2

### Step 4: Verify Green

Run the test suite using the appropriate `package.json` script.

match (result) {
  case (all tests pass) => Proceed to Step 5.
  case (tests still fail, attempts < 3) =>
    Pass failure output back to aidd-tdd-implementer. Retry from Step 3.
  case (tests still fail, attempts >= 3) =>
    Stop. Report the failure output to the user.
}

### Step 5: Refactor (optional)

If the implementation works but could be cleaner, delegate to the
aidd-tdd-implementer subagent to refactor. Run the test suite again to confirm nothing broke.

### Step 6: Next Requirement

Get approval from the user before moving on to the next requirement.
Repeat the cycle for the next requirement.

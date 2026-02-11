---
name: aidd-subagent-creating
description: Guide for creating and iterating on custom Claude Code subagents. Use when users want to create a new subagent (or update an existing one) — specialized AI assistants with their own context window, system prompt, tool access, and permissions.
---

# Subagent Creator

constraint DocAwareness {
  If the Claude Code subagent docs at https://code.claude.com/docs/en/subagents
  have not already been read this session, read them before proceeding.
}

Subagent {
  A specialized AI assistant running in its own context window with a custom
  system prompt, specific tool access, and independent permissions. Claude
  delegates to subagents based on the description field.

  Anatomy {
    A single Markdown file with YAML frontmatter + SudoLang system prompt:
    ```
    ---
    name: agent-name
    description: When Claude should use this agent
    tools: Read, Grep, Glob
    model: sonnet
    ---

    System prompt in SudoLang goes here.
    ```
  }

  Placement {
    Project-level: .claude/agents/  — shared via version control (default)
    User-level:    ~/.claude/agents/ — personal, all projects
  }

  Constraints {
    Each subagent should excel at ONE specific task.
    Description is the primary trigger — make it specific and actionable.
    Include "use proactively" in description for auto-delegation.
    Subagents receive ONLY their system prompt, NOT the full Claude Code prompt.
    Subagents CANNOT spawn other subagents.
    Grant minimal tool access — only what's needed.
    Write the system prompt body in SudoLang.
  }
}

NamingConvention {
  Subagents use agent nouns describing the role.
  Examples: code-reviewer, debugger, test-runner, data-scientist.
  Contrast with skills which use gerunds: test-writing, skill-creating.
}

## Configuration Reference

Read [references/subagent-config.sudo.md](references/subagent-config.sudo.md)
for detailed configuration options: frontmatter fields, available tools,
model options, permission modes, hooks, and memory configuration.

## Creation Process

/understand - Gather concrete usage scenarios {
  Ask how the subagent will be used; collect examples or generate and validate them.
  Questions:
    - What specific task should this subagent handle?
    - Example requests that should trigger delegation?
    - Should it be read-only or able to modify code?
    - Does it need Bash access? If so, any restrictions?
  Avoid overwhelming — start with the most important questions.
  Conclude when the subagent's scope and capabilities are clear.
}

/plan - Determine configuration {
  From the usage scenarios, determine:

  config(scenarios) => {
    tools     — minimal set needed (read-only? edit? bash?)
    model     — match capability to task complexity
    perms     — permission mode appropriate for the task
    hooks     — any pre/post validation needed?
    memory    — does it benefit from cross-session learning?
    skills    — any existing skills to preload?
  }

  Produce a summary: name, description, tools, model, and any
  advanced config (hooks, memory, skills).
}

/create [name] - Write the subagent file {
  1. Write the .md file to .claude/agents/[name].md
  2. Frontmatter: name, description, and determined config
  3. Body: system prompt in SudoLang covering:
     - Role and expertise
     - Workflow steps (what to do when invoked)
     - Constraints and quality standards
     - Output format expectations
  4. Verify the file is valid YAML frontmatter + markdown
}

/iterate - Improve based on real usage {
  1. Use the subagent on real tasks
  2. Notice struggles, missing tools, or inefficiencies
  3. Update the .md file (frontmatter config or system prompt)
  4. Test again — no restart needed if using /agents
}

## System Prompt Patterns

SystemPromptStructure {
  A well-structured SudoLang system prompt typically includes:

  1. Role declaration — who the agent is and its expertise
  2. Workflow — numbered steps for what to do when invoked
  3. Constraints — rules, quality standards, limitations
  4. Output format — how to present results (if applicable)

  Example {
    ```sudolang
    You are an expert [role] specializing in [domain].

    Workflow {
      1. [First action when invoked]
      2. [Analysis or processing step]
      3. [Output or action step]
    }

    Constraints {
      Focus on [specific scope].
      Prefer [approach] over [anti-pattern].
      [Quality standard or guardrail].
    }

    OutputFormat {
      Organize by [structure].
      Include [required elements].
    }
    ```
  }

  Constraints {
    Keep system prompts focused — one clear purpose.
    Be specific about the workflow — agents work best with clear steps.
    Include "When invoked:" for immediate action (no unnecessary preamble).
    Avoid duplicating what Claude already knows — focus on domain-specific guidance.
  }
}

# Subagent Configuration Reference

## Table of Contents
- Frontmatter Fields
- Model Options
- Tools & Permissions
- Background Execution
- Built-in Subagents

## Frontmatter Fields

FrontmatterFields {
  Optional (all fields) {
    name: string          — unique identifier; defaults to filename if omitted
    description: string   — when the parent agent should delegate; primary trigger mechanism
    model: string         — "inherit" | "fast" | specific model ID (default: inherit)
    readonly: boolean     — true to prevent file writes (default: false)
    is_background: boolean — true to run in background (default: false)
  }

  Constraints {
    description is the primary triggering mechanism — make it specific and actionable.
    Be precise about when to delegate: "Use when implementing auth flows with OAuth"
    not "Use for general tasks."
    Subagents receive ONLY their system prompt, NOT the full parent prompt.
    Subagents do NOT receive User Rules — include all instructions in the body.
    Max 4 concurrent subagents can run in parallel.
  }
}

## Model Options

ModelOptions {
  inherit — use same model as parent conversation (default when omitted)
  fast    — use a faster, cheaper model for simple/high-volume tasks
  <model-id> — specific model ID (e.g. "claude-sonnet-4-20250514")
}

## Tools & Permissions

ToolAccess {
  Subagents inherit ALL tools from the parent, including MCP tools.
  Use `readonly: true` to restrict the subagent from making file edits.

  Constraints {
    Subagents cannot spawn other subagents.
    There is no tool allowlist/denylist — use readonly for read-only agents.
  }
}

## Background Execution

BackgroundExecution {
  Set `is_background: true` to run the subagent in the background.
  Background subagent state is written to ~/.cursor/subagents/.
  The parent agent receives an agent ID that can be used to resume
  the subagent with preserved context.
}

## Built-in Subagents

BuiltInSubagents {
  Cursor ships with 4 default subagent types (cannot be overridden):
  - generalPurpose — parallel work streams
  - explore        — codebase research (uses a fast model)
  - shell          — terminal command execution
  - browser-use    — browser interaction
}

# Subagent Configuration Reference

## Table of Contents
- Frontmatter Fields
- Available Tools
- Model Options
- Permission Modes
- Hooks Configuration
- Memory Configuration

## Frontmatter Fields

FrontmatterFields {
  Required {
    name: string       — lowercase letters and hyphens, unique identifier
    description: string — when Claude should delegate; primary trigger mechanism
  }

  Optional {
    tools: string            — comma-separated allowlist (inherits all if omitted)
    disallowedTools: string  — comma-separated denylist, removed from inherited set
    model: string            — "sonnet" | "opus" | "haiku" | "inherit" (default: inherit)
    permissionMode: string   — see Permission Modes below
    maxTurns: number         — max agentic turns before stopping
    skills: list             — skill names to preload into context at startup
    mcpServers: object       — MCP servers available to the subagent
    hooks: object            — lifecycle hooks scoped to this subagent
    memory: string           — "user" | "project" | "local" for persistent memory
  }

  Constraints {
    description is the primary triggering mechanism — include "use proactively"
    for agents that should auto-delegate.
    Subagents receive ONLY their system prompt + basic env details, NOT the
    full Claude Code system prompt.
  }
}

## Available Tools

AvailableTools {
  ReadOnly {
    Read    — read files
    Grep    — search file contents
    Glob    — find files by pattern
    WebFetch — fetch web content
    WebSearch — search the web
  }

  Mutation {
    Edit    — edit files (exact string replacement)
    Write   — create/overwrite files
    NotebookEdit — edit Jupyter notebooks
  }

  Execution {
    Bash    — run shell commands
  }

  Interaction {
    AskUserQuestion — ask the user clarifying questions
    Task    — spawn subagents (only for main-thread agents via --agent)
  }

  Constraints {
    Subagents cannot spawn other subagents (Task is no-op in subagent context).
    When omitting `tools`, the subagent inherits ALL tools from the parent.
    Use `disallowedTools` to selectively remove tools from the inherited set.
    Prefer minimal tool access — grant only what's needed.
  }
}

## Model Options

ModelOptions {
  sonnet  — balanced capability and speed, good default for analysis
  opus    — most capable, best for complex reasoning
  haiku   — fastest and cheapest, good for simple/high-volume tasks
  inherit — use same model as main conversation (default when omitted)
}

## Permission Modes

PermissionModes {
  default           — standard permission checking with user prompts
  acceptEdits       — auto-accept file edits
  dontAsk           — auto-deny permission prompts (allowed tools still work)
  delegate          — coordination-only for agent team leads
  bypassPermissions — skip ALL permission checks (use with caution)
  plan              — read-only exploration mode
}

## Hooks Configuration

HooksConfig {
  Supported events in frontmatter {
    PreToolUse  — matcher: tool name, fires before tool execution
    PostToolUse — matcher: tool name, fires after tool execution
    Stop        — fires when subagent finishes (converted to SubagentStop)
  }

  Format {
    ```yaml
    hooks:
      PreToolUse:
        - matcher: "Bash"
          hooks:
            - type: command
              command: "./scripts/validate.sh"
      PostToolUse:
        - matcher: "Edit|Write"
          hooks:
            - type: command
              command: "./scripts/lint.sh"
    ```
  }

  Constraints {
    Hook scripts receive JSON via stdin with tool_input.
    Exit code 0 = allow, exit code 2 = block (stderr message shown to agent).
    Use hooks for conditional validation when tools field is too coarse.
  }
}

## Memory Configuration

MemoryConfig {
  Scopes {
    user    — ~/.claude/agent-memory/<name>/     — cross-project learning
    project — .claude/agent-memory/<name>/       — project-specific, version-controlled
    local   — .claude/agent-memory-local/<name>/ — project-specific, gitignored
  }

  Constraints {
    When enabled, Read/Write/Edit tools are auto-enabled for memory management.
    First 200 lines of MEMORY.md are injected into the subagent's system prompt.
    Include memory instructions in the system prompt for proactive curation.
    Prefer `user` scope as default unless knowledge is project-specific.
  }
}

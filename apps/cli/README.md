# Signal Summarizer CLI

A command-line tool for exporting Signal chat history and generating AI-powered summaries.

## Requirements

- Bun runtime
- Signal Desktop application with accessible database
- OpenAI API key (for summarization)

## Getting Started

```bash
cd /path/to/signal-summarizer
bun install

# add your openai key, needed for summarization
export OPENAI_API_KEY=sk-proj-your-api-key

# build the cli
bun run --filter cli build
```

## Complete Workflow Example

Build the CLI, export a chat, and generate summaries in one command:

```bash
bun run --filter cli build && bun run cli export && OPENAI_API_KEY=sk-proj-your-key bun run cli summarize
```

This will:

1. Build the CLI application
2. Export the last 7 days of chat history to markdown
3. Generate AI-powered summaries of the exported chat grouped by day

## Commands

### `export`

Export Signal chat history to markdown format.

**Usage:**

```bash
bun run cli export [options]
```

**Options:**

- `--start <date>` - Start date in YYYY-MM-DDTHH:MM:SS+00:00 format (defaults to 7 days ago)
- `--end <date>` - End date in YYYY-MM-DDTHH:MM:SS+00:00 format (defaults to now)
- `--chat <name>` - Name of the chat to export (default: "Burlington Odd Fellows Members")
- `--output <directory>` - Output directory (default: "/tmp/signal-summarizer-output")

**Example:**

```bash
bun run cli export --chat "My Group Chat" --start 2025-01-01T00:00:00+00:00
```

### `summarize`

Summarize an exported Signal chat markdown file using OpenAI.

**Usage:**

```bash
bun run cli summarize [options]
```

**Options:**

- `--markdown-path <path>` - Path to the chat markdown file (default: "/tmp/signal-summarizer-output/BurlingtonOddFellowsMembers/chat.md")
- `--model <model>` - OpenAI model to use for summarization (default: "gpt-4o-mini")
- `--temperature <number>` - Temperature for response generation, 0-2 (default: "0.7")

**Example:**

```bash
OPENAI_API_KEY=sk-proj-your-key bun run cli summarize --model gpt-4o-mini
```

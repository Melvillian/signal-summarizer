# Signal Summarizer CLI

A command-line tool for exporting Signal chat history and generating AI-powered summaries.

## Requirements

- [Bun](https://bun.sh/docs/installation) runtime
- Signal Desktop application with accessible database
- OpenAI API key (for summarization)

## Getting Started

```bash
cd /path/to/signal-summarizer
bun install

# add your openai key, needed for summarization
export OPENAI_API_KEY=sk-proj-your-api-key

# build the cli and all its dependencies
bun run build
```

## Complete Workflow Example

1. Build the CLI
2. Export the last 7 days worth of chat history in the 'Burlington Odd Fellows Members' chat
3. Generate the summary in one command

Note, you must replace 'sk-proj-your-key' with your actual OPENAI_API_KEY.

This will print out a summary of the chats from the last 7 days.

```bash
bun run build && bun run cli export && OPENAI_API_KEY=sk-proj-your-key bun run cli summarize --output ./summary.txt
```

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

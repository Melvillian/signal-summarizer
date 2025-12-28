# Signal Summarizer

A CLI tool for summarizing Signal chats. Built to help me and others keep abreast of goings-ons in the 'Burlington Odd Fellows Members' Signal group chat.

## Quickstart

```bash
bun install

# add your openai key, needed for summarization, or add the env var to apps/cli/.env
export OPENAI_API_KEY=sk-proj-your-api-key

# for this to work, you need to have the Signal desktop app installed and you need to
# be a part of a groupchat with the name 'Burlington Odd Fellows Members'
bun run start
```

This is a monorepo whose main entrypoint is at [apps/cli](./apps/cli/), so head over to the [CLI tool's dedicated README](./apps/cli/README.md) to learn more about it.

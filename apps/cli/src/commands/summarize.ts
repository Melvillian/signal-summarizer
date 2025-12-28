import fs from 'fs/promises';
import path from 'path';

import { summarizeText } from '@melvillian/openai-summarizer';
import { Command } from 'commander';

interface Message {
  timestamp: Date;
  date: string; // YYYY-MM-DD
  content: string;
}

interface DailyMessages {
  [date: string]: string;
}

function parseMessages(markdown: string): Message[] {
  const messages: Message[] = [];
  // Match lines starting with [YYYY-MM-DD HH:MM:SS]
  const messageRegex = /^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/gm;

  let match;
  const positions: { index: number; timestamp: string }[] = [];

  // Find all message positions
  while ((match = messageRegex.exec(markdown)) !== null) {
    if (match[1]) {
      positions.push({
        index: match.index,
        timestamp: match[1],
      });
    }
  }

  // Extract content between timestamps
  for (let i = 0; i < positions.length; i++) {
    const position = positions[i];
    if (!position) continue;

    const start = position.index;
    const nextPosition = positions[i + 1];
    const end = nextPosition ? nextPosition.index : markdown.length;
    const content = markdown.substring(start, end).trim();

    const timestamp = new Date(position.timestamp);
    const datePart = position.timestamp.split(' ')[0];
    if (!datePart) continue;

    messages.push({ timestamp, date: datePart, content });
  }

  return messages;
}

function groupMessagesByDay(messages: Message[]): DailyMessages {
  const dailyMessages: DailyMessages = {};

  for (const message of messages) {
    if (!dailyMessages[message.date]) {
      dailyMessages[message.date] = '';
    }
    dailyMessages[message.date] += message.content + '\n\n';
  }

  return dailyMessages;
}

const summarizeCommand = new Command('summarize')
  .description('Summarize an exported Signal chat markdown file')
  .option(
    '--markdown-path <path>',
    'Path to the chat markdown file',
    '/tmp/signal-summarizer-output/BurlingtonOddFellowsMembers/chat.md',
  )
  .option(
    '--model <model>',
    'OpenAI model to use for summarization',
    'gpt-4o-mini',
  )
  .option(
    '--temperature <number>',
    'Temperature for response generation (0-2)',
    '0.7',
  )
  .option(
    '--output <path>',
    'Path to write the summary markdown file',
    path.resolve(__dirname, '../../../../out/summary.md'),
  )
  .action(async (options) => {
    try {
      console.log('Reading chat markdown file...');
      console.log(`  Path: ${options.markdownPath}`);
      console.log();

      // Read the markdown file
      let fileContent: string;
      try {
        fileContent = await fs.readFile(options.markdownPath, 'utf-8');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          console.error(`Error: File not found at ${options.markdownPath}`);
          console.error(
            'Make sure you have run the export command first: cli export',
          );
        } else {
          console.error(`Error reading file: ${error}`);
        }
        process.exit(1);
      }

      if (!fileContent || fileContent.trim().length === 0) {
        console.error('Error: The markdown file is empty');
        process.exit(1);
      }

      console.log(`Read ${fileContent.length} characters from file`);
      console.log('Parsing messages by timestamp...');

      // Parse and group messages by day
      const messages = parseMessages(fileContent);
      const dailyMessages = groupMessagesByDay(messages);

      const dates = Object.keys(dailyMessages).sort();

      console.log(
        `Found ${messages.length} messages across ${dates.length} days`,
      );
      console.log('Generating daily summaries using OpenAI...');
      console.log(`  Model: ${options.model}`);
      console.log(`  Temperature: ${options.temperature}`);
      console.log();

      // Generate summaries for each day
      const dailySummaries: { date: string; summary: string }[] = [];

      for (const date of dates) {
        const dayContent = dailyMessages[date];
        if (!dayContent) {
          console.error(`No content found for date: ${date}`);
          continue;
        }

        console.log(`Summarizing ${date}...`);
        const summary = await summarizeText(dayContent, {
          model: options.model,
          temperature: parseFloat(options.temperature),
        });
        dailySummaries.push({ date, summary });
      }

      let finalSummary = '';
      for (const { date, summary } of dailySummaries) {
        finalSummary += `## ${date}\n\n${summary}\n\n ${'-'.repeat(80)}\n\n`;
      }

      // Write to file or print to console
      if (options.output) {
        console.log(`Writing summary to ${options.output}...`);
        await fs.writeFile(options.output, finalSummary, 'utf-8');
        console.log('Summary written successfully!');
      } else {
        console.log(finalSummary);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      process.exit(1);
    }
  });

export default summarizeCommand;

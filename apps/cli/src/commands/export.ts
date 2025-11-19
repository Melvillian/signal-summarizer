import { Command } from 'commander';
import { subDays } from 'date-fns';
import { isOk } from 'wellcrafted/result';

import { signalExport } from '../utilities/signalExport.js';

const exportCommand = new Command('export')
  .description('Export Signal chat history to markdown')
  .option(
    '--start <date>',
    'Start date in YYYY-MM-DDTHH:MM:SS+00:00 format (defaults to 7 days ago)',
  )
  .option(
    '--end <date>',
    'End date in YYYY-MM-DDTHH:MM:SS+00:00 format (defaults to now)',
  )
  .option(
    '--chat <name>',
    'Name of the chat to export',
    'Burlington Odd Fellows Members',
  )
  .option(
    '--output <directory>',
    'Output directory',
    '/tmp/signal-summarizer-output',
  )
  .action(async (options) => {
    try {
      // Parse dates if provided
      let start: Date | undefined;
      let end: Date | undefined;

      if (options.start) {
        start = new Date(options.start);
        if (isNaN(start.getTime())) {
          console.error('Error: Invalid start date format');
          process.exit(1);
        }
      } else {
        start = subDays(new Date(), 7);
      }

      if (options.end) {
        end = new Date(options.end);
        if (isNaN(end.getTime())) {
          console.error('Error: Invalid end date format');
          process.exit(1);
        }
      } else {
        end = new Date();
      }

      console.log('Exporting Signal chat history...');
      console.log(`  Chat: ${options.chat}`);
      console.log(`  Start: ${start.toISOString()}`);
      console.log(`  End: ${end.toISOString()}`);
      console.log(`  Output: ${options.output}`);
      console.log();

      const result = await signalExport({
        start,
        end,
        chatName: options.chat,
        outputDir: options.output,
      });

      if (!isOk(result)) {
        console.error('Error:', result.error);
        process.exit(1);
      }

      console.log('✓ Export completed successfully!');
      console.log(`  Output directory: ${result.data.outputPath}`);
      console.log(`  Chat markdown: ${result.data.chatMarkdownPath}`);
    } catch (error) {
      console.error('Unexpected error:', error);
      process.exit(1);
    }
  });

export default exportCommand;

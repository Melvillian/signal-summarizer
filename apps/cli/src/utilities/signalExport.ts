import { exec } from 'child_process';
import fs from 'fs/promises';
import { promisify } from 'util';

import { subDays } from 'date-fns';
import { Ok, Err, isOk } from 'wellcrafted/result';

import type { Result } from 'wellcrafted/result';

const execAsync = promisify(exec);

export interface SignalExportOptions {
  start?: Date;
  end?: Date;
  chatName?: string;
  outputDir?: string;
}

interface SignalExportResult {
  outputPath: string;
  chatMarkdownPath: string;
}

/**
 * Formats a Date to the required signal-export format: YYYY-MM-DDTHH:MM:SS+00:00
 */
function formatDateForSignalExport(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+00:00`;
}

/**
 * Converts chat name to the expected directory name format
 * e.g., "Burlington Odd Fellows Members" -> "BurlingtonOddFellowsMembers"
 */
function chatNameToDirectoryName(chatName: string): string {
  return chatName.replace(/\s+/g, '');
}

/**
 * Checks if the sigexport binary exists and is executable
 */
async function checkBinaryExists(): Promise<Result<boolean, string>> {
  try {
    await execAsync('which sigexport');
    return Ok(true);
  } catch {
    return Err(
      'sigexport binary not found. Please install signal-export: pip install signal-export',
    );
  }
}

/**
 * Prepares the output directory for the export
 * signalexport will refuse to do anything if the output directory already exists,
 * so we need to move it to a backup directory if it does
 *
 * @param outputDir - The output directory to prepare
 * @returns Result containing the output paths or error
 */
async function prepareOutputDirectory(
  outputDir: string,
): Promise<Result<void, string>> {
  try {
    // Try to stat outputDir
    await fs.stat(outputDir);
    // If stat succeeds, dir exists. Move to backup.
    const backupDir = `${outputDir}-bak`;

    // Remove any existing backup directory, if needed
    try {
      await fs.rm(backupDir, { recursive: true, force: true });
    } catch {
      // Ignore if does not exist
    }

    await fs.rename(outputDir, backupDir);
    return Ok(undefined);
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      // Other error besides "does not exist"
      return Err(`Failed to access output directory: ${err.message ?? err}`);
    }
    return Ok(undefined);
  }
}

/**
 * Exports Signal chat history to markdown format
 *
 * @param options - Configuration options
 * @param options.start - Start date (defaults to 7 days ago)
 * @param options.end - End date (defaults to now)
 * @param options.chatName - Name of the chat to export (defaults to "Burlington Odd Fellows Members")
 * @param options.outputDir - Output directory (defaults to /tmp/signal-summarizer-output/)
 * @returns Result containing the output paths or error
 */
export async function signalExport(
  options: SignalExportOptions = {},
): Promise<Result<SignalExportResult, string>> {
  // Set defaults
  const start = options.start ?? subDays(new Date(), 7);
  const end = options.end ?? new Date();
  const chatName = options.chatName ?? 'Burlington Odd Fellows Members';
  const outputDir = options.outputDir ?? '/tmp/signal-summarizer-output';

  // Check if binary exists
  const binaryCheck = await checkBinaryExists();
  if (!isOk(binaryCheck)) {
    return Err(binaryCheck.error);
  }

  // Format dates
  const startStr = formatDateForSignalExport(start);
  const endStr = formatDateForSignalExport(end);

  // Build command
  const command = `sigexport --start "${startStr}" --end "${endStr}" --chats "${chatName}" "${outputDir}"`;

  try {
    const prepareOutputDirectoryResult =
      await prepareOutputDirectory(outputDir);
    if (!isOk(prepareOutputDirectoryResult)) {
      return Err(prepareOutputDirectoryResult.error);
    }

    // Execute sigexport command
    const { stdout, stderr } = await execAsync(command);

    // Log output for debugging
    if (stdout) {
      console.log('sigexport output:', stdout);
    }
    if (stderr) {
      console.error('sigexport stderr:', stderr);
    }

    // Verify output file exists
    const chatDirName = chatNameToDirectoryName(chatName);
    const chatMarkdownPath = `${outputDir}/${chatDirName}/chat.md`;

    try {
      const stats = await fs.stat(chatMarkdownPath);

      // Check if file is empty
      if (stats.size === 0) {
        return Err(`Output file ${chatMarkdownPath} is empty`);
      }

      return Ok({
        outputPath: outputDir,
        chatMarkdownPath,
      });
    } catch {
      return Err(
        `Output file ${chatMarkdownPath} does not exist. sigexport may have failed.`,
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return Err(`Failed to execute sigexport: ${errorMessage}`);
  }
}

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function changeSystemDate(days: number): Promise<void> {
  const cmd = `sudo /usr/local/bin/change_date.sh ${days}`;
  /**
      #!/bin/bash
      # change_date.sh

      # Calculate the new date
      new_date=$(date -d "$1 days" +"%Y-%m-%d %H:%M:%S")

      # Change the system date
      /usr/bin/date -s "$new_date"
    */

  // Add the following to the last line of /etc/sudoers: with sudo visudo
  // username ALL=(ALL) NOPASSWD: /usr/local/bin/change_date.sh

  try {
    const { stdout } = await execAsync(cmd);
    console.log(`Date and time changed to: ${stdout.trim()}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

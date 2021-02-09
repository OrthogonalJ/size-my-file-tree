import process from 'process';
import { dialog, app } from 'electron';
import fs from 'fs';
import path from 'path';

export function registerUnhandledErrorDialog() {
  process.on("uncaughtException", (error: any) => {
    dialog.showMessageBox({
      type: "error",
      title: "Error",
      message: error.toString()
    });

    // let msg = '';
    // fs.readdirSync(path.join(__dirname, 'dist/traverser')).forEach(file => {
    //   msg += '\n' + file;
    // });

    // dialog.showMessageBox({
    //   type: "error",
    //   title: "Error",
    //   message: msg
    // });

    // process.exit(1);
    // process.kill(process.pid, 'SIGTERM');
    // app.exit();
 });
}

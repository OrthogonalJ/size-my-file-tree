import process from 'process';
import { dialog, app } from 'electron';

export function registerUnhandledErrorDialog() {
  process.on("uncaughtException", (error: any) => {
    dialog.showMessageBox({
      type: "error",
      title: "Error",
      message: error.toString()
    }).then(() => {
      if (process.env.NODE_ENV !== 'development') {
        process.exit(1);
      }
    });
 });
}

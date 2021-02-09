import child_process, { ChildProcess } from 'child_process';
import process from 'process';
import {Readable} from 'stream';
import {dialog} from 'electron';
import * as config from '../../common/config';

export class FileTreeServerManager {
  private static proc: ChildProcess | null = null;

  static async start() {
    if (this.proc !== null) return;

    this.proc = this.createServerProcess();

    this.proc.on('error', (error: Error) => {
      throw error;
    });

    this.proc.stdout?.on('data', (data: Readable) => {
      console.log(data.toString());
    });
    this.proc.stderr?.on('data', (data: Readable) => {
      console.error(data.toString());
    });
  }

  static async stop(timeout?: number) {
    if (this.proc === null) return;

    await new Promise<void>((res, rej) => {
      this.proc?.on('disconnect', () => res());
      this.proc?.on('exit', () => res());
      this.proc?.on('error', (error: Error) => rej(error));

      if (timeout !== undefined) {
        let timerId = setTimeout(() => {
          clearTimeout(timerId);
          rej('Timmed out');
        });
      }

      this.proc?.kill();
    });

    this.proc = null;
  }

  private static createServerProcess(): ChildProcess {
    let args = [
      '--host', config.FILE_TREE_SERVER_HOST,
      '--port', config.FILE_TREE_SERVER_PORT.toString()
    ];
    const cmd = (process.env.NODE_ENV === 'development') ?
      config.FILE_TREE_SERVER_PYTHON :
      config.FILE_TREE_SERVER_EXE;

    if (process.env.NODE_ENV === 'development') {
      args.unshift(config.FILE_TREE_SERVER_SCRIPT);
    }

    return child_process.spawn(cmd, args, { windowsHide: true });
  }
}

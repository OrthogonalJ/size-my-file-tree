import { IpcMainInvokeEvent } from 'electron';
import WebSocket from 'ws';
import { IIpcChannel } from './IIpcChannel';
import { IFileTreeNode } from '../../common/IFileTreeNode';
import * as config from '../../common/config';
import child_process from 'child_process';
import fs from 'fs';
import path from 'path';

export interface IFileTreeRequest {
  rootDir: string;
}

export interface IFileTreeResponse {
  root: IFileTreeNode;
}

export class FileTreeChannel implements IIpcChannel {
  getName(): string {
    return 'file-tree';
  }

  async handle(event: IpcMainInvokeEvent, request: IFileTreeRequest): Promise<any> {
    return new Promise((res, rej) => {
      const ws = new WebSocket(
        `ws://${config.FILE_TREE_SERVER_HOST}:${config.FILE_TREE_SERVER_PORT}/`,
        { perMessageDeflate: true, maxPayload: Math.pow(2, 63) }
      );

      ws.on('open', () => {
        ws.send(JSON.stringify({ rootDir: request.rootDir }));
      });

      ws.on('message', (msg: string) => {
        res(this.parseFileTreeNodeMessage(msg));
      });

      ws.on('error', (error) => {
        // let result = child_process.spawnSync('dir');
        // rej(result.stdout);
        let msg = '';
        fs.readdirSync(path.join(__dirname, 'dist/traverser')).forEach(file => {
          msg += '\n' + file;
        });
        rej(msg);
      });
    });
  }

  private parseFileTreeNodeMessage(msg: string): IFileTreeNode {
    const json = JSON.parse(msg);
    json.root = this.convertTreeNodeJsonKeysToCammelCase(json.root);
    return json;
  }

  private convertTreeNodeJsonKeysToCammelCase(obj: any): any {
    let newObj: any = {};
    for (let key of Object.keys(obj)) {
      const value = obj[key];
      const cammelCaseName = this.snakeToCammelCase(key);
      newObj[cammelCaseName] = value;
    }
    newObj.children = newObj.children.map((child: any) => {
      return this.convertTreeNodeJsonKeysToCammelCase(child);
    });
    return newObj;
  }

  private snakeToCammelCase(name: string): string {
    let cammelCaseName = '';
    name.split('_').forEach((word, i) => {
      if (i !== 0) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      cammelCaseName += word;
    });
    return cammelCaseName;
  }
}

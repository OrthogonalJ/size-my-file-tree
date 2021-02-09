import { ipcRenderer } from 'electron';

export class IpcService {
  static async invoke(channel: string, request?: any): Promise<any> {
    if (request === undefined || request === null) {
      return ipcRenderer.invoke(channel);
    }
    return ipcRenderer.invoke(channel, request);
  }
}

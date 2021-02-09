import { ipcMain } from 'electron';
import { FileTreeChannel } from './fileTree';
import { IIpcChannel } from './IIpcChannel';

function register(channel: IIpcChannel) {
  ipcMain.handle(channel.getName(), async (event, request) => channel.handle(event, request));
}

export function initChannels() {
  register(new FileTreeChannel());
}

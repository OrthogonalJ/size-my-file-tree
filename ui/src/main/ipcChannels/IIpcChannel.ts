import { IpcMainInvokeEvent } from 'electron';

export interface IIpcChannel {
  getName(): string;
  handle(event: IpcMainInvokeEvent, request: any): Promise<any>;
}

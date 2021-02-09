export interface IFileTreeNode {
  path: string;
  baseName: string;
  size: number;
  isFile: boolean;
  children: IFileTreeNode[];
}

import process from 'process';
import path from 'path';

export const FILE_TREE_SERVER_PYTHON = 'python';
export const FILE_TREE_SERVER_SCRIPT = path.join(__dirname, '../../../traverser/__main__.py');
export const FILE_TREE_SERVER_EXE =
  process.env.NODE_ENV === 'development'
    ? path.join(__dirname, '../dist/traverser/__main__.exe')
    : path.join(process.resourcesPath, 'src/dist/traverser/__main__.exe');
export const FILE_TREE_SERVER_HOST = 'localhost';
export const FILE_TREE_SERVER_PORT = 3000;

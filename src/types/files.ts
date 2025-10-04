export type FileEntry = {
    name: string;
    path: string;
    absolutePath: string;
    type: 'file' | 'directory' | 'symlink' | 'other';
};
export interface Progress {
    state: 'pending' | 'downloading' | 'completed' | 'failed';
    progress?: number;
    error?: string;
    total?: number;
    downloaded?: number;
}
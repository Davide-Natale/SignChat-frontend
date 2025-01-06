export type ImageProfileType = 
    {
        type: 'local';
        uri: string;
        mimeType: string;
        fileName: string;
    } |
    {
        type: 'remote';
        uri: string;
    } | 
    {
        type: 'none';
    };
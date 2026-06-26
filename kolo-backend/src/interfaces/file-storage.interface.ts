export interface FileUploadOptions {
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  path?: string;
}

export interface FileUploadResult {
  url: string;
  path: string;
  mimeType: string;
  sizeBytes: number;
}

export interface FileStorage {
  upload(file: Buffer, fileName: string, mimeType: string, options?: FileUploadOptions): Promise<FileUploadResult>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
}

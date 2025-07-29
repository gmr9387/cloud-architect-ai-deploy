import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Package, 
  Trash2, 
  Download,
  Eye,
  Folder,
  Archive,
  CheckCircle
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  status: 'uploading' | 'complete' | 'error';
  progress: number;
  processed?: {
    compressed?: Blob;
    optimized?: Blob;
    metadata: {
      size: number;
      type: string;
      lastModified: number;
      dimensions?: { width: number; height: number };
    };
  };
}

export const FileUploadManager: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const createFilePreview = useCallback(async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }
    return undefined;
  }, []);

  const getImageDimensions = useCallback((file: File): Promise<{ width: number; height: number } | undefined> => {
    if (!file.type.startsWith('image/')) return Promise.resolve(undefined);

    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve(undefined);
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const compressImage = useCallback(async (file: File): Promise<Blob | undefined> => {
    if (!file.type.startsWith('image/')) return undefined;

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = document.createElement('img');

      img.onload = () => {
        // Calculate new dimensions (max 1920px)
        let { width, height } = img;
        const maxDim = 1920;
        
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height * maxDim) / width;
            width = maxDim;
          } else {
            width = (width * maxDim) / height;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => resolve(blob || undefined),
          'image/webp',
          0.8
        );
      };

      img.onerror = () => resolve(undefined);
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const processFile = useCallback(async (uploadedFile: UploadedFile) => {
    const { file } = uploadedFile;
    
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, progress, status: progress === 100 ? 'complete' : 'uploading' }
          : f
      ));
    }

    // Get file metadata
    const dimensions = await getImageDimensions(file);
    const compressed = await compressImage(file);

    const processed = {
      compressed,
      metadata: {
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        dimensions
      }
    };

    setFiles(prev => prev.map(f => 
      f.id === uploadedFile.id 
        ? { ...f, processed }
        : f
    ));
  }, [getImageDimensions, compressImage]);

  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const preview = await createFilePreview(file);
      
      const uploadedFile: UploadedFile = {
        id: generateId(),
        file,
        preview,
        status: 'uploading',
        progress: 0
      };

      newFiles.push(uploadedFile);
    }

    setFiles(prev => [...prev, ...newFiles]);

    // Process files
    for (const uploadedFile of newFiles) {
      processFile(uploadedFile);
    }
  }, [createFilePreview, processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const downloadFile = useCallback((file: UploadedFile, type: 'original' | 'compressed' = 'original') => {
    if (type === 'compressed' && file.processed?.compressed) {
      const fileName = file.file.name.replace(/\.[^/.]+$/, '') + '_compressed.webp';
      saveAs(file.processed.compressed, fileName);
    } else {
      saveAs(file.file, file.file.name);
    }
  }, []);

  const downloadAll = useCallback(async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    const zip = new JSZip();

    files.forEach((file) => {
      zip.file(file.file.name, file.file);
      
      if (file.processed?.compressed) {
        const compressedName = file.file.name.replace(/\.[^/.]+$/, '') + '_compressed.webp';
        zip.file(compressedName, file.processed.compressed);
      }
    });

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `files_${new Date().toISOString().split('T')[0]}.zip`);
    } finally {
      setIsProcessing(false);
    }
  }, [files]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (file.type.startsWith('text/')) return <FileText className="w-5 h-5" />;
    if (file.type === 'application/zip') return <Package className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    return bytes < 1024 * 1024 
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalSize = files.reduce((sum, file) => sum + file.file.size, 0);
  const completedFiles = files.filter(f => f.status === 'complete').length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Folder className="w-5 h-5 text-primary" />
            <span>File Upload Manager</span>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Real Processing
            </Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {completedFiles}/{files.length} files • {formatFileSize(totalSize)}
            </span>
            {files.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadAll}
                disabled={isProcessing}
              >
                <Download className="w-4 h-4 mr-2" />
                {isProcessing ? 'Creating...' : 'Download All'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Drop files here or click to upload</h3>
          <p className="text-muted-foreground mb-4">
            Support for images, documents, archives, and more
          </p>
          <Button variant="outline">
            <File className="w-4 h-4 mr-2" />
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Uploaded Files ({files.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {files.map((uploadedFile) => (
                <Card key={uploadedFile.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* File Preview/Icon */}
                      <div className="flex-shrink-0">
                        {uploadedFile.preview ? (
                          <img
                            src={uploadedFile.preview}
                            alt={uploadedFile.file.name}
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                            {getFileIcon(uploadedFile.file)}
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium truncate">{uploadedFile.file.name}</p>
                          <div className="flex items-center space-x-2">
                            {uploadedFile.status === 'complete' && (
                              <CheckCircle className="w-4 h-4 text-status-success" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(uploadedFile.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                          <span>{formatFileSize(uploadedFile.file.size)}</span>
                          <span>{uploadedFile.file.type || 'Unknown type'}</span>
                          {uploadedFile.processed?.metadata.dimensions && (
                            <span>
                              {uploadedFile.processed.metadata.dimensions.width}×
                              {uploadedFile.processed.metadata.dimensions.height}
                            </span>
                          )}
                        </div>

                        {/* Progress */}
                        {uploadedFile.status === 'uploading' && (
                          <Progress value={uploadedFile.progress} className="mb-2" />
                        )}

                        {/* Actions */}
                        {uploadedFile.status === 'complete' && (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadFile(uploadedFile, 'original')}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Original
                            </Button>
                            {uploadedFile.processed?.compressed && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadFile(uploadedFile, 'compressed')}
                              >
                                <Archive className="w-4 h-4 mr-1" />
                                Compressed
                              </Button>
                            )}
                            {uploadedFile.preview && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(uploadedFile.preview!, '_blank')}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Preview
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
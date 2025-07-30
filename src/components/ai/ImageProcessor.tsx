import React, { useState, useCallback, useRef, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Download, 
  Scissors, 
  Zap, 
  Eye, 
  FileImage,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { saveAs } from 'file-saver';

// Lazy load the AI processing component to keep the main bundle small
const AIImageProcessorCore = lazy(() => import('./AIImageProcessorCore'));

interface ProcessedImage {
  id: string;
  original: string;
  processed?: string;
  filename: string;
  size: number;
  type: string;
  analysis?: {
    objects: Array<{ label: string; score: number }>;
    dominant_colors: string[];
    quality_score: number;
    optimization_suggestions: string[];
  };
}

export const ImageProcessor: React.FC = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    
    try {
      const processedImages: ProcessedImage[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        setCurrentOperation(`Processing ${file.name}...`);
        setProgress((i / files.length) * 100);

        const imageUrl = URL.createObjectURL(file);
        
        // Basic image analysis without AI for faster processing
        const analysis = await analyzeImageBasic(file);
        
        const processedImage: ProcessedImage = {
          id: `${Date.now()}-${i}`,
          original: imageUrl,
          filename: file.name,
          size: file.size,
          type: file.type,
          analysis
        };

        processedImages.push(processedImage);
      }

      setImages(prev => [...prev, ...processedImages]);
      setCurrentOperation('Complete!');
      setProgress(100);
      
    } catch (error) {
      console.error('Error processing images:', error);
      setCurrentOperation('Error processing images');
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProgress(0);
        setCurrentOperation('');
      }, 2000);
    }
  }, []);

  // Basic image analysis without AI dependencies
  const analyzeImageBasic = async (file: File) => {
    return new Promise<{
      objects: Array<{ label: string; score: number }>;
      dominant_colors: string[];
      quality_score: number;
      optimization_suggestions: string[];
    }>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { dominant_colors, quality_score, optimization_suggestions } = analyzeImageData(imageData);

        resolve({
          objects: [{ label: 'Image uploaded', score: 1.0 }], // Placeholder
          dominant_colors,
          quality_score,
          optimization_suggestions
        });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const analyzeImageData = (imageData: ImageData) => {
    const data = imageData.data;
    const colorCounts: { [key: string]: number } = {};
    let totalPixels = 0;
    let brightnessSum = 0;

    // Sample pixels for performance
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      brightnessSum += brightness;
      totalPixels++;

      // Group similar colors
      const colorKey = `${Math.floor(r/50)*50},${Math.floor(g/50)*50},${Math.floor(b/50)*50}`;
      colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
    }

    const averageBrightness = brightnessSum / totalPixels;
    const quality_score = Math.min(100, Math.max(0, 100 - (Math.abs(averageBrightness - 128) / 128) * 50));

    const dominant_colors = Object.entries(colorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([color]) => `rgb(${color})`);

    const optimization_suggestions = [];
    if (averageBrightness < 80) optimization_suggestions.push('Image appears dark - consider brightness adjustment');
    if (averageBrightness > 200) optimization_suggestions.push('Image appears overexposed - consider reducing brightness');
    if (imageData.width > 1920 || imageData.height > 1920) optimization_suggestions.push('Consider resizing for web optimization');
    optimization_suggestions.push('Convert to WebP format for better compression');

    return { dominant_colors, quality_score, optimization_suggestions };
  };

  const optimizeImage = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    setIsProcessing(true);
    setCurrentOperation('Optimizing image...');
    setProgress(0);

    try {
      const imageElement = await loadImageElement(image.original);
      setProgress(30);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Optimize dimensions
      let { width, height } = imageElement;
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
      ctx.drawImage(imageElement, 0, 0, width, height);
      setProgress(70);

      // Convert to WebP with compression
      const optimizedUrl = canvas.toDataURL('image/webp', 0.8);
      
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, processed: optimizedUrl }
          : img
      ));

      setProgress(100);
      setCurrentOperation('Image optimized!');
    } catch (error) {
      console.error('Error optimizing image:', error);
      setCurrentOperation('Error optimizing image');
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProgress(0);
        setCurrentOperation('');
      }, 2000);
    }
  };

  const loadImageElement = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.crossOrigin = 'anonymous';
      img.src = src;
    });
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        saveAs(blob, filename);
      });
  };

  const formatFileSize = (bytes: number) => {
    return bytes < 1024 * 1024 
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const enableAI = () => {
    setAiEnabled(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-ai-primary" />
            <span>Image Processor</span>
            {aiEnabled ? (
              <Badge variant="secondary" className="bg-ai-primary/10 text-ai-primary">
                AI Enabled
              </Badge>
            ) : (
              <Badge variant="outline">
                Basic Mode
              </Badge>
            )}
          </div>
          {!aiEnabled && (
            <Button variant="outline" size="sm" onClick={enableAI}>
              Enable AI Features
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {aiEnabled ? (
          <Suspense fallback={
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin mr-2" />
              <span>Loading AI capabilities...</span>
            </div>
          }>
            <AIImageProcessorCore 
              images={images}
              setImages={setImages}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              progress={progress}
              setProgress={setProgress}
              currentOperation={currentOperation}
              setCurrentOperation={setCurrentOperation}
            />
          </Suspense>
        ) : (
          <>
            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(e.dataTransfer.files);
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Upload Images for Processing</h3>
              <p className="text-muted-foreground mb-4">
                Drag & drop images or click to select. Enable AI for advanced features.
              </p>
              <Button variant="outline">
                <FileImage className="w-4 h-4 mr-2" />
                Select Images
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{currentOperation}</span>
                  <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {/* Images Grid - Basic Mode */}
            {images.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Processed Images ({images.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {images.map((image) => (
                    <Card key={image.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-sm font-medium mb-2">Original</p>
                              <img
                                src={image.original}
                                alt="Original"
                                className="w-full h-32 object-cover rounded border"
                              />
                            </div>
                            {image.processed && (
                              <div>
                                <p className="text-sm font-medium mb-2">Processed</p>
                                <img
                                  src={image.processed}
                                  alt="Processed"
                                  className="w-full h-32 object-cover rounded border"
                                />
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>{image.filename}</p>
                            <p>{formatFileSize(image.size)} • {image.type}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => optimizeImage(image.id)}
                              disabled={isProcessing}
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              Optimize
                            </Button>
                            {image.processed && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => downloadImage(image.processed!, `processed_${image.filename}`)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
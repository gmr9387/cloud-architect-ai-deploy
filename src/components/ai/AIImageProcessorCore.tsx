import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  FileImage,
  AlertCircle
} from 'lucide-react';
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

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

interface AIImageProcessorCoreProps {
  images: ProcessedImage[];
  setImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  currentOperation: string;
  setCurrentOperation: React.Dispatch<React.SetStateAction<string>>;
}

const AIImageProcessorCore: React.FC<AIImageProcessorCoreProps> = ({
  images,
  setImages,
  isProcessing,
  setIsProcessing,
  progress,
  setProgress,
  currentOperation,
  setCurrentOperation
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // AI Models (lazy loaded)
  const [segmenter, setSegmenter] = useState<any>(null);
  const [classifier, setClassifier] = useState<any>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const loadModels = useCallback(async () => {
    if (modelsLoaded) return;
    
    setCurrentOperation('Loading AI models...');
    setProgress(10);
    
    try {
      const seg = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512');
      setSegmenter(seg);
      setProgress(50);
      
      const cls = await pipeline('image-classification', 'Xenova/vit-base-patch16-224');
      setClassifier(cls);
      setProgress(80);
      
      setModelsLoaded(true);
      setCurrentOperation('AI models loaded!');
      setProgress(100);
      
      setTimeout(() => {
        setProgress(0);
        setCurrentOperation('');
      }, 2000);
    } catch (error) {
      console.error('Error loading AI models:', error);
      setCurrentOperation('Error loading models');
    }
  }, [modelsLoaded, setCurrentOperation, setProgress]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!modelsLoaded) {
      await loadModels();
    }

    setIsProcessing(true);
    setProgress(0);
    
    try {
      const processedImages: ProcessedImage[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        setCurrentOperation(`Analyzing ${file.name} with AI...`);
        setProgress((i / files.length) * 100);

        const imageUrl = URL.createObjectURL(file);
        const imageElement = await loadImageElement(imageUrl);
        
        // AI-powered analysis
        const analysis = await analyzeImageWithAI(imageElement);
        
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
      setCurrentOperation('AI analysis complete!');
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
  }, [modelsLoaded, loadModels, setImages, setIsProcessing, setProgress, setCurrentOperation]);

  const loadImageElement = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.crossOrigin = 'anonymous';
      img.src = src;
    });
  };

  const analyzeImageWithAI = async (imageElement: HTMLImageElement) => {
    try {
      // Get AI-powered image classification
      const classificationResults = await classifier(imageElement);
      const objects = classificationResults.slice(0, 5).map((result: any) => ({
        label: result.label,
        score: Math.round(result.score * 100) / 100
      }));

      // Analyze image properties
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = imageElement.naturalWidth;
      canvas.height = imageElement.naturalHeight;
      ctx.drawImage(imageElement, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { dominant_colors, quality_score, optimization_suggestions } = analyzeImageData(imageData);

      return {
        objects,
        dominant_colors,
        quality_score,
        optimization_suggestions
      };
    } catch (error) {
      console.error('Error analyzing image with AI:', error);
      return {
        objects: [],
        dominant_colors: [],
        quality_score: 0,
        optimization_suggestions: []
      };
    }
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

  const removeBackground = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image || !segmenter) return;

    setIsProcessing(true);
    setCurrentOperation('AI removing background...');
    setProgress(0);

    try {
      const imageElement = await loadImageElement(image.original);
      setProgress(30);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Resize for performance
      const maxDim = 512;
      let { width, height } = imageElement;
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
      setProgress(50);

      const result = await segmenter(canvas.toDataURL());
      setProgress(80);

      if (result && result.length > 0 && result[0].mask) {
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = width;
        outputCanvas.height = height;
        const outputCtx = outputCanvas.getContext('2d')!;

        outputCtx.drawImage(canvas, 0, 0);
        const imageData = outputCtx.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let i = 0; i < result[0].mask.data.length; i++) {
          const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
          data[i * 4 + 3] = alpha;
        }

        outputCtx.putImageData(imageData, 0, 0);
        const processedUrl = outputCanvas.toDataURL('image/png');

        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, processed: processedUrl }
            : img
        ));
      }

      setProgress(100);
      setCurrentOperation('Background removed!');
    } catch (error) {
      console.error('Error removing background:', error);
      setCurrentOperation('Error removing background');
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProgress(0);
        setCurrentOperation('');
      }, 2000);
    }
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

  const downloadImage = (imageUrl: string, filename: string) => {
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      });
  };

  const formatFileSize = (bytes: number) => {
    return bytes < 1024 * 1024 
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
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
        <h3 className="font-semibold mb-2">Upload Images for AI Processing</h3>
        <p className="text-muted-foreground mb-4">
          Drag & drop images or click to select. AI models: {modelsLoaded ? 'Ready' : 'Loading...'}
        </p>
        <Button variant="outline" disabled={!modelsLoaded}>
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

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">AI-Processed Images ({images.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {images.map((image) => (
              <div key={image.id} className="border rounded-lg overflow-hidden">
                <div className="p-4">
                  <Tabs defaultValue="preview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                      <TabsTrigger value="actions">AI Actions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="preview" className="space-y-4">
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
                    </TabsContent>

                    <TabsContent value="analysis" className="space-y-4">
                      {image.analysis && (
                        <>
                          <div>
                            <h4 className="font-medium mb-2">AI-Detected Objects</h4>
                            <div className="flex flex-wrap gap-2">
                              {image.analysis.objects.map((obj, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {obj.label} ({(obj.score * 100).toFixed(0)}%)
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Quality Score</h4>
                            <div className="flex items-center space-x-2">
                              <Progress value={image.analysis.quality_score} className="flex-1" />
                              <span className="text-sm">{image.analysis.quality_score.toFixed(0)}%</span>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">AI Optimization Suggestions</h4>
                            <div className="space-y-1">
                              {image.analysis.optimization_suggestions.map((suggestion, idx) => (
                                <Alert key={idx} className="py-2">
                                  <AlertCircle className="w-4 h-4" />
                                  <AlertDescription className="text-xs">
                                    {suggestion}
                                  </AlertDescription>
                                </Alert>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </TabsContent>

                    <TabsContent value="actions" className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeBackground(image.id)}
                          disabled={isProcessing || !modelsLoaded}
                        >
                          <Scissors className="w-4 h-4 mr-2" />
                          Remove BG (AI)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => optimizeImage(image.id)}
                          disabled={isProcessing}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Optimize
                        </Button>
                      </div>
                      {image.processed && (
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full"
                          onClick={() => downloadImage(image.processed!, `ai_processed_${image.filename}`)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download AI Result
                        </Button>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default AIImageProcessorCore;
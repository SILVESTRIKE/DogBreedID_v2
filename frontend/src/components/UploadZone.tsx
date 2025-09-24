import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Cloud, Upload } from "lucide-react";
import { useState, useRef, DragEvent, React } from "react";

interface UploadZoneProps {
  onUpload: (file: File) => void;
  canUpload: boolean;
  isLoggedIn: boolean;
  remainingPredictions: number;
}

export function UploadZone({ onUpload, canUpload, isLoggedIn, remainingPredictions }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (canUpload) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (!canUpload) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onUpload(file);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && canUpload) {
      onUpload(file);
    }
  };

  const handleSampleImageClick = async (imageUrl: string) => {
    if (!canUpload) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'sample-dog.jpg', { type: 'image/jpeg' });
      onUpload(file);
    } catch (error) {
      console.error('Error loading sample image:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Main Upload Zone */}
      <Card
        className={`relative border-2 border-dashed transition-all duration-300 cursor-pointer ${isDragOver && canUpload ? 'border-primary bg-primary/5 scale-105' :
          canUpload ? 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50' :
            'border-muted-foreground/10 bg-muted/20'
          } ${!canUpload ? 'cursor-not-allowed opacity-60' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => canUpload && fileInputRef.current?.click()}
      >
        <div className="p-12 text-center space-y-6">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${isDragOver && canUpload ? 'bg-primary scale-110' : 'bg-primary/10'
            }`}>
            <Cloud className={`h-8 w-8 transition-colors duration-300 ${isDragOver && canUpload ? 'text-primary-foreground' : 'text-primary'
              }`} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              {canUpload ? 'Drop your dog photo here or click to select' : 'Upload limit reached'}
            </h3>
            <p className="text-muted-foreground">
              {canUpload ? 'JPG, PNG, BMP, or WEBP formats supported' :
                isLoggedIn ? 'You have used all 100 predictions' : 'Login for more predictions'}
            </p>
          </div>

          {canUpload && (
            <Button size="lg" className="gap-2">
              <Upload className="h-4 w-4" />
              Choose File
            </Button>
          )}

          <div className="text-sm text-muted-foreground">
            <span className="bg-muted px-2 py-1 rounded">
              {isLoggedIn ? `${remainingPredictions} predictions remaining` :
                `${remainingPredictions} free prediction${remainingPredictions !== 1 ? 's' : ''} left`}
            </span>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </Card>

      {/* Sample Images */}
      <div className="space-y-4">
        <div className="space-y-3">
          <p className="text-center text-sm">
            <span className="text-muted-foreground">Try these sample images</span>
          </p>

          <div className="flex justify-center gap-4">
            <div
              className={`relative rounded-lg overflow-hidden shadow-lg transition-all duration-300 ${canUpload ? 'cursor-pointer hover:scale-105 hover:shadow-xl' : 'cursor-not-allowed opacity-60'
                }`}
              onClick={() => handleSampleImageClick('https://images.unsplash.com/photo-1602104336551-6f36b8c56dc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYWxtYXRpYW4lMjBkb2clMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTYxNzI0Njh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')}
            >
              <img
                src="https://images.unsplash.com/photo-1602104336551-6f36b8c56dc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYWxtYXRpYW4lMjBkb2clMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTYxNzI0Njh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Sample Dalmatian"
                className="w-24 h-16 object-cover"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300" />
            </div>

            <div
              className={`relative rounded-lg overflow-hidden shadow-lg transition-all duration-300 ${canUpload ? 'cursor-pointer hover:scale-105 hover:shadow-xl' : 'cursor-not-allowed opacity-60'
                }`}
              onClick={() => handleSampleImageClick('https://images.unsplash.com/photo-1543320317-15188058b450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdWclMjBkb2clMjBmYWNlfGVufDF8fHx8MTc1NjE3MjQ2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')}
            >
              <img
                src="https://images.unsplash.com/photo-1543320317-15188058b450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdWclMjBkb2clMjBmYWNlfGVufDF8fHx8MTc1NjE3MjQ2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Sample Pug"
                className="w-24 h-16 object-cover"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300" />
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            (Click on any image to test it out)
          </p>
        </div>
      </div>

      {/* Powered By */}

    </div>
  );
}
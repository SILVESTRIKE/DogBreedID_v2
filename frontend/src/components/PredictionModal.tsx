import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PredictionResult {
  breed: string;
  confidence: number;
  traits: string[];
  careTips: string[];
  image: string;
}

interface PredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PredictionResult | null;
  uploadedImage: string | null;
}

export function PredictionModal({ isOpen, onClose, result, uploadedImage }: PredictionModalProps) {
  if (!result) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Breed Prediction Results</DialogTitle>
          <DialogDescription>
            Here's what our AI discovered about your dog
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Uploaded Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Photo</h3>
            {uploadedImage && (
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={uploadedImage} 
                  alt="Your uploaded dog" 
                  className="w-full h-64 object-cover"
                />
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Breed Identification</h3>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="text-lg px-3 py-1">
                  {result.breed}
                </Badge>
                <Badge variant="secondary">
                  {result.confidence}% confident
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Key Traits</h4>
              <div className="flex flex-wrap gap-2">
                {result.traits.map((trait, index) => (
                  <Badge key={index} variant="outline">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Care Tips</h4>
              <Card>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {result.careTips.map((tip, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-2 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
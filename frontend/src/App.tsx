import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import { Camera, Heart, Shield, Zap, Users, Award, Upload, Search, Check, Mail, MapPin, Phone, Clock } from "lucide-react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Navbar } from "./components/Navbar";
import { UploadZone } from "./components/UploadZone";
import { useState } from "react";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPredictions, setUserPredictions] = useState(0);
  const [predictionResult, setPredictionResult] = useState(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const handleLogin = (email: string, password: string) => {
    // Mock login - in real app, this would call an API
    setIsLoggedIn(true);
    setUserPredictions(0); // Reset predictions for new login
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserPredictions(0);
  };

  const handleUpload = (file: File) => {
    // Mock prediction - in real app, this would call an AI API
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);

      // Mock result
      const mockResult = {
        breed: "Golden Retriever",
        confidence: 94,
        traits: ["Friendly", "Intelligent", "Loyal", "Active", "Family-oriented"],
        careTips: [
          "Needs daily exercise and mental stimulation",
          "Regular brushing to manage shedding",
          "Thrives on positive reinforcement training",
          "Requires social interaction and companionship"
        ],
        image: e.target?.result as string
      };

      setPredictionResult(mockResult);
      setUserPredictions(prev => prev + 1);
    };
    reader.readAsDataURL(file);
  };

  const handleEmailSubscribe = () => {
    // Mock subscription
    alert(`Thank you for subscribing with ${email}!`);
    setEmail("");
  };

  const handleTryAgain = () => {
    setPredictionResult(null);
    setUploadedImage(null);
  };

  const canUpload = isLoggedIn || userPredictions < 1;
  const remainingPredictions = isLoggedIn ? 100 - userPredictions : 1 - userPredictions;

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isLoggedIn={isLoggedIn}
        userPredictions={userPredictions}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onUpload={handleUpload}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/3 via-background to-accent/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iY3VycmVudENvbG9yIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-40" />

        <div className="container mx-auto px-4 py-16 relative z-10">
          {!predictionResult ? (
            // Initial State
            <div className="grid lg:grid-cols-4 gap-12 items-start">
              {/* Left Content */}
              <div className="lg:col-span-1 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight">
                      Identify Any Dog Breed in{" "}
                      <span className="text-primary font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        Seconds
                      </span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                      Upload a photo and discover your dog's breed instantly with our advanced AI technology.
                      Get detailed breed information, traits, and care tips.
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 pt-6">
                    <div className="text-center space-y-1">
                      <div className="text-2xl md:text-3xl font-bold text-primary">120+</div>
                      <div className="text-sm text-muted-foreground">Dog Breeds</div>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="text-2xl md:text-3xl font-bold text-primary">98.2%</div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="text-2xl md:text-3xl font-bold text-primary">1+</div>
                      <div className="text-sm text-muted-foreground">Happy Users</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Zone */}
              <div className="lg:col-span-3">
                <UploadZone
                  onUpload={handleUpload}
                  canUpload={canUpload}
                  isLoggedIn={isLoggedIn}
                  remainingPredictions={remainingPredictions}
                />
              </div>

              {/* Right Image */}

            </div>
          ) : (
            // Results State
            <div className="grid lg:grid-cols-4 gap-12 items-start">
              {/* Left Content - Uploaded Image */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-3xl md:text-4xl lg:text-5xl leading-[1.1] tracking-tight">
                  Your Dog's Breed Results
                </h2>
                {/* Breed Identification */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Breed Identification</h3>
                    <div className="space-y-2">
                      <Badge variant="default" className="text-lg px-4 py-2">
                        {predictionResult.breed}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-sm">
                          {predictionResult.confidence}% confident
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Key Traits */}
                  <div>
                    <h4 className="font-semibold mb-2">Key Traits</h4>
                    <div className="flex flex-wrap gap-2">
                      {predictionResult.traits.map((trait, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Care Tips */}
                  <div>
                    <h4 className="font-semibold mb-2">Care Tips</h4>
                    <Card className="border-0 bg-muted/50">
                      <CardContent className="p-4">
                        <ul className="space-y-2">
                          {predictionResult.careTips.map((tip, index) => (
                            <li key={index} className="text-xs text-muted-foreground flex items-start">
                              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Prediction Counter */}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground text-center">
                      {isLoggedIn ? `${remainingPredictions} predictions remaining` :
                        `${remainingPredictions} free prediction${remainingPredictions !== 1 ? 's' : ''} left`}
                    </p>
                  </div>
                </div>

              </div>

              {/* Upload Zone - Smaller */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-1000" />
                    <Card className="relative overflow-hidden shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                      <div className="p-4">
                        <div className="rounded-2xl overflow-hidden">
                          <img
                            src={uploadedImage}
                            alt="Your uploaded dog"
                            className="w-full h-64 lg:h-80 object-cover"
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Floating Elements */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse" />
                    <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-500" />
                  </div>

                  <Button
                    onClick={handleTryAgain}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    Start Over
                  </Button>
                </div>
              </div>

            </div>
          )}
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl">Dog Care Tips</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Essential tips to keep your furry friend healthy, happy, and well-cared for.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Daily Exercise</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Most dogs need 30 minutes to 2 hours of exercise daily. Adjust based on breed and age.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Regular Vet Checkups</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Schedule annual checkups and keep up with vaccinations to prevent health issues.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Proper Nutrition</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Feed high-quality dog food appropriate for your dog's age, size, and activity level.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Socialization</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Expose your dog to different people, animals, and environments to build confidence.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to discover your dog's breed and unlock detailed insights.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 items-center">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-10 w-10 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">1</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Upload Photo</h3>
                <p className="text-muted-foreground">
                  Take a clear photo of your dog or upload an existing one from your device.
                </p>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-10 w-10 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">2</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">AI Analysis</h3>
                <p className="text-muted-foreground">
                  Our advanced AI analyzes facial features, body structure, and coat patterns.
                </p>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-10 w-10 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">3</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Get Results</h3>
                <p className="text-muted-foreground">
                  Receive detailed breed information, traits, care tips, and confidence scores.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl">
              About DogPredict
            </h2>
            <p className="text-xl text-muted-foreground">
              DogPredict is the world's most accurate AI-powered dog breed identification service.
              Our advanced machine learning algorithms have been trained on millions of dog photos
              to provide instant, reliable breed identification and care recommendations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="default" className="text-lg px-8 py-6">
                <Upload className="mr-2 h-5 w-5" />
                Try It Now
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                View FAQ
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Email Subscription Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl">
                Stay Updated with Dog Care Tips
              </h2>
              <p className="text-xl opacity-90">
                Subscribe to our newsletter for the latest dog care tips, breed insights,
                and exclusive content delivered to your inbox.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-primary-foreground text-primary"
              />
              <Button
                onClick={handleEmailSubscribe}
                variant="secondary"
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Subscribe
              </Button>
            </div>

            <p className="text-sm opacity-75">
              Join over 50,000 dog lovers. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Camera className="h-6 w-6 text-primary" />
                <span className="text-xl font-semibold">DogPredict</span>
              </div>
              <p className="text-muted-foreground">
                The world's most accurate AI-powered dog breed identification service.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><a href="#" className="hover:text-foreground transition-colors">About Us</a></p>
                <p><a href="#" className="hover:text-foreground transition-colors">Careers</a></p>
                <p><a href="#" className="hover:text-foreground transition-colors">Press</a></p>
                <p><a href="#" className="hover:text-foreground transition-colors">Blog</a></p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><a href="#" className="hover:text-foreground transition-colors">Help Center</a></p>
                <p><a href="#" className="hover:text-foreground transition-colors">FAQ</a></p>
                <p><a href="#" className="hover:text-foreground transition-colors">Contact</a></p>
                <p><a href="#" className="hover:text-foreground transition-colors">API Docs</a></p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Contact Info</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>123 AI Street, Tech City, TC 12345</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>hello@dogpredict.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Mon-Fri 9AM-6PM PST</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2024 DogPredict Inc. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
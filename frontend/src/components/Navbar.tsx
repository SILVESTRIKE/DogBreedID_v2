import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Camera, Upload, User, LogOut } from "lucide-react";
import { useState, useRef } from "react";

interface NavbarProps {
  isLoggedIn: boolean;
  userPredictions: number;
  onLogin: (email: string, password: string) => void;
  onLogout: () => void;
  onUpload: (file: File) => void;
}

export function Navbar({ isLoggedIn, userPredictions, onLogin, onLogout, onUpload }: NavbarProps) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = () => {
    onLogin(loginEmail, loginPassword);
    setIsLoginOpen(false);
    setLoginEmail("");
    setLoginPassword("");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const canUpload = isLoggedIn || userPredictions < 1;
  const remainingPredictions = isLoggedIn ? 100 - userPredictions : 1 - userPredictions;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Camera className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold">DogPredict</span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Upload Button */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={!canUpload}
              variant={canUpload ? "default" : "secondary"}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            {!isLoggedIn && (
              <span className="text-sm text-muted-foreground">
                {remainingPredictions} free prediction{remainingPredictions !== 1 ? 's' : ''} left
              </span>
            )}
            {isLoggedIn && (
              <span className="text-sm text-muted-foreground">
                {remainingPredictions} predictions left
              </span>
            )}
          </div>

          {/* Authentication */}
          {!isLoggedIn ? (
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <User className="h-4 w-4" />
                  Login
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Login to Your Account</DialogTitle>
                  <DialogDescription>
                    Get 100 free predictions and save your history
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                  </div>
                  <Button onClick={handleLogin} className="w-full">
                    Login
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    Don't have an account? <span className="text-primary cursor-pointer">Sign up</span>
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Welcome back!</span>
              <Button onClick={onLogout} variant="outline" size="sm" className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
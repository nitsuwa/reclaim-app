import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useApp } from '../context/AppContext';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { PLVLogo } from './PLVLogo';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from './ui/alert';
import { auth } from '../firebase'; 
import { sendPasswordResetEmail } from 'firebase/auth'; 

export const ForgotPasswordPage = () => {
  const { setCurrentPage } = useApp();
  const [step, setStep] = useState(1); // Only using 1 (Email) and 4 (Success)
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // All mock state (otp, newPassword, etc.) and mock functions removed.

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!/@plv\.edu\.ph$/.test(email)) {
      setError('Please use your PLV email address');
      return;
    }

    setIsLoading(true);
    
    try {
        // Send password reset email directly through Firebase
        await sendPasswordResetEmail(auth, email);
        
        toast.success(`Password Reset Link sent to ${email}!`);
        
        setStep(4); // Jump directly to the success page (Step 4)
        
    } catch (error: any) {
        let errorMessage = 'Failed to send password reset email. Please try again.';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email address.';
        } else {
            console.error("Firebase Password Reset Error:", error);
        }
        
        toast.error('Password Reset Failed', { description: errorMessage });
        setError(errorMessage);
        
    } finally {
        setIsLoading(false);
    }
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-[#004d99] to-accent flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <Card className="w-full max-w-md shadow-2xl relative z-10 border border-primary/10 bg-white">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-accent rounded-full p-6 shadow-md">
                <CheckCircle2 className="h-16 w-16 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-primary">Password Reset Email Sent!</h2>
              <p className="text-muted-foreground">
                A link to reset your password has been sent to your email.
              </p>
            </div>
            <Button 
              onClick={() => setCurrentPage('login')} 
              className="w-full h-12 bg-accent text-white hover:bg-accent/90 shadow-md"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-[#004d99] to-accent flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <Card className="w-full max-w-md shadow-2xl relative z-10 border border-primary/10 bg-white">
        <CardHeader className="space-y-4 pb-6 border-b-0">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage('login')}
              className="hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <PLVLogo size="sm" />
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-primary">Reset Password</CardTitle>
            <CardDescription>
              Enter your email to receive a password reset link
            </CardDescription>
          </div>

          {/* Progress indicator - Simplified */}
          <div className="flex items-center justify-center gap-2">
            <div className={`h-2 w-10 rounded-full transition-all ${step >= 1 ? 'bg-accent' : 'bg-muted'}`}></div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label htmlFor="email">PLV Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@plv.edu.ph"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                required
                disabled={isLoading}
                className="h-12 border-2 focus:border-accent transition-all"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-accent text-white hover:bg-accent/90 shadow-md transition-all hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Sending Link...' : 'Send Password Reset Link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
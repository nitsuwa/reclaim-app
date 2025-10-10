import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { PLVLogo } from './PLVLogo';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from './ui/alert';

// --- ADDED FIREBASE IMPORTS ---
import { auth } from '../firebase'; 
import { db } from '../firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
// ----------------------------

export const LoginPage = () => {
  const { setCurrentUser, setCurrentPage } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // Removed: [isAdmin, setIsAdmin] state
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLocked) {
      setError('Account is locked due to too many failed attempts. Please reset your password.');
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      let emailToLogin = '';
      let userDetails: any = null;

      // 1. Determine if input is Email or Student ID
      if (/@plv\.edu\.ph$/.test(username)) {
        emailToLogin = username;
      } 
      // 2. If it's a Student ID (XX-XXXX format), query Firestore for email
      else if (/^\d{2}-\d{4}$/.test(username)) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('studentId', '==', username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          userDetails = doc.data();
          emailToLogin = userDetails.email;
        } else {
          throw { code: 'auth/user-not-found' };
        }
      } else {
        // Handle invalid input format
        throw { code: 'auth/invalid-email' };
      }
      
      if (!emailToLogin) {
          throw { code: 'auth/user-not-found' };
      }

      // 3. Authenticate with Firebase Auth using the resolved email
      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailToLogin,
        password
      );

      const user = userCredential.user;

      // 4. Fetch User Data and Role (if not already fetched)
      if (!userDetails) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            userDetails = userDoc.data();
        }
      }
      
      if (userDetails) {
        // Role is read directly from Firestore, no need for isAdmin toggle
        const userRole = userDetails.role || 'finder';
        
        // 5. Set the current user in AppContext
        const appUser = {
            id: user.uid,
            fullName: userDetails.fullName || 'User',
            studentId: userDetails.studentId || '',
            contactNumber: userDetails.contactNumber || '',
            email: user.email!,
            role: userRole as 'finder' | 'claimer' | 'admin'
        }
        setCurrentUser(appUser);
        setCurrentPage(appUser.role === 'admin' ? 'admin' : 'board');
        setLoginAttempts(0); 
        
        toast.success(`Welcome back, ${appUser.fullName}!`); 

      } else {
          setError('User profile data missing. Please contact support.');
          await auth.signOut();
      }

    } catch (error: any) {
      // 6. Handle Errors 
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);
          
          if (newAttempts >= 3) {
            setIsLocked(true);
            errorMessage = 'Account locked due to too many failed attempts. Please reset your password.';
          } else {
            errorMessage = `Invalid email or password. ${3 - newAttempts} attempts remaining.`;
          }
      } else {
          console.error("Firebase Login Error:", error);
      }
      
      setError(errorMessage);
    
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-[#004d99] to-accent flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <Card className="w-full max-w-md shadow-2xl relative z-10 border border-primary/10 bg-white">
        <CardHeader className="space-y-4 pb-6 border-b-0">
          <PLVLogo size="md" />
          <div className="text-center space-y-2">
            <CardTitle className="text-primary">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access the Lost & Found Portal
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label htmlFor="username">Email / Student ID</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your email or student ID (e.g., 23-3314)"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                required
                disabled={isLocked || isLoading}
                className="h-12 border-2 focus:border-accent transition-all"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  required
                  disabled={isLocked || isLoading}
                  className="h-12 pr-10 border-2 focus:border-accent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* REMOVED: Admin checkbox */}

            <Button 
              type="submit" 
              className="w-full h-12 bg-accent text-white hover:bg-accent/90 shadow-md transition-all hover:shadow-lg mt-6"
              disabled={isLocked || isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 space-y-4">
            <div className="text-center">
              <button
                type="button"
                onClick={() => setCurrentPage('forgot-password')}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-sm text-muted-foreground">Don't have an account? </span>
              <button
                type="button"
                onClick={() => setCurrentPage('register')}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Register here
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
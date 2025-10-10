import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Upload, CheckCircle2, Copy } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export const ClaimItemForm = () => {
  const { setCurrentPage, selectedItem, claims, setClaims, currentUser, addActivityLog } = useApp();
  const [step, setStep] = useState(1);
  const [claimCode, setClaimCode] = useState('');
  const [answers, setAnswers] = useState<string[]>(['', '', '']);

  const generateClaimCode = () => {
    return 'CLM-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handleSubmitAnswers = (e: React.FormEvent) => {
    e.preventDefault();
    
    const code = generateClaimCode();
    const newClaim = {
      id: Date.now().toString(),
      itemId: selectedItem?.id || '',
      claimantId: currentUser?.id || '',
      claimCode: code,
      answers: answers.filter(a => a.trim() !== ''),
      status: 'pending' as const,
      submittedAt: new Date().toISOString()
    };

    setClaims([...claims, newClaim]);
    
    // Add activity log
    addActivityLog({
      userId: currentUser?.id || 'unknown',
      userName: currentUser?.fullName || 'Unknown User',
      action: 'claim_submitted',
      itemId: selectedItem?.id,
      itemType: selectedItem?.itemType,
      details: `Submitted claim for ${selectedItem?.itemType} (Code: ${code})`
    });
    
    setClaimCode(code);
    setStep(2);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(claimCode);
  };

  if (!selectedItem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No item selected</p>
            <Button onClick={() => setCurrentPage('board')} className="mt-4">
              Return to Board
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6 space-y-6">
            <div className="flex justify-center">
              <div className="bg-accent rounded-full p-4 shadow-lg">
                <CheckCircle2 className="h-12 w-12 text-accent-foreground" />
              </div>
            </div>
            
            <div className="text-center">
              <h2 className="text-primary">Claim Submitted Successfully!</h2>
              <p className="text-muted-foreground mt-2">
                Your claim code has been generated
              </p>
            </div>

            <div className="bg-accent/10 border-2 border-accent rounded-lg p-6 text-center shadow-inner">
              <p className="text-sm text-muted-foreground mb-2">Your Claim Code</p>
              <div className="flex items-center justify-center gap-2">
                <code className="bg-white px-4 py-3 rounded-lg border-2 border-accent/30 shadow-sm">{claimCode}</code>
                <Button size="sm" variant="outline" onClick={handleCopyCode} className="border-accent/50 hover:bg-accent/10">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Next Steps:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                  <li>Save or screenshot your claim code</li>
                  <li>Bring your Student ID to the Guard Post</li>
                  <li>Present your claim code to the guard</li>
                  <li>The guard will verify your answers and release the item</li>
                </ol>
              </AlertDescription>
            </Alert>

            <Button onClick={() => setCurrentPage('board')} className="w-full">
              Return to Board
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground border-b border-primary/20 shadow-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="secondary" size="sm" onClick={() => setCurrentPage('board')} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Board
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-primary">Claim Item</CardTitle>
            <CardDescription>
              Answer the security questions to verify that this is your item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <h3 className="mb-2">{selectedItem.itemType}</h3>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Location:</span> {selectedItem.location}</p>
                <p><span className="text-muted-foreground">Date Found:</span> {new Date(selectedItem.dateFound).toLocaleDateString()}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitAnswers} className="space-y-6">
              <div className="space-y-4">
                <h4>Security Questions</h4>
                {selectedItem.securityQuestions.map((sq, index) => (
                  <div key={index} className="space-y-2">
                    <Label>{sq.question} *</Label>
                    <Input
                      placeholder="Your answer"
                      value={answers[index] || ''}
                      onChange={(e) => {
                        const newAnswers = [...answers];
                        newAnswers[index] = e.target.value;
                        setAnswers(newAnswers);
                      }}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Proof Photo (Optional)</Label>
                <p className="text-sm text-muted-foreground">
                  Upload a photo showing proof of ownership (receipt, another photo of the item, etc.)
                </p>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                </div>
              </div>

              <Alert>
                <AlertDescription className="text-sm">
                  After submitting, you will receive a claim code. Bring this code and your Student ID to the Guard Post to collect your item.
                </AlertDescription>
              </Alert>

              <Button type="submit" className="w-full">
                Submit Claim
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

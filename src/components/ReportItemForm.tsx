import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Upload, CheckCircle2, CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns@4.1.0';
import { cn } from './ui/utils';

export const ReportItemForm = () => {
  const { setCurrentPage, items, setItems, currentUser, addActivityLog } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    itemType: '',
    location: '',
    dateFound: '',
    timeFound: '',
    photoUrl: '',
    securityQuestion1: '',
    securityAnswer1: '',
    securityQuestion2: '',
    securityAnswer2: '',
    securityQuestion3: '',
    securityAnswer3: ''
  });
  const [selectedDate, setSelectedDate] = useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem = {
      id: Date.now().toString(),
      itemType: formData.itemType,
      location: formData.location,
      dateFound: formData.dateFound,
      timeFound: formData.timeFound,
      photoUrl: formData.photoUrl || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      securityQuestions: [
        { question: formData.securityQuestion1, answer: formData.securityAnswer1 },
        formData.securityQuestion2 && { question: formData.securityQuestion2, answer: formData.securityAnswer2 },
        formData.securityQuestion3 && { question: formData.securityQuestion3, answer: formData.securityAnswer3 }
      ].filter(Boolean) as { question: string; answer: string }[],
      reportedBy: 'current-user',
      status: 'pending' as const,
      reportedAt: new Date().toISOString()
    };

    setItems([...items, newItem]);
    
    // Add activity log
    addActivityLog({
      userId: currentUser?.id || 'unknown',
      userName: currentUser?.fullName || 'Unknown User',
      action: 'item_reported',
      itemId: newItem.id,
      itemType: newItem.itemType,
      details: `Reported found item: ${newItem.itemType} at ${newItem.location}`
    });
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-accent rounded-full p-4 shadow-lg">
                <CheckCircle2 className="h-12 w-12 text-accent-foreground" />
              </div>
            </div>
            <h2>Report Submitted Successfully!</h2>
            <p className="text-muted-foreground">
              Thank you for reporting the found item. Please bring the item to the Guard Post for verification.
            </p>
            <p className="text-sm text-muted-foreground">
              Your report will be reviewed by the admin and will appear on the Lost & Found Board once verified.
            </p>
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
          <Button variant="secondary" size="sm" onClick={() => setCurrentPage('board')} className="bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-lg transition-all">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Board
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-primary">Report Found Item</CardTitle>
            <CardDescription>
              Fill in the details of the item you found. This helps the owner identify and claim their item.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="itemType">Item Type *</Label>
                <Select value={formData.itemType} onValueChange={(value) => setFormData({...formData, itemType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wallet">Wallet</SelectItem>
                    <SelectItem value="Phone">Phone</SelectItem>
                    <SelectItem value="ID Card">ID Card</SelectItem>
                    <SelectItem value="Bag">Bag</SelectItem>
                    <SelectItem value="Keys">Keys</SelectItem>
                    <SelectItem value="Laptop">Laptop</SelectItem>
                    <SelectItem value="Book">Book</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location Found *</Label>
                <Select value={formData.location} onValueChange={(value) => setFormData({...formData, location: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Library - 1st Floor">Library - 1st Floor</SelectItem>
                    <SelectItem value="Library - 2nd Floor">Library - 2nd Floor</SelectItem>
                    <SelectItem value="Cafeteria">Cafeteria</SelectItem>
                    <SelectItem value="Gym">Gym</SelectItem>
                    <SelectItem value="Classroom Building A">Classroom Building A</SelectItem>
                    <SelectItem value="Classroom Building B">Classroom Building B</SelectItem>
                    <SelectItem value="Laboratory">Laboratory</SelectItem>
                    <SelectItem value="Parking Area">Parking Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFound">Date Found *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal h-11',
                          !selectedDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          if (date) {
                            setFormData({...formData, dateFound: format(date, 'yyyy-MM-dd')});
                          }
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeFound">Time Found *</Label>
                  <Input
                    id="timeFound"
                    type="time"
                    value={formData.timeFound}
                    onChange={(e) => setFormData({...formData, timeFound: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Upload Photo (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="mb-4">Security Questions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Set up security questions to help verify the rightful owner. Add at least one question.
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Question 1 *</Label>
                    <Input
                      placeholder="e.g., What color is the item?"
                      value={formData.securityQuestion1}
                      onChange={(e) => setFormData({...formData, securityQuestion1: e.target.value})}
                      required
                    />
                    <Input
                      placeholder="Answer"
                      value={formData.securityAnswer1}
                      onChange={(e) => setFormData({...formData, securityAnswer1: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Question 2 (Optional)</Label>
                    <Input
                      placeholder="e.g., What brand is it?"
                      value={formData.securityQuestion2}
                      onChange={(e) => setFormData({...formData, securityQuestion2: e.target.value})}
                    />
                    <Input
                      placeholder="Answer"
                      value={formData.securityAnswer2}
                      onChange={(e) => setFormData({...formData, securityAnswer2: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Question 3 (Optional)</Label>
                    <Input
                      placeholder="e.g., Any unique marks or features?"
                      value={formData.securityQuestion3}
                      onChange={(e) => setFormData({...formData, securityQuestion3: e.target.value})}
                    />
                    <Input
                      placeholder="Answer"
                      value={formData.securityAnswer3}
                      onChange={(e) => setFormData({...formData, securityAnswer3: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Submit Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

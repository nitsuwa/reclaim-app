import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useApp } from '../context/AppContext';
import { CheckCircle2, XCircle, Clock, Package, FileCheck, AlertCircle, CheckSquare, ScrollText, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner@2.0.3';

export const AdminDashboard = () => {
  const { currentUser, items, setItems, claims, setClaims, activityLogs, addActivityLog } = useApp();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [unblurredPhotos, setUnblurredPhotos] = useState<Set<string>>(new Set());

  const handleVerifyItem = (itemId: string, approve: boolean) => {
    const item = items.find(i => i.id === itemId);
    
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, status: approve ? 'verified' as const : 'pending' as const }
        : item
    ));
    
    // Add activity log
    if (item) {
      addActivityLog({
        userId: currentUser?.id || 'admin',
        userName: currentUser?.fullName || 'Admin',
        action: approve ? 'item_verified' : 'item_rejected',
        itemId: item.id,
        itemType: item.itemType,
        details: approve 
          ? `Verified item report for ${item.itemType}` 
          : `Rejected item report for ${item.itemType}`
      });
    }
    
    toast.success(approve ? 'Item verified and published!' : 'Item report rejected');
    setShowItemDialog(false);
    setSelectedItem(null);
  };

  const handleVerifyClaim = (claimId: string, approve: boolean) => {
    const claim = claims.find(c => c.id === claimId);
    const item = claim ? items.find(i => i.id === claim.itemId) : null;
    
    setClaims(claims.map(claim =>
      claim.id === claimId
        ? { ...claim, status: approve ? 'approved' as const : 'rejected' as const }
        : claim
    ));
    
    if (approve && claim) {
      setItems(items.map(item =>
        item.id === claim.itemId
          ? { ...item, status: 'claimed' as const }
          : item
      ));
    }
    
    // Add activity log
    if (claim && item) {
      addActivityLog({
        userId: currentUser?.id || 'admin',
        userName: currentUser?.fullName || 'Admin',
        action: approve ? 'claim_approved' : 'claim_rejected',
        itemId: item.id,
        itemType: item.itemType,
        details: approve 
          ? `Approved claim for ${item.itemType} (Code: ${claim.claimCode})` 
          : `Rejected claim for ${item.itemType} (Code: ${claim.claimCode})`
      });
    }
    
    toast.success(approve ? 'Claim approved!' : 'Claim rejected');
    setShowClaimDialog(false);
    setSelectedClaim(null);
  };

  const pendingItems = items.filter(item => item.status === 'pending');
  const verifiedItems = items.filter(item => item.status === 'verified');
  const claimedItems = items.filter(item => item.status === 'claimed');
  const pendingClaims = claims.filter(claim => claim.status === 'pending');

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'item_reported': 'Item Reported',
      'item_verified': 'Item Verified',
      'item_rejected': 'Item Rejected',
      'claim_submitted': 'Claim Submitted',
      'claim_approved': 'Claim Approved',
      'claim_rejected': 'Claim Rejected',
      'failed_claim_attempt': 'Failed Claim Attempt',
      'item_status_changed': 'Item Status Changed'
    };
    return labels[action] || action;
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('approved') || action.includes('verified')) return 'default';
    if (action.includes('rejected') || action.includes('failed')) return 'destructive';
    if (action.includes('pending') || action.includes('submitted')) return 'secondary';
    return 'outline';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground border-b border-primary/10 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-primary-foreground">Admin Dashboard</h1>
              <p className="text-sm text-primary-foreground/80">Guard / Admin Panel - {currentUser?.fullName}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-md border border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-6 pt-6 px-6 border-b-0">
              <div className="flex items-center justify-between">
                <CardDescription className="text-base">Pending Reports</CardDescription>
                <Package className="h-5 w-5 text-accent" />
              </div>
              <CardTitle className="text-accent mt-3">{pendingItems.length}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="shadow-md border border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-6 pt-6 px-6 border-b-0">
              <div className="flex items-center justify-between">
                <CardDescription className="text-base">Verified Items</CardDescription>
                <FileCheck className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-primary mt-3">{verifiedItems.length}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="shadow-md border border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-6 pt-6 px-6 border-b-0">
              <div className="flex items-center justify-between">
                <CardDescription className="text-base">Pending Claims</CardDescription>
                <AlertCircle className="h-5 w-5 text-accent" />
              </div>
              <CardTitle className="text-accent mt-3">{pendingClaims.length}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="shadow-md border border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-6 pt-6 px-6 border-b-0">
              <div className="flex items-center justify-between">
                <CardDescription className="text-base">Claimed Items</CardDescription>
                <CheckSquare className="h-5 w-5 text-neutral-accent" />
              </div>
              <CardTitle className="text-neutral-accent mt-3">{claimedItems.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports">Item Reports</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
            <TabsTrigger value="logs">
              <ScrollText className="h-4 w-4 mr-2" />
              Activity Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            <Card className="shadow-sm border border-border">
              <CardHeader>
                <CardTitle>Pending Item Reports</CardTitle>
                <CardDescription>Review and verify found item reports</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending reports</p>
                ) : (
                  <div className="space-y-4">
                    {pendingItems.map(item => (
                      <div key={item.id} className="border border-border rounded-lg p-4 flex items-start gap-4 hover:border-accent transition-colors">
                        <div 
                          className="relative w-24 h-24 cursor-pointer group/photo flex-shrink-0"
                          onClick={() => {
                            setUnblurredPhotos(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(item.id)) {
                                newSet.delete(item.id);
                              } else {
                                newSet.add(item.id);
                              }
                              return newSet;
                            });
                          }}
                        >
                          <img
                            src={item.photoUrl}
                            alt={item.itemType}
                            className={`w-24 h-24 object-cover rounded transition-all ${
                              unblurredPhotos.has(item.id) ? '' : 'blur-md'
                            }`}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded group-hover/photo:bg-black/40 transition-colors">
                            {unblurredPhotos.has(item.id) ? (
                              <EyeOff className="h-6 w-6 text-white group-hover/photo:scale-110 transition-transform" />
                            ) : (
                              <Eye className="h-6 w-6 text-white group-hover/photo:scale-110 transition-transform" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <h4 className="text-primary">{item.itemType}</h4>
                            <p className="text-sm text-muted-foreground">
                              Found at {item.location} on {new Date(item.dateFound).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-accent text-white hover:bg-accent/90"
                              onClick={() => {
                                setSelectedItem(item.id);
                                setShowItemDialog(true);
                              }}
                            >
                              Review
                            </Button>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-secondary text-white">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-border">
              <CardHeader>
                <CardTitle>Verified Items</CardTitle>
                <CardDescription>Items currently on the Lost & Found Board</CardDescription>
              </CardHeader>
              <CardContent>
                {verifiedItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No verified items</p>
                ) : (
                  <div className="space-y-4">
                    {verifiedItems.map(item => (
                      <div key={item.id} className="border border-border rounded-lg p-4 flex items-start gap-4">
                        <div 
                          className="relative w-24 h-24 cursor-pointer group/photo flex-shrink-0"
                          onClick={() => {
                            setUnblurredPhotos(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(item.id)) {
                                newSet.delete(item.id);
                              } else {
                                newSet.add(item.id);
                              }
                              return newSet;
                            });
                          }}
                        >
                          <img
                            src={item.photoUrl}
                            alt={item.itemType}
                            className={`w-24 h-24 object-cover rounded transition-all ${
                              unblurredPhotos.has(item.id) ? '' : 'blur-md'
                            }`}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded group-hover/photo:bg-black/40 transition-colors">
                            {unblurredPhotos.has(item.id) ? (
                              <EyeOff className="h-6 w-6 text-white group-hover/photo:scale-110 transition-transform" />
                            ) : (
                              <Eye className="h-6 w-6 text-white group-hover/photo:scale-110 transition-transform" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-primary">{item.itemType}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.location} - {new Date(item.dateFound).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="default" className="bg-accent text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims" className="space-y-4">
            <Card className="shadow-sm border border-border">
              <CardHeader>
                <CardTitle>Pending Claims</CardTitle>
                <CardDescription>Review and approve claim requests</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingClaims.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending claims</p>
                ) : (
                  <div className="space-y-4">
                    {pendingClaims.map(claim => {
                      const item = items.find(i => i.id === claim.itemId);
                      return (
                        <div key={claim.id} className="border border-border rounded-lg p-4 hover:border-accent transition-colors">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-primary">{item?.itemType || 'Unknown Item'}</h4>
                              <p className="text-sm text-muted-foreground">
                                Claim Code: <code className="bg-muted px-2 py-1 rounded text-primary">{claim.claimCode}</code>
                              </p>
                            </div>
                            <Badge variant="secondary" className="bg-secondary text-white">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          </div>
                          <div className="space-y-2 mb-4">
                            <p className="text-sm">Security Answers:</p>
                            {claim.answers.map((answer, idx) => (
                              <div key={idx} className="text-sm bg-card border border-border p-3 rounded">
                                <span className="text-muted-foreground">Q{idx + 1}:</span> {item?.securityQuestions[idx]?.question}
                                <br />
                                <span className="text-muted-foreground">A:</span> {answer}
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-accent text-white hover:bg-accent/90"
                              onClick={() => {
                                setSelectedClaim(claim.id);
                                setShowClaimDialog(true);
                              }}
                            >
                              Review Claim
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card className="shadow-sm border border-border">
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>Complete history of system activities and actions</CardDescription>
              </CardHeader>
              <CardContent>
                {activityLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No activity logs</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activityLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="text-sm text-neutral-accent">
                              {new Date(log.timestamp).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell className="text-sm">{log.userName}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={getActionBadgeVariant(log.action)}
                                className={
                                  log.action.includes('verified') || log.action.includes('approved') 
                                    ? 'bg-accent text-white' 
                                    : log.action.includes('rejected') || log.action.includes('failed')
                                    ? 'bg-destructive text-white'
                                    : 'bg-secondary text-white'
                                }
                              >
                                {getActionLabel(log.action)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-primary">
                              {log.itemType || '-'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-md">
                              {log.details}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Item Review Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Item Report</DialogTitle>
            <DialogDescription>
              Verify the item details and approve or reject the report
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (() => {
            const item = items.find(i => i.id === selectedItem);
            return item ? (
              <div className="space-y-4">
                <img src={item.photoUrl} alt={item.itemType} className="w-full h-48 object-cover rounded" />
                <div className="space-y-2">
                  <p><strong>Item Type:</strong> {item.itemType}</p>
                  <p><strong>Location:</strong> {item.location}</p>
                  <p><strong>Date & Time:</strong> {new Date(item.dateFound).toLocaleDateString()} at {item.timeFound}</p>
                  <p><strong>Security Questions:</strong></p>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    {item.securityQuestions.map((sq, idx) => (
                      <li key={idx}>{sq.question}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null;
          })()}
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleVerifyItem(selectedItem!, false)}
              className="hover:bg-destructive hover:text-white"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button 
              onClick={() => handleVerifyItem(selectedItem!, true)}
              className="bg-accent text-white hover:bg-accent/90"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Claim Review Dialog */}
      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Claim Request</DialogTitle>
            <DialogDescription>
              Verify the claimant's answers and approve or reject the claim
            </DialogDescription>
          </DialogHeader>
          {selectedClaim && (() => {
            const claim = claims.find(c => c.id === selectedClaim);
            const item = claim ? items.find(i => i.id === claim.itemId) : null;
            return claim && item ? (
              <div className="space-y-4">
                <Alert className="bg-accent/10 border-accent/30">
                  <AlertDescription>
                    <strong>Claim Code:</strong> {claim.claimCode}
                  </AlertDescription>
                </Alert>
                <div>
                  <p><strong>Item:</strong> {item.itemType}</p>
                  <p className="text-sm text-muted-foreground">{item.location}</p>
                </div>
                <div className="space-y-2">
                  <p><strong>Security Questions & Answers:</strong></p>
                  {claim.answers.map((answer, idx) => (
                    <div key={idx} className="bg-card border border-border p-3 rounded space-y-1">
                      <p className="text-sm">{item.securityQuestions[idx]?.question}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Claimant's Answer:</span>
                          <p className="text-primary">{answer}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Correct Answer:</span>
                          <p className="text-accent">{item.securityQuestions[idx]?.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })()}\
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleVerifyClaim(selectedClaim!, false)}
              className="hover:bg-destructive hover:text-white"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Claim
            </Button>
            <Button 
              onClick={() => handleVerifyClaim(selectedClaim!, true)}
              className="bg-accent text-white hover:bg-accent/90"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve & Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

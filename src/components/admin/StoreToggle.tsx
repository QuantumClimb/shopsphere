import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Store, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { fetchJson } from '@/lib/apiConfig';

interface StoreStatus {
  id: number;
  isOpen: boolean;
  closedMessage: string | null;
  reopenTime: string | null;
  updatedAt: string;
  updatedBy: string | null;
}

interface StoreToggleProps {
  onClose: () => void;
}

export default function StoreToggle({ onClose }: StoreToggleProps) {
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form fields
  const [isOpen, setIsOpen] = useState(true);
  const [closedMessage, setClosedMessage] = useState('');
  const [reopenTime, setReopenTime] = useState('');

  useEffect(() => {
    fetchStoreStatus();
  }, []);

  const fetchStoreStatus = async () => {
    try {
      setLoading(true);
      const data = await fetchJson<StoreStatus>('store-status');
      setStoreStatus(data);
      setIsOpen(data.isOpen);
      setClosedMessage(data.closedMessage || '');
      setReopenTime(data.reopenTime ? new Date(data.reopenTime).toISOString().slice(0, 16) : '');
      setError('');
    } catch (err) {
      setError('Failed to load store status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      const updatedStatus = await fetchJson<StoreStatus>('admin/store-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isOpen,
          closedMessage: closedMessage.trim() || null,
          reopenTime: reopenTime || null,
          updatedBy: 'admin'
        }),
      });
      setStoreStatus(updatedStatus);
      setSuccess(`Store status updated: ${isOpen ? 'OPEN' : 'CLOSED'}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update store status');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading store status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Store Status Management</h1>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-500/10 border-green-500/50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">{success}</AlertDescription>
        </Alert>
      )}

      {/* Current Status Display */}
      {storeStatus && (
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Current Store Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-foreground/70">Store is currently</p>
                <p className="text-2xl font-bold">
                  {storeStatus.isOpen ? (
                    <span className="text-green-500">OPEN</span>
                  ) : (
                    <span className="text-red-500">CLOSED</span>
                  )}
                </p>
              </div>
              <Badge variant={storeStatus.isOpen ? "default" : "destructive"} className="text-lg px-4 py-2">
                {storeStatus.isOpen ? "Open for Orders" : "Closed"}
              </Badge>
            </div>
            
            {!storeStatus.isOpen && storeStatus.closedMessage && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-foreground/70 mb-1">Closed Message:</p>
                <p className="text-foreground">{storeStatus.closedMessage}</p>
              </div>
            )}
            
            {!storeStatus.isOpen && storeStatus.reopenTime && (
              <div className="p-4 bg-muted/30 rounded-lg flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-foreground/70">Expected to reopen:</p>
                  <p className="text-foreground font-medium">
                    {new Date(storeStatus.reopenTime).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
              </div>
            )}
            
            <div className="text-xs text-foreground/50 pt-2 border-t">
              Last updated: {new Date(storeStatus.updatedAt).toLocaleString()} 
              {storeStatus.updatedBy && ` by ${storeStatus.updatedBy}`}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Store Status Control */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
        <CardHeader>
          <CardTitle>Update Store Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Open/Closed Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="store-toggle" className="text-base font-semibold">
                Store Status
              </Label>
              <p className="text-sm text-foreground/70">
                {isOpen ? 'Store is open for orders' : 'Store is closed - customers cannot place orders'}
              </p>
            </div>
            <Switch
              id="store-toggle"
              checked={isOpen}
              onCheckedChange={setIsOpen}
              className="scale-125"
            />
          </div>

          {/* Closed Message - Only show when store is closed */}
          {!isOpen && (
            <>
              <div className="space-y-2">
                <Label htmlFor="closed-message">
                  Closed Message (Optional)
                </Label>
                <Textarea
                  id="closed-message"
                  placeholder="e.g., We're temporarily closed for a private event. We'll be back soon!"
                  value={closedMessage}
                  onChange={(e) => setClosedMessage(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="resize-none"
                />
                <p className="text-xs text-foreground/50">
                  This message will be displayed to customers when the store is closed. {closedMessage.length}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reopen-time">
                  Expected Reopen Time (Optional)
                </Label>
                <Input
                  id="reopen-time"
                  type="datetime-local"
                  value={reopenTime}
                  onChange={(e) => setReopenTime(e.target.value)}
                />
                <p className="text-xs text-foreground/50">
                  Let customers know when you expect to reopen
                </p>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(storeStatus?.isOpen ?? true);
                setClosedMessage(storeStatus?.closedMessage || '');
                setReopenTime(storeStatus?.reopenTime ? new Date(storeStatus.reopenTime).toISOString().slice(0, 16) : '');
                setError('');
                setSuccess('');
              }}
              disabled={saving}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">Important Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-foreground/70">
          <p>• When the store is closed, customers will see a notice on the menu page</p>
          <p>• "Add to Cart" buttons will be disabled while closed</p>
          <p>• The checkout process will be blocked until the store is reopened</p>
          <p>• This only affects new orders - existing orders can still be managed</p>
          <p>• The website remains accessible; only ordering is disabled</p>
        </CardContent>
      </Card>
    </div>
  );
}

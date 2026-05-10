import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, RefreshCw, ExternalLink, Phone, Mail, MapPin } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { fetchJson } from '@/lib/apiConfig';

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: any;
  orderItems: any[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  confirmedAt: string | null;
}

interface OrderManagementProps {
  onClose: () => void;
}

export default function OrderManagement({ onClose }: OrderManagementProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);
      
      const data = await fetchJson<Order[]>('orders');
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const getWhatsAppLink = async (orderId: number) => {
    try {
      const data = await fetchJson<{ whatsappLink: string }>(`orders/${orderId}/whatsapp-link`);
      window.open(data.whatsappLink, '_blank');
    } catch (err) {
      console.error('Failed to get WhatsApp link:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      PENDING: { variant: 'secondary', label: 'Pending' },
      CONFIRMED: { variant: 'default', label: 'Confirmed' },
      PREPARING: { variant: 'default', label: 'Preparing' },
      READY: { variant: 'default', label: 'Ready' },
      IN_TRANSIT: { variant: 'default', label: 'In Transit' },
      DELIVERED: { variant: 'default', label: 'Delivered' },
      CANCELLED: { variant: 'destructive', label: 'Cancelled' },
    };
    
    const config = variants[status] || variants.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      PENDING: { variant: 'secondary', label: '⏳ Pending' },
      SUCCEEDED: { variant: 'default', label: '✅ Paid' },
      FAILED: { variant: 'destructive', label: '❌ Failed' },
    };
    
    const config = variants[status] || variants.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatAddress = (address: any) => {
    if (typeof address === 'string') return address;
    return `${address.street}, ${address.city}, ${address.postalCode}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Orders Management</h1>
        </div>
        <Button 
          onClick={() => fetchOrders(true)} 
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No orders yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Order #{order.orderNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(order.status)}
                    {getPaymentBadge(order.paymentStatus)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg mb-3">Customer Details</h3>
                    
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-[24px]">👤</span>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <a 
                          href={`tel:${order.customerPhone}`}
                          className="text-primary hover:underline"
                        >
                          {order.customerPhone}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <a 
                          href={`mailto:${order.customerEmail}`}
                          className="text-primary hover:underline break-all"
                        >
                          {order.customerEmail}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm">{formatAddress(order.deliveryAddress)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg mb-3">Order Items</h3>
                    
                    <div className="space-y-2">
                      {order.orderItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm border-b pb-2">
                          <div>
                            <span className="font-medium">{item.quantity}x {item.name}</span>
                            {item.spiceLevel !== undefined && (
                              <span className="text-muted-foreground ml-2">
                                ({item.spiceLevel}% spice)
                              </span>
                            )}
                          </div>
                          <span className="font-medium">₹{((item.totalPrice || item.price * item.quantity || 0) / 100).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-2 space-y-1 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>₹{((order.subtotal || 0) / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Delivery:</span>
                        <span>₹{((order.deliveryFee || 0) / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-1">
                        <span>Total:</span>
                        <span className="text-primary">₹{((order.total || 0) / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6 pt-4 border-t">
                  <Button 
                    onClick={() => getWhatsAppLink(order.id)}
                    variant="default"
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Send WhatsApp Notification
                  </Button>
                  
                  {order.confirmedAt && (
                    <Badge variant="outline" className="ml-auto">
                      Confirmed: {formatDate(order.confirmedAt)}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

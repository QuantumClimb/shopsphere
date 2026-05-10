import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import MenuManagement from "@/components/MenuManagement";
import OrderManagement from "@/components/admin/OrderManagement";
import CategoryManagement from "@/components/admin/CategoryManagement";
import InventoryManagement from "@/components/admin/InventoryManagement";
import StoreToggle from "@/components/admin/StoreToggle";
import { useNavigate, useLocation } from "react-router-dom";

const ADMIN_USER = "ShopSphereAdmin";
const ADMIN_PASS = "shopsphere2026";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export default function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get active view from URL hash
  const getActiveViewFromUrl = (): "dashboard" | "menu-management" | "orders" | "categories" | "store-status" | "inventory" => {
    const hash = location.hash.replace('#', '');
    if (hash === 'menu-management') return 'menu-management';
    if (hash === 'orders') return 'orders';
    if (hash === 'categories') return 'categories';
    if (hash === 'store-status') return 'store-status';
    if (hash === 'inventory') return 'inventory';
    return 'dashboard';
  };
  
  const [activeView, setActiveView] = useState<"dashboard" | "menu-management" | "orders" | "categories" | "store-status" | "inventory">(getActiveViewFromUrl());

  // Check if session is still valid
  const isSessionValid = (): boolean => {
    const loginTime = localStorage.getItem("shopsphere-admin-login-time");
    if (!loginTime) return false;
    
    const elapsed = Date.now() - parseInt(loginTime);
    return elapsed < SESSION_TIMEOUT;
  };

  const handleLogin = () => {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setLoggedIn(true);
      setError("");
      // Store login time instead of just boolean
      localStorage.setItem("shopsphere-admin-login-time", Date.now().toString());
    } else {
      setError("Invalid credentials");
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUsername("");
    setPassword("");
    setActiveViewWithUrl("dashboard");
    // Clear session data
    localStorage.removeItem("shopsphere-admin-login-time");
  };

  const setActiveViewWithUrl = (view: "dashboard" | "menu-management" | "orders" | "categories" | "store-status" | "inventory") => {
    setActiveView(view);
    // Update URL hash to persist view state
    if (view === "menu-management") {
      navigate('/admin#menu-management');
    } else if (view === "orders") {
      navigate('/admin#orders');
    } else if (view === "categories") {
      navigate('/admin#categories');
    } else if (view === "store-status") {
      navigate('/admin#store-status');
    } else if (view === "inventory") {
      navigate('/admin#inventory');
    } else {
      navigate('/admin');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  // Check session validity on component mount and URL changes
  useEffect(() => {
    if (isSessionValid()) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
      localStorage.removeItem("shopsphere-admin-login-time");
    }
  }, []);

  // Update active view when URL hash changes
  useEffect(() => {
    setActiveView(getActiveViewFromUrl());
  }, [location.hash]);

  // Auto-logout on session timeout
  useEffect(() => {
    if (loggedIn) {
      const interval = setInterval(() => {
        if (!isSessionValid()) {
          handleLogout();
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [loggedIn]);

  if (loggedIn) {
    if (activeView === "menu-management") {
      return (
  <div className="min-h-screen pt-16 bg-primary/5">
          <div className="container mx-auto px-4 py-8">
            <MenuManagement onClose={() => setActiveViewWithUrl("dashboard")} />
          </div>
        </div>
      );
    }

    if (activeView === "orders") {
      return (
  <div className="min-h-screen pt-16 bg-primary/5">
          <div className="container mx-auto px-4 py-8">
            <OrderManagement onClose={() => setActiveViewWithUrl("dashboard")} />
          </div>
        </div>
      );
    }

    if (activeView === "categories") {
      return (
  <div className="min-h-screen pt-16 bg-primary/5">
          <div className="container mx-auto px-4 py-8">
            <CategoryManagement onClose={() => setActiveViewWithUrl("dashboard")} />
          </div>
        </div>
      );
    }

    if (activeView === "inventory") {
      return (
        <div className="min-h-screen pt-16 bg-primary/5">
          <div className="container mx-auto px-4 py-8">
            <InventoryManagement onClose={() => setActiveViewWithUrl("dashboard")} />
          </div>
        </div>
      );
    }

    if (activeView === "store-status") {
      return (
  <div className="min-h-screen pt-16 bg-primary/5">
          <div className="container mx-auto px-4 py-8">
            <StoreToggle onClose={() => setActiveViewWithUrl("dashboard")} />
          </div>
        </div>
      );
    }

    return (
  <div className="min-h-screen pt-16 bg-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-foreground/70 mt-2">Welcome, {ADMIN_USER}!</p>
              </div>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Menu Management Card */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
                <CardHeader>
                  <CardTitle className="text-primary">Menu Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/70">
                    Manage menu items, prices, and descriptions.
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => setActiveViewWithUrl("menu-management")}
                  >
                    Manage Menu Items
                  </Button>
                </CardContent>
              </Card>

              {/* Category Management Card */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
                <CardHeader>
                  <CardTitle className="text-primary">Category Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/70">
                    Create and manage menu categories.
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => setActiveViewWithUrl("categories")}
                  >
                    Manage Categories
                  </Button>
                </CardContent>
              </Card>

              {/* Inventory Management Card */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
                <CardHeader>
                  <CardTitle className="text-primary">Inventory Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/70">
                    Manage perfume products, stock, and metadata.
                  </p>
                  <Button 
                    className="w-full bg-accent hover:bg-accent/90"
                    onClick={() => setActiveViewWithUrl("inventory")}
                  >
                    Manage Inventory
                  </Button>
                </CardContent>
              </Card>

              {/* Image Upload Card */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
                <CardHeader>
                  <CardTitle className="text-secondary">Image Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/70">
                    Upload and manage fragrance product images (integrated in Inventory Management).
                  </p>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveView("menu-management")}
                  >
                    Manage Images
                  </Button>
                </CardContent>
              </Card>

              {/* Settings Card */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
                <CardHeader>
                  <CardTitle className="text-accent">Store Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/70">
                    Open or close the store for orders temporarily.
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => setActiveViewWithUrl("store-status")}
                  >
                    Manage Store Status
                  </Button>
                </CardContent>
              </Card>

              {/* Settings Card */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
                <CardHeader>
                  <CardTitle className="text-accent">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/70">
                    Configure store settings and preferences.
                  </p>
                  <Badge variant="secondary">Coming Soon</Badge>
                  <Button disabled className="w-full">
                    Manage Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Analytics Card */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
                <CardHeader>
                  <CardTitle className="text-primary">Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/70">
                    View order statistics and customer insights.
                  </p>
                  <Badge variant="secondary">Coming Soon</Badge>
                  <Button disabled className="w-full">
                    View Analytics
                  </Button>
                </CardContent>
              </Card>

              {/* Orders Card */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
                <CardHeader>
                  <CardTitle className="text-secondary">Orders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/70">
                    View and manage incoming orders in real-time.
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => setActiveViewWithUrl("orders")}
                  >
                    View Orders
                  </Button>
                </CardContent>
              </Card>

              {/* Customer Management Card */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
                <CardHeader>
                  <CardTitle className="text-accent">Customers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/70">
                    View and manage customer information.
                  </p>
                  <Badge variant="secondary">Coming Soon</Badge>
                  <Button disabled className="w-full">
                    View Customers
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <Card className="mt-8 bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
              <CardHeader>
                <CardTitle>Quick Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">--</div>
                    <div className="text-sm text-foreground/70">Total Orders</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/10 rounded-lg">
                    <div className="text-2xl font-bold text-secondary">--</div>
                    <div className="text-sm text-foreground/70">Menu Items</div>
                  </div>
                  <div className="text-center p-4 bg-accent/10 rounded-lg">
                    <div className="text-2xl font-bold text-accent">--</div>
                    <div className="text-sm text-foreground/70">Customers</div>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">₹--</div>
                    <div className="text-sm text-foreground/70">Revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen pt-16 bg-primary/5 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Admin Login</CardTitle>
            <p className="text-foreground/70">Access the admin dashboard</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
            <div className="text-center text-sm text-foreground/60">
              <p>Demo credentials:</p>
              <p>Username: ShopSphereAdmin</p>
              <p>Password: shopsphere2026</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

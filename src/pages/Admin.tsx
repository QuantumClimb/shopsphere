import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import InventoryManagement from "@/components/admin/InventoryManagement";
import CategoryManagement from "@/components/admin/CategoryManagement";
import { useNavigate, useLocation } from "react-router-dom";

const ADMIN_USER = "ShopSphereAdmin";
const ADMIN_PASS = "shopsphere2026";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export default function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  const getActiveViewFromUrl = (): "dashboard" | "inventory" | "categories" => {
    const hash = location.hash.replace('#', '');
    if (hash === 'inventory') return 'inventory';
    if (hash === 'categories') return 'categories';
    return 'dashboard';
  };
  
  const [activeView, setActiveView] = useState<"dashboard" | "inventory" | "categories">(getActiveViewFromUrl());

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
    localStorage.removeItem("shopsphere-admin-login-time");
  };

  const setActiveViewWithUrl = (view: "dashboard" | "inventory" | "categories") => {
    setActiveView(view);
    if (view === "inventory") {
      navigate('/admin#inventory');
    } else if (view === "categories") {
      navigate('/admin#categories');
    } else {
      navigate('/admin');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  useEffect(() => {
    if (isSessionValid()) setLoggedIn(true);
    else {
      setLoggedIn(false);
      localStorage.removeItem("shopsphere-admin-login-time");
    }
  }, []);

  useEffect(() => {
    setActiveView(getActiveViewFromUrl());
  }, [location.hash]);

  if (loggedIn) {
    if (activeView === "inventory") {
      return (
        <div className="min-h-screen pt-16 bg-primary/5">
          <div className="container mx-auto px-4 py-8">
            <InventoryManagement onClose={() => setActiveViewWithUrl("dashboard")} />
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

    return (
      <div className="min-h-screen pt-16 bg-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-foreground/70 mt-2">Welcome, {ADMIN_USER}!</p>
              </div>
              <Button onClick={handleLogout} variant="outline">Logout</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
                <CardHeader>
                  <CardTitle className="text-primary">Inventory Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/70">
                    Manage perfumes, stock, prices and descriptions.
                  </p>
                  <Button className="w-full" onClick={() => setActiveViewWithUrl("inventory")}>
                    Manage Fragrances
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
                <CardHeader>
                  <CardTitle className="text-primary">Category Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/70">
                    Manage categories (Men's, Women's, etc.)
                  </p>
                  <Button className="w-full" onClick={() => setActiveViewWithUrl("categories")}>
                    Manage Categories
                  </Button>
                </CardContent>
              </Card>
            </div>
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
              <label htmlFor="username" className="text-sm font-medium">Username</label>
              <Input
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
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
            <Button onClick={handleLogin} className="w-full">Login</Button>
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

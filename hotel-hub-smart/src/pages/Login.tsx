import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Hotel, Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await login(email, password);
      toast.success("Login successful!");
      navigate("/dashboard"); // All users go to dashboard, which will handle role-specific content
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-primary rounded-2xl shadow-glow">
              <LogIn className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to manage your hotel operations</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
              <Input
                id="password"
                  type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>


            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm">Remember me</Label>
              </div>
              <Link to="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-primary" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Create an account here
              </Link>
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-gray-700">Demo Credentials:</p>
              <div className="text-xs space-y-1 bg-gray-50 p-3 rounded-lg">
                <div><strong>Admin:</strong> admin@smarthotel.com / Admin123!</div>
                <div><strong>Manager:</strong> manager@smarthotel.com / Manager123!</div>
                <div><strong>Receptionist:</strong> receptionist@smarthotel.com / Reception123!</div>
                <div><strong>Housekeeping:</strong> housekeeping@smarthotel.com / Housekeeping123!</div>
                <div><strong>Guest:</strong> guest@smarthotel.com / Guest123!</div>
              </div>
              <div className="text-xs text-center text-gray-500 mt-2">
                Note: Staff login is for hotel operations only. Guests should use the guest portal.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

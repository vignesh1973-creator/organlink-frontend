import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Building2 } from "lucide-react";
import { useOrganizationAuth } from "@/contexts/OrganizationAuthContext";

export default function OrganizationLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, user, isLoading } = useOrganizationAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/organization/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await login(email, password);

    if (result.success) {
      navigate("/organization/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-4 py-3">
        <a
          href="/"
          className="inline-flex items-center text-medical-700 text-sm hover:underline"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to Home
        </a>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left side - Login Form */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-medical-600 p-3 rounded-2xl">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Organization Login
              </h2>
              <p className="text-sm text-gray-600">
                Access OrganLink organization portal
              </p>
            </div>

            <Card className="shadow-lg border-0">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="organization@example.com"
                      required
                      className="mt-1 h-12"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password *
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="h-12 pr-10"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-medical-600 hover:bg-medical-700 text-white"
                    disabled={isLoading || !email || !password}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right side - Image and Content */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 relative">
          <div className="flex flex-col justify-center px-12 py-12 text-white relative z-10">
            <div className="mb-8">
              <img
                src="https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg"
                alt="Medical Conference"
                className="w-80 h-80 object-cover rounded-2xl mx-auto mb-8"
              />
            </div>

            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">
                Organization Governance Portal
              </h1>
              <p className="text-lg text-green-100 leading-relaxed max-w-md mx-auto">
                Collaborate on medical policies, participate in governance decisions, and help shape the future of organ donation protocols.
              </p>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-20 left-10 w-16 h-16 bg-emerald-400/20 rounded-full"></div>
          <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-white/5 rounded-full"></div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 lg:bg-transparent py-4 text-center border-t lg:border-t-0">
        <p className="text-xs text-gray-500">
          © 2025 OrganLink. All rights reserved.
        </p>
      </div>
    </div>
  );
}

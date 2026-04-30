"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (loginError) {
        if (loginError.message.includes("Invalid login")) {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(loginError.message);
        }
      } else if (data.user) {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-indigo-600 p-12 flex-col justify-between">
        <div>
          <span className="text-3xl font-bold text-white">GradX</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white mb-6">
            Welcome Back to Your Study Abroad Journey
          </h1>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-white">
              <CheckCircle className="w-6 h-6" />
              <span>Continue where you left off</span>
            </li>
            <li className="flex items-center gap-3 text-white">
              <CheckCircle className="w-6 h-6" />
              <span>Track your application progress</span>
            </li>
            <li className="flex items-center gap-3 text-white">
              <CheckCircle className="w-6 h-6" />
              <span>Get personalized university recommendations</span>
            </li>
          </ul>
        </div>
        <p className="text-purple-200">© 2026 GradX. Powered by AI.</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Login to GradX</CardTitle>
            <p className="text-gray-600 text-sm">
              Welcome back! Please login to continue.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-purple-600" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Logging in...
                  </span>
                ) : (
                  "Login to GradX"
                )}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-purple-600 hover:underline font-medium">
                  Sign up free
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              GradX
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() =>
                document.getElementById("features")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() =>
                document.getElementById("how-it-works")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() =>
                document.getElementById("loan")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Loan
            </button>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-purple-600 transition-colors font-medium"
            >
              Login
            </Link>
            <Link href="/signup">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Get Started
              </Button>
            </Link>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 mt-8">
                <button
                  onClick={() => {
                    document.getElementById("features")?.scrollIntoView({
                      behavior: "smooth",
                    });
                    setOpen(false);
                  }}
                  className="text-left text-gray-600 py-2"
                >
                  Features
                </button>
                <button
                  onClick={() => {
                    document.getElementById("how-it-works")?.scrollIntoView({
                      behavior: "smooth",
                    });
                    setOpen(false);
                  }}
                  className="text-left text-gray-600 py-2"
                >
                  How It Works
                </button>
                <button
                  onClick={() => {
                    document.getElementById("loan")?.scrollIntoView({
                      behavior: "smooth",
                    });
                    setOpen(false);
                  }}
                  className="text-left text-gray-600 py-2"
                >
                  Loan
                </button>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-gray-600 py-2"
                >
                  Login
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-purple-600">Get Started</Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
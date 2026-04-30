"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  DollarSign, Home, Building, Building2, TrendingDown, Lightbulb, 
  AlertCircle, ArrowRight, CheckCircle, Info, Sparkles, Calculator
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { earnBadge } from "@/lib/gamification";

const citiesByCountry: Record<string, { city: string; country: string }[]> = {
  USA: [
    { city: "Boston", country: "USA" },
    { city: "New York", country: "USA" },
    { city: "San Francisco", country: "USA" },
    { city: "Los Angeles", country: "USA" },
    { city: "Chicago", country: "USA" },
  ],
  Canada: [
    { city: "Toronto", country: "Canada" },
    { city: "Vancouver", country: "Canada" },
  ],
  UK: [
    { city: "London", country: "UK" },
    { city: "Manchester", country: "UK" },
  ],
  Germany: [
    { city: "Berlin", country: "Germany" },
    { city: "Munich", country: "Germany" },
  ],
  Australia: [
    { city: "Sydney", country: "Australia" },
    { city: "Melbourne", country: "Australia" },
  ],
  Singapore: [
    { city: "Singapore", country: "Singapore" },
  ],
  Ireland: [
    { city: "Dublin", country: "Ireland" },
  ],
  Netherlands: [
    { city: "Amsterdam", country: "Netherlands" },
  ],
};

const accommodationTypes = [
  { id: "shared", label: "Shared Apartment", icon: Home, emoji: "🏠" },
  { id: "dorm", label: "University Dorm", icon: Building, emoji: "🏫" },
  { id: "studio", label: "Private Studio", icon: Building2, emoji: "🏡" },
];

const expenseColors: Record<string, string> = {
  rent: "bg-purple-500",
  food: "bg-emerald-500",
  transport: "bg-blue-500",
  utilities: "bg-amber-500",
  phone: "bg-pink-500",
  healthInsurance: "bg-red-500",
  books: "bg-indigo-500",
  entertainment: "bg-orange-500",
  clothing: "bg-cyan-500",
  miscellaneous: "bg-gray-500",
};

export default function CostOfLivingPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [compareResults, setCompareResults] = useState<any>(null);
  
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [accommodationType, setAccommodationType] = useState("shared");
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [showCompare, setShowCompare] = useState(false);
  const [compareCity, setCompareCity] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
        
        if (data?.target_country) {
          const cityList = citiesByCountry[data.target_country];
          if (cityList && cityList.length > 0) {
            setCountry(data.target_country);
            setCity(cityList[0].city);
          }
        }
      }
    };
    fetchData();
  }, []);

  const handleCalculate = async (compareMode = false) => {
    const targetCity = compareMode ? compareCity : city;
    const targetCountry = compareMode 
      ? Object.entries(citiesByCountry).find(([_, cities]) => cities.some(c => c.city === compareCity))?.[0] || country
      : country;
    
    if (!targetCity || !targetCountry) {
      toast.error("Please select a city");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/cost-of-living", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: targetCity, country: targetCountry, accommodationType }),
      });
      const data = await res.json();
      
      if (compareMode) {
        setCompareResults(data);
      } else {
        setResults(data);
        const costInLakhs = Math.round(data.totalAnnualINR / 100000);
        localStorage.setItem('gradx_living_cost_calculated', costInLakhs.toString());
        earnBadge('cost_explorer');
      }
    } catch (error) {
      toast.error("Failed to calculate costs");
    } finally {
      setLoading(false);
    }
  };

  const handleRoiClick = () => {
    if (results) {
      const costInLakhs = Math.round(results.totalAnnualINR / 100000);
      localStorage.setItem('gradx_living_cost_calculated', costInLakhs.toString());
      window.location.href = '/roi-calculator';
    }
  };

  const formatInr = (amount: number) => {
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  const formatUsd = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cost of Living Explorer</h1>
        <p className="text-gray-500">Know exactly how much you need before you go</p>
      </div>

      {/* Input Section */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">City</label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  const entry = Object.entries(citiesByCountry).find(([_, cities]) => 
                    cities.some(c => c.city === e.target.value)
                  );
                  if (entry) setCountry(entry[0]);
                }}
                className="px-3 py-2 border rounded-md min-w-[180px]"
              >
                <option value="">Select city...</option>
                {Object.entries(citiesByCountry).flatMap(([country, cities]) =>
                  cities.map((c) => (
                    <option key={`${country}-${c.city}`} value={c.city}>
                      {c.city}, {country}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Country</label>
              <input
                value={country}
                disabled
                className="px-3 py-2 border rounded-md bg-gray-50 min-w-[120px]"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Accommodation</label>
              <div className="flex gap-1">
                {accommodationTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setAccommodationType(type.id)}
                      className={`px-3 py-2 border rounded-md flex items-center gap-1 ${
                        accommodationType === type.id 
                          ? "bg-purple-100 border-purple-500" 
                          : "bg-gray-50"
                      }`}
                    >
                      <span>{type.emoji}</span>
                      <span className="text-sm">{type.label.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <Button 
              onClick={() => handleCalculate()} 
              disabled={loading || !city}
              className="bg-purple-600"
            >
              {loading ? "Calculating..." : "Calculate Costs"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Calculating your monthly budget for {city}...</p>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="space-y-6 animate-fadeIn">
          {/* Hero Numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="pt-4">
                <p className="text-sm text-gray-500">Monthly Cost</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatInr(results.totalMonthlyINR)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="pt-4">
                <p className="text-sm text-gray-500">Annual Cost</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatInr(results.totalAnnualINR)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-white">
              <CardContent className="pt-4">
                <p className="text-sm text-gray-500">With Part-Time Work</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatInr((results.totalMonthlyUSD - (results.partTimeWorkOffset?.monthlyEarningUSD || 0)) * 12 * 83)}
                </p>
                <p className="text-xs text-green-600">net/year</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="pt-4">
                <p className="text-sm text-gray-500">vs India</p>
                <p className="text-2xl font-bold text-amber-600">
                  {results.comparedToIndia?.percentageHigher || 0}%
                </p>
                <p className="text-xs text-gray-500">
                  more than {results.comparedToIndia?.equivalentIndianCity}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Budget Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Your Monthly Budget Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {results.monthly && Object.entries(results.monthly).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="w-24 text-sm text-gray-600 capitalize">{key}</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${expenseColors[key]} rounded-full`}
                          style={{ width: `${((value as number) / results.totalMonthlyUSD) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm w-20 text-right">{formatUsd(value as number)}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 pt-2 border-t">
                    <span className="w-24 text-sm font-semibold">Total</span>
                    <div className="flex-1 h-2 bg-purple-500 rounded-full" />
                    <span className="text-sm font-semibold w-20 text-right">
                      {formatUsd(results.totalMonthlyUSD)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Part-Time Work */}
          <Card className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-4">
                If you work {hoursPerWeek} hours/week at $15/hour:
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-teal-100">Monthly earning</p>
                  <p className="text-2xl font-bold">${(hoursPerWeek * 15 * 4).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-teal-100">Your net monthly cost</p>
                  <p className="text-2xl font-bold">
                    {formatUsd(results.totalMonthlyUSD - hoursPerWeek * 15 * 4)}
                  </p>
                </div>
                <div>
                  <p className="text-teal-100">Annual savings</p>
                  <p className="text-2xl font-bold">
                    {formatUsd(hoursPerWeek * 15 * 4 * 12)}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <input
                  type="range"
                  min="10"
                  max="20"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-teal-100">
                  <span>10 hrs</span>
                  <span>Current: {hoursPerWeek} hrs/week</span>
                  <span>20 hrs</span>
                </div>
              </div>
              <p className="text-sm text-teal-100 mt-3">
                Part-time work requires proper visa authorization. Check your visa conditions.
              </p>
            </CardContent>
          </Card>

          {/* First Month */}
          <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">First Month Will Cost More</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-amber-100">Security deposit</p>
                  <p className="text-xl font-bold">${results.monthly?.rent * 2}</p>
                </div>
                <div>
                  <p className="text-amber-100">Setup costs</p>
                  <p className="text-xl font-bold">~$500</p>
                </div>
                <div>
                  <p className="text-amber-100">First month total</p>
                  <p className="text-xl font-bold">${results.firstMonthExtra}</p>
                </div>
              </div>
              <p className="text-amber-100 mb-4">
                Plan to have at least ${results.firstMonthExtra} available before you land.
              </p>
              <Link href="/loan">
                <Button className="bg-white text-amber-600 hover:bg-amber-50">
                  Add This to My Loan
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Saving Tips */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-purple-600 shrink-0" />
                <div>
                  <h3 className="font-semibold text-purple-700">Shikha's Tips for {results.city}</h3>
                  <ul className="mt-2 space-y-2">
                    {results.savingTips?.map((tip: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-gray-600">{tip}</span>
                      </li>
                    ))}
                  </ul>
                  {results.neighborhoodTips && (
                    <p className="mt-3 text-gray-600">{results.neighborhoodTips}</p>
                  )}
                  {results.indianCommunityNote && (
                    <p className="mt-3 text-green-700 font-medium">{results.indianCommunityNote}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ROI Button */}
          <div className="flex gap-3">
            <Button onClick={handleRoiClick} className="bg-purple-600">
              Use These Numbers in ROI Calculator <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            {!showCompare && (
              <Button variant="outline" onClick={() => setShowCompare(true)}>
                Compare with Another City
              </Button>
            )}
          </div>

          {/* City Comparison */}
          {showCompare && (
            <Card>
              <CardHeader>
                <CardTitle>Compare Cities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 mb-4">
                  <select
                    value={compareCity}
                    onChange={(e) => setCompareCity(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="">Select city...</option>
                    {Object.entries(citiesByCountry).flatMap(([_, cities]) =>
                      cities.map((c) => (
                        <option key={c.city} value={c.city}>{c.city}</option>
                      ))
                    )}
                  </select>
                  <Button 
                    onClick={() => handleCalculate(true)}
                    disabled={loading || !compareCity}
                  >
                    Compare
                  </Button>
                </div>
                {compareResults && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Metric</th>
                        <th className="text-right py-2 text-purple-600">{results.city}</th>
                        <th className="text-right py-2 text-green-600">{compareResults.city}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">Monthly Cost</td>
                        <td className="text-right font-medium">{formatInr(results.totalMonthlyINR)}</td>
                        <td className={`text-right font-medium ${
                          compareResults.totalMonthlyINR < results.totalMonthlyINR ? "text-green-600" : "text-red-500"
                        }`}>
                          {formatInr(compareResults.totalMonthlyINR)}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Annual Cost</td>
                        <td className="text-right font-medium">{formatInr(results.totalAnnualINR)}</td>
                        <td className={`text-right font-medium ${
                          compareResults.totalAnnualINR < results.totalAnnualINR ? "text-green-600" : "text-red-500"
                        }`}>
                          {formatInr(compareResults.totalAnnualINR)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
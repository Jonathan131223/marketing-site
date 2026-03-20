import React, { useState } from "react";
import { appUrl } from "@/config/appUrl";
import { normalizeWebsiteUrl } from "@/lib/normalizeWebsiteUrl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formatNumber = (num: number) => new Intl.NumberFormat("en-US").format(num);

const PLANS = [
  { label: "Free — 100 users/month ($0/mo)", value: "0", users: 100 },
  { label: "Pro — 1,000 users/month ($19/mo)", value: "19", users: 1000 },
  { label: "Business — 5,000 users/month ($59/mo)", value: "59", users: 5000 },
];

export const ROISectionHomepage: React.FC = () => {
  const [inputs, setInputs] = useState({
    currentConversionRate: "",
    freeUsersPerMonth: "",
    clv: "",
    estimatedLift: "35",
    serviceCost: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [customLift, setCustomLift] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isUrlLoading, setIsUrlLoading] = useState(false);

  const set = (field: string, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const { currentConversionRate, freeUsersPerMonth, clv, estimatedLift, serviceCost } = inputs;
    if (!currentConversionRate || isNaN(parseFloat(currentConversionRate)) || parseFloat(currentConversionRate) < 0)
      newErrors.currentConversionRate = "Enter a valid number";
    if (!freeUsersPerMonth || isNaN(parseFloat(freeUsersPerMonth)) || parseFloat(freeUsersPerMonth) < 0)
      newErrors.freeUsersPerMonth = "Enter a valid number";
    if (!clv || isNaN(parseFloat(clv)) || parseFloat(clv) < 0) newErrors.clv = "Enter a valid number";
    if (!estimatedLift || isNaN(parseFloat(estimatedLift)) || parseFloat(estimatedLift) < 0)
      newErrors.estimatedLift = "Select an option";
    if (!serviceCost) newErrors.serviceCost = "Select a plan";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculate = () => {
    if (!validate()) return;
    setIsCalculating(true);
    setTimeout(() => {
      const convRate = parseFloat(inputs.currentConversionRate);
      const freeUsers = parseFloat(inputs.freeUsersPerMonth);
      const clv = parseFloat(inputs.clv);
      const lift = parseFloat(inputs.estimatedLift);
      const cost = parseFloat(inputs.serviceCost);
      const newConvRate = convRate * (1 + lift / 100);
      const baselinePaid = freeUsers * (convRate / 100);
      const baselineRevenue = baselinePaid * clv;
      const newPaid = freeUsers * (newConvRate / 100);
      const newRevenue = newPaid * clv;
      const gain = newRevenue - baselineRevenue;
      const roi = cost > 0 ? ((gain - cost) / cost) * 100 : null;
      setResults({
        roi: roi !== null ? roi.toFixed(1) : null,
        baselineRevenue: Math.round(baselineRevenue),
        newRevenue: Math.round(newRevenue),
        gain: Math.round(gain),
        baselinePaid: Math.round(baselinePaid),
        newPaid: Math.round(newPaid),
        convRate,
        newConvRate: newConvRate.toFixed(1),
        cost,
      });
      setIsCalculating(false);
    }, 250);
  };

  const handleUrlSubmit = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setIsUrlLoading(true);
    const normalized = normalizeWebsiteUrl(trimmed);
    const target = `${appUrl("/email-sequence-generator")}?analyze=1&url=${encodeURIComponent(normalized)}`;
    window.location.href = target;
  };

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900">
            What better onboarding could be worth
          </h2>
        </div>

        <div className="max-w-xl mx-auto">
          {results && (
            <div className="mb-6 bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-8 space-y-6">
              <div className="text-center">
                {results.roi === null || parseFloat(results.roi) < 0 ? (
                  <p className="text-gray-500 text-sm">No gain with these inputs — try adjusting your numbers.</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 mb-1">Estimated ROI</p>
                    <p className="text-5xl font-bold text-primary">{formatNumber(Math.abs(parseFloat(results.roi)))}%</p>
                  </>
                )}
              </div>

              {results.roi !== null && parseFloat(results.roi) >= 0 && (
                <>
                  <div className="divide-y divide-gray-100 text-sm">
                    <div className="flex justify-between py-3">
                      <span className="text-gray-500">Conversion rate</span>
                      <span className="font-semibold text-gray-900">{results.convRate}% → {results.newConvRate}%</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-gray-500">Paid users/month</span>
                      <span className="font-semibold text-gray-900">{formatNumber(results.baselinePaid)} → {formatNumber(results.newPaid)}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-gray-500">Baseline revenue</span>
                      <span className="font-semibold text-gray-900">${formatNumber(results.baselineRevenue)}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-gray-500">New revenue</span>
                      <span className="font-semibold text-gray-900">${formatNumber(results.newRevenue)}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-gray-500">Additional revenue</span>
                      <span className="font-semibold text-primary">+${formatNumber(results.gain)}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-gray-500">Plan cost</span>
                      <span className="font-semibold text-gray-900">${formatNumber(results.cost)}/mo</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    Improving conversion from {results.convRate}% to {results.newConvRate}% could add{" "}
                    <strong className="text-gray-900">${formatNumber(results.gain)}</strong> in revenue monthly — an estimated{" "}
                    <strong className="text-gray-900">{formatNumber(parseFloat(results.roi))}% ROI</strong> on a ${results.cost}/mo plan.
                  </p>
                  <div className="pt-4 border-t border-gray-100 text-center">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                        placeholder="website.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      />
                      <Button onClick={handleUrlSubmit} disabled={isUrlLoading} className="w-full flex items-center justify-center gap-2" size="lg">
                        {isUrlLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          "Generate my onboarding emails"
                        )}
                      </Button>
                      <p className="text-sm text-gray-500">100 onboarded users free. No card required.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 sm:p-8 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="roi-conv">Current free-to-paid conversion rate (%)</Label>
              <Input id="roi-conv" type="number" placeholder="e.g. 5" value={inputs.currentConversionRate} onChange={(e) => set("currentConversionRate", e.target.value)} />
              {errors.currentConversionRate && <p className="text-xs text-destructive">{errors.currentConversionRate}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="roi-users">Free users per month</Label>
              <Input id="roi-users" type="number" placeholder="e.g. 1000" value={inputs.freeUsersPerMonth} onChange={(e) => set("freeUsersPerMonth", e.target.value)} />
              {errors.freeUsersPerMonth && <p className="text-xs text-destructive">{errors.freeUsersPerMonth}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="roi-clv">Customer lifetime value — CLV ($)</Label>
              <Input id="roi-clv" type="number" placeholder="e.g. 228" value={inputs.clv} onChange={(e) => set("clv", e.target.value)} />
              {errors.clv && <p className="text-xs text-destructive">{errors.clv}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Expected conversion rate lift</Label>
              <Select
                value={customLift ? "custom" : inputs.estimatedLift}
                onValueChange={(v) => {
                  if (v === "custom") {
                    setCustomLift(true);
                    set("estimatedLift", "");
                  } else {
                    setCustomLift(false);
                    set("estimatedLift", v);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your situation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="35">No onboarding emails yet → +35% lift</SelectItem>
                  <SelectItem value="20">Already sending onboarding emails → +20% lift</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {customLift && (
                <Input type="number" placeholder="Enter custom lift %" value={inputs.estimatedLift} onChange={(e) => set("estimatedLift", e.target.value)} />
              )}
              {errors.estimatedLift && <p className="text-xs text-destructive">{errors.estimatedLift}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>DigiStorms plan</Label>
              <Select value={inputs.serviceCost} onValueChange={(v) => set("serviceCost", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {PLANS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.serviceCost && <p className="text-xs text-destructive">{errors.serviceCost}</p>}
            </div>
            <Button onClick={calculate} disabled={isCalculating} className="w-full" size="lg">
              {isCalculating ? "Calculating…" : "Calculate ROI"}
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            These are estimates for illustration only based on the numbers you provide.
          </p>
        </div>
      </div>
    </section>
  );
};

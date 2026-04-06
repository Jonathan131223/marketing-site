import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appUrl } from "@/config/appUrl";
import { normalizeWebsiteUrl } from "@/lib/normalizeWebsiteUrl";

const formatNumber = (num: number) => new Intl.NumberFormat("en-US").format(num);

const PLANS = [
  { label: "Free: 100 users/month ($0/mo)", value: "0", users: 100 },
  { label: "Pro: 1,000 users/month ($19/mo)", value: "19", users: 1000 },
  { label: "Business: 5,000 users/month ($59/mo)", value: "59", users: 5000 },
];

interface ROISectionHomepageProps {
  /** When set, called instead of assigning window.location (e.g. to show a notice modal). */
  onBeforeNavigateToApp?: (href: string) => void;
}

export const ROISectionHomepage: React.FC<ROISectionHomepageProps> = ({
  onBeforeNavigateToApp,
}) => {
  const [inputs, setInputs] = useState({
    currentConversionRate: "",
    freeUsersPerMonth: "",
    clv: "",
    estimatedLift: "35",
    serviceCost: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [customLift, setCustomLift] = useState(false);
  const [urlInput, setUrlInput] = useState("");

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
    if (!clv || isNaN(parseFloat(clv)) || parseFloat(clv) < 0)
      newErrors.clv = "Enter a valid number";
    if (!estimatedLift || isNaN(parseFloat(estimatedLift)) || parseFloat(estimatedLift) < 0)
      newErrors.estimatedLift = "Select an option";
    if (!serviceCost)
      newErrors.serviceCost = "Select a plan";

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
    const go = (href: string) => {
      if (onBeforeNavigateToApp) onBeforeNavigateToApp(href);
      else window.location.href = href;
    };
    try {
      const normalized = normalizeWebsiteUrl(trimmed);
      go(appUrl(`/email-sequence-generator?analyze=1&url=${encodeURIComponent(normalized)}`));
    } catch {
      go(appUrl("/email-sequence-generator"));
    }
  };

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-[#F8FAFC]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900 mb-4">
            What better onboarding could be worth
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "22px" }}>
            Estimate how much additional revenue stronger onboarding emails could generate for your product.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          {results && (
            <div className="mb-6 bg-white rounded-2xl shadow-sm border border-slate-100/80 p-8 space-y-6">
              <div className="text-center">
                {results.roi === null || parseFloat(results.roi as string) < 0 ? (
                  <p className="text-slate-500 text-sm">No gain with these inputs. Try adjusting your numbers.</p>
                ) : (
                  <>
                    <p className="text-sm text-slate-500 mb-1">Estimated ROI</p>
                    <p className="text-5xl font-bold text-primary">
                      {formatNumber(Math.abs(parseFloat(results.roi as string)))}%
                    </p>
                  </>
                )}
              </div>

              {results.roi !== null && parseFloat(results.roi as string) >= 0 && (
                <>
                  <div className="divide-y divide-slate-100 text-sm">
                    <div className="flex justify-between py-3">
                      <span className="text-slate-500">Conversion rate</span>
                      <span className="font-semibold text-slate-900">
                        {results.convRate as number}% → {results.newConvRate as string}%
                      </span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-slate-500">Paid users/month</span>
                      <span className="font-semibold text-slate-900">
                        {formatNumber(results.baselinePaid as number)} → {formatNumber(results.newPaid as number)}
                      </span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-slate-500">Baseline revenue</span>
                      <span className="font-semibold text-slate-900">${formatNumber(results.baselineRevenue as number)}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-slate-500">New revenue</span>
                      <span className="font-semibold text-slate-900">${formatNumber(results.newRevenue as number)}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-slate-500">Additional revenue</span>
                      <span className="font-semibold text-primary">+${formatNumber(results.gain as number)}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-slate-500">Plan cost</span>
                      <span className="font-semibold text-slate-900">${formatNumber(results.cost as number)}/mo</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 text-center">
                    Improving conversion from {results.convRate as number}% to {results.newConvRate as string}% could add{" "}
                    <strong className="text-slate-900">${formatNumber(results.gain as number)}</strong> in revenue monthly,
                    an estimated <strong className="text-slate-900">{formatNumber(parseFloat(results.roi as string))}% ROI</strong> on a ${results.cost as number}/mo plan.
                  </p>

                  <div className="pt-4 border-t border-slate-100 text-center">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                        placeholder="website.com"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleUrlSubmit}
                        data-flat-purple
                        style={{
                          backgroundColor: "#1D4ED8",
                          boxShadow: "none",
                          outline: "none",
                          border: "none",
                        }}
                        className="w-full text-white px-8 py-4 rounded-xl font-semibold text-lg disabled:cursor-not-allowed"
                      >
                        Generate my onboarding emails
                      </button>
                      <p className="text-sm text-slate-500">100 onboarded users free. No card required.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-slate-100/80 p-8 space-y-5">

            <div className="space-y-1.5">
              <Label htmlFor="roi-conv">Current free-to-paid conversion rate (%)</Label>
              <Input
                id="roi-conv"
                type="number"
                placeholder="e.g. 5"
                value={inputs.currentConversionRate}
                onChange={(e) => set("currentConversionRate", e.target.value)}
              />
              {errors.currentConversionRate && (
                <p className="text-xs text-destructive">{errors.currentConversionRate}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="roi-users">Free users per month</Label>
              <Input
                id="roi-users"
                type="number"
                placeholder="e.g. 1000"
                value={inputs.freeUsersPerMonth}
                onChange={(e) => set("freeUsersPerMonth", e.target.value)}
              />
              {errors.freeUsersPerMonth && (
                <p className="text-xs text-destructive">{errors.freeUsersPerMonth}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="roi-clv">Customer lifetime value (CLV) ($)</Label>
              <Input
                id="roi-clv"
                type="number"
                placeholder="e.g. 228"
                value={inputs.clv}
                onChange={(e) => set("clv", e.target.value)}
              />
              {errors.clv && (
                <p className="text-xs text-destructive">{errors.clv}</p>
              )}
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
                <SelectTrigger className="w-full" aria-label="Expected conversion rate lift">
                  <SelectValue placeholder="Select your situation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="35">No onboarding emails yet → +35% lift</SelectItem>
                  <SelectItem value="20">Already sending onboarding emails → +20% lift</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {customLift && (
                <Input
                  type="number"
                  placeholder="Enter custom lift %"
                  value={inputs.estimatedLift}
                  onChange={(e) => set("estimatedLift", e.target.value)}
                />
              )}
              {errors.estimatedLift && (
                <p className="text-xs text-destructive">{errors.estimatedLift}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>DigiStorms plan</Label>
              <Select
                value={inputs.serviceCost}
                onValueChange={(v) => set("serviceCost", v)}
              >
                <SelectTrigger className="w-full" aria-label="DigiStorms plan">
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
              {errors.serviceCost && (
                <p className="text-xs text-destructive">{errors.serviceCost}</p>
              )}
            </div>

            <button
              type="button"
              onClick={calculate}
              disabled={isCalculating}
              className="flat-purple-btn w-full bg-[#1D4ED8] text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-none border-0 focus:outline-none focus:ring-0 active:bg-[#1D4ED8] disabled:cursor-not-allowed"
            >
              {isCalculating ? "Calculating…" : "Calculate ROI"}
            </button>
          </div>

          <p className="text-xs text-slate-600 text-center mt-4">
            These are estimates for illustration only based on the numbers you provide.
          </p>
        </div>
      </div>
    </section>
  );
};

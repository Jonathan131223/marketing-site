import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appUrl } from "@/config/appUrl";

const PLANS = [
  { label: "Free – $0 / month (100 users)", value: "0" },
  { label: "Pro – $19 / month (1,000 users)", value: "19" },
  { label: "Business – $59 / month (5,000 users)", value: "59" },
  { label: "Concierge – $690 / month (done for you)", value: "690" },
];

const formatNumber = (num: number) =>
  new Intl.NumberFormat("en-US").format(num);

export default function ROICalculatorIsland() {
  const [inputs, setInputs] = useState({
    currentConversionRate: "",
    freeUsersPerMonth: "",
    clv: "",
    estimatedLift: "40",
    serviceCost: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<null | {
    roi: string | null;
    baselineRevenue: number;
    newRevenue: number;
    revenueGain: number;
    baselinePaidUsers: number;
    newPaidUsers: number;
    currentConversionRate: number;
    newConversionRate: string;
    serviceCost: number;
  }>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [customLift, setCustomLift] = useState(false);

  const set = (field: string, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const { currentConversionRate, freeUsersPerMonth, clv, estimatedLift, serviceCost } = inputs;

    if (!currentConversionRate || isNaN(parseFloat(currentConversionRate)) || parseFloat(currentConversionRate) <= 0)
      newErrors.currentConversionRate = "Please enter a valid positive number";
    if (!freeUsersPerMonth || isNaN(parseFloat(freeUsersPerMonth)) || parseFloat(freeUsersPerMonth) <= 0)
      newErrors.freeUsersPerMonth = "Please enter a valid positive number";
    if (!clv || isNaN(parseFloat(clv)) || parseFloat(clv) <= 0)
      newErrors.clv = "Please enter a valid positive number";
    if (!estimatedLift || isNaN(parseFloat(estimatedLift)) || parseFloat(estimatedLift) <= 0)
      newErrors.estimatedLift = "Please enter a valid positive number";
    if (!serviceCost)
      newErrors.serviceCost = "Please select a plan";

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
      const baselinePaidUsers = freeUsers * (convRate / 100);
      const baselineRevenue = baselinePaidUsers * clv;
      const newPaidUsers = freeUsers * (newConvRate / 100);
      const newRevenue = newPaidUsers * clv;
      const revenueGain = newRevenue - baselineRevenue;
      const roi = cost > 0 ? ((revenueGain - cost) / cost) * 100 : null;

      setResults({
        roi: roi !== null ? roi.toFixed(1) : null,
        baselineRevenue: Math.round(baselineRevenue),
        newRevenue: Math.round(newRevenue),
        revenueGain: Math.round(revenueGain),
        baselinePaidUsers: Math.round(baselinePaidUsers),
        newPaidUsers: Math.round(newPaidUsers),
        currentConversionRate: convRate,
        newConversionRate: newConvRate.toFixed(1),
        serviceCost: cost,
      });

      setIsCalculating(false);
    }, 250);
  };

  const roiIsNegative = results && results.roi !== null && parseFloat(results.roi) < 0;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-serif font-bold text-foreground mb-6">
            See how much revenue better onboarding emails could unlock.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Estimate the ROI of improving your free-to-paid conversion with onboarding emails built by DigiStorms.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-6 px-4 pb-20">
        <div className="container mx-auto max-w-5xl">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-10">

                {/* Inputs */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif font-semibold text-foreground">Your Numbers</h2>

                  <div className="space-y-2">
                    <Label htmlFor="currentConversionRate">Current free-to-paid conversion rate (%)</Label>
                    <Input id="currentConversionRate" type="number" placeholder="e.g. 5" value={inputs.currentConversionRate} onChange={(e) => set("currentConversionRate", e.target.value)} />
                    <p className="text-sm text-muted-foreground">% of free/trial signups that currently become paying customers.</p>
                    {errors.currentConversionRate && <p className="text-sm text-destructive">{errors.currentConversionRate}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="freeUsersPerMonth">New free/trial signups per month</Label>
                    <Input id="freeUsersPerMonth" type="number" placeholder="e.g. 500" value={inputs.freeUsersPerMonth} onChange={(e) => set("freeUsersPerMonth", e.target.value)} />
                    <p className="text-sm text-muted-foreground">Average number of new free or trial users who sign up each month.</p>
                    {errors.freeUsersPerMonth && <p className="text-sm text-destructive">{errors.freeUsersPerMonth}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clv">Average customer lifetime value ($)</Label>
                    <Input id="clv" type="number" placeholder="e.g. 300" value={inputs.clv} onChange={(e) => set("clv", e.target.value)} />
                    <p className="text-sm text-muted-foreground">Total revenue you earn from a paying customer over their lifetime.</p>
                    {errors.clv && <p className="text-sm text-destructive">{errors.clv}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedLift">Expected conversion rate lift</Label>
                    <Select
                      value={customLift ? "custom" : inputs.estimatedLift}
                      onValueChange={(value) => {
                        if (value === "custom") { setCustomLift(true); set("estimatedLift", ""); }
                        else { setCustomLift(false); set("estimatedLift", value); }
                      }}
                    >
                      <SelectTrigger id="estimatedLift" className="w-full"><SelectValue placeholder="Select your situation" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="40">No onboarding emails at all → +40% lift</SelectItem>
                        <SelectItem value="20">Some onboarding emails → +20% lift</SelectItem>
                        <SelectItem value="custom">Custom lift %</SelectItem>
                      </SelectContent>
                    </Select>
                    {customLift && <Input type="number" placeholder="Enter expected lift %" value={inputs.estimatedLift} onChange={(e) => set("estimatedLift", e.target.value)} />}
                    {errors.estimatedLift && <p className="text-sm text-destructive">{errors.estimatedLift}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceCost">DigiStorms plan</Label>
                    <Select value={inputs.serviceCost} onValueChange={(value) => set("serviceCost", value)}>
                      <SelectTrigger id="serviceCost" className="w-full"><SelectValue placeholder="Select a plan" /></SelectTrigger>
                      <SelectContent>
                        {PLANS.map((plan) => (<SelectItem key={plan.value} value={plan.value}>{plan.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Which DigiStorms plan are you considering? <a href="/pricing" className="underline hover:text-foreground transition-colors">See all plans →</a></p>
                    {errors.serviceCost && <p className="text-sm text-destructive">{errors.serviceCost}</p>}
                  </div>

                  <Button onClick={calculate} disabled={isCalculating} className="w-full" size="lg">
                    {isCalculating ? "Calculating…" : "Calculate ROI"}
                  </Button>
                </div>

                {/* Results */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif font-semibold text-foreground">Your Results</h2>

                  {!results ? (
                    <div className="flex items-center justify-center h-full min-h-[300px] text-center">
                      <p className="text-muted-foreground">Enter your numbers and click "Calculate ROI" to see your potential results.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-6 bg-primary/10 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Estimated ROI</p>
                        {results.roi === null ? (
                          <p className="text-4xl font-bold text-primary">∞</p>
                        ) : roiIsNegative ? (
                          <p className="text-4xl font-bold text-destructive">–{formatNumber(Math.abs(parseFloat(results.roi)))}%</p>
                        ) : (
                          <p className="text-4xl font-bold text-primary">{formatNumber(parseFloat(results.roi))}%</p>
                        )}
                      </div>

                      {roiIsNegative ? (
                        <p className="text-sm text-destructive">No gain with these inputs. Try adjusting your numbers or selecting a lower-cost plan.</p>
                      ) : (
                        <>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-border"><span className="text-muted-foreground text-sm">Conversion rate</span><span className="font-semibold text-foreground text-sm">{results.currentConversionRate}% → {results.newConversionRate}%</span></div>
                            <div className="flex justify-between items-center pb-2 border-b border-border"><span className="text-muted-foreground text-sm">Paid users / month</span><span className="font-semibold text-foreground text-sm">{formatNumber(results.baselinePaidUsers)} → {formatNumber(results.newPaidUsers)}</span></div>
                            <div className="flex justify-between items-center pb-2 border-b border-border"><span className="text-muted-foreground text-sm">Baseline revenue</span><span className="font-semibold text-foreground text-sm">${formatNumber(results.baselineRevenue)}</span></div>
                            <div className="flex justify-between items-center pb-2 border-b border-border"><span className="text-muted-foreground text-sm">New revenue</span><span className="font-semibold text-foreground text-sm">${formatNumber(results.newRevenue)}</span></div>
                            <div className="flex justify-between items-center pb-2 border-b border-border"><span className="text-muted-foreground text-sm">Additional revenue / month</span><span className="font-semibold text-primary text-sm">+${formatNumber(results.revenueGain)}</span></div>
                            {results.serviceCost > 0 && (
                              <div className="flex justify-between items-center pb-2 border-b border-border"><span className="text-muted-foreground text-sm">Plan cost</span><span className="font-semibold text-foreground text-sm">${formatNumber(results.serviceCost)}/mo</span></div>
                            )}
                          </div>

                          <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                            Improving conversion from {results.currentConversionRate}% to {results.newConversionRate}% could add{" "}
                            <strong className="text-foreground">+${formatNumber(results.revenueGain)}</strong> in revenue each month from new conversions
                            {results.roi !== null && results.serviceCost > 0 ? ` — a ${formatNumber(parseFloat(results.roi))}% ROI on a $${formatNumber(results.serviceCost)}/mo plan.` : "."}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* CTA */}
              {results && !roiIsNegative && (
                <div className="mt-10 p-6 bg-primary/5 rounded-lg border border-primary/20 text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Ready to make it happen?</h3>
                  <p className="text-muted-foreground mb-4">DigiStorms builds your onboarding email sequence automatically — so you can start moving users from signup to paid.</p>
                  <Button size="lg" asChild className="w-full sm:w-auto">
                    <a href={appUrl("/email-sequence-generator")}>Build my onboarding emails</a>
                  </Button>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center mt-8 pt-6 border-t border-border">
                These are estimates based on the numbers you provide and are for illustration only.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { appUrl } from "@/config/appUrl";

type CalculatorTab = "activation" | "retention" | "expansion";

export default function ROICalculator() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as CalculatorTab) || "activation";
  const [activeTab, setActiveTab] = useState<CalculatorTab>(initialTab);

  // Activation state
  const [activationInputs, setActivationInputs] = useState({
    currentConversionRate: "",
    freeUsersPerMonth: "",
    clv: "",
    estimatedLift: "40",
    serviceCost: "",
  });
  const [activationErrors, setActivationErrors] = useState<Record<string, string>>({});
  const [activationResults, setActivationResults] = useState<any>(null);

  // Retention state
  const [retentionInputs, setRetentionInputs] = useState({
    monthlyChurnRate: "",
    paidUsersPerMonth: "",
    clv: "",
    expectedChurnReduction: "30",
    serviceCost: "",
  });
  const [retentionErrors, setRetentionErrors] = useState<Record<string, string>>({});
  const [retentionResults, setRetentionResults] = useState<any>(null);

  // Expansion state
  const [expansionInputs, setExpansionInputs] = useState({
    currentExpansionRevenue: "",
    activeCustomers: "",
    currentCLV: "",
    expectedLift: "30",
    serviceCost: "",
  });
  const [expansionErrors, setExpansionErrors] = useState<Record<string, string>>({});
  const [expansionResults, setExpansionResults] = useState<any>(null);

  const [isCalculating, setIsCalculating] = useState(false);
  const [activationCustomLift, setActivationCustomLift] = useState(false);
  const [retentionCustomReduction, setRetentionCustomReduction] = useState(false);
  const [expansionCustomLift, setExpansionCustomLift] = useState(false);

  // Pre-fill CLV from URL parameter
  useEffect(() => {
    const clvParam = searchParams.get("clv");
    if (clvParam) {
      setRetentionInputs((prev) => ({ ...prev, clv: clvParam }));
      setExpansionInputs((prev) => ({ ...prev, currentCLV: clvParam }));
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as CalculatorTab);
    setSearchParams({ tab });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  // Activation calculator
  const handleActivationInputChange = (field: string, value: string) => {
    setActivationInputs((prev) => ({ ...prev, [field]: value }));
    setActivationErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateActivationInputs = () => {
    const newErrors: Record<string, string> = {};
    const { currentConversionRate, freeUsersPerMonth, clv, estimatedLift, serviceCost } = activationInputs;

    if (!currentConversionRate || isNaN(parseFloat(currentConversionRate)) || parseFloat(currentConversionRate) < 0) {
      newErrors.currentConversionRate = "Please enter a valid positive number";
    }
    if (!freeUsersPerMonth || isNaN(parseFloat(freeUsersPerMonth)) || parseFloat(freeUsersPerMonth) < 0) {
      newErrors.freeUsersPerMonth = "Please enter a valid positive number";
    }
    if (!clv || isNaN(parseFloat(clv)) || parseFloat(clv) < 0) {
      newErrors.clv = "Please enter a valid positive number";
    }
    if (!estimatedLift || isNaN(parseFloat(estimatedLift)) || parseFloat(estimatedLift) < 0) {
      newErrors.estimatedLift = "Please enter a valid positive number";
    }
    if (!serviceCost || isNaN(parseFloat(serviceCost)) || parseFloat(serviceCost) < 0) {
      newErrors.serviceCost = "Please enter a valid positive number";
    }

    setActivationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateActivationROI = () => {
    if (!validateActivationInputs()) return;

    setIsCalculating(true);

    setTimeout(() => {
      const currentConversionRate = parseFloat(activationInputs.currentConversionRate);
      const freeUsersPerMonth = parseFloat(activationInputs.freeUsersPerMonth);
      const clv = parseFloat(activationInputs.clv);
      const estimatedLift = parseFloat(activationInputs.estimatedLift);
      const serviceCost = parseFloat(activationInputs.serviceCost);

      const newConversionRate = currentConversionRate * (1 + estimatedLift / 100);
      const baselinePaidUsers = freeUsersPerMonth * (currentConversionRate / 100);
      const baselineRevenue = baselinePaidUsers * clv;
      const newPaidUsers = freeUsersPerMonth * (newConversionRate / 100);
      const newRevenue = newPaidUsers * clv;
      const revenueGain = newRevenue - baselineRevenue;
      const roi = ((revenueGain - serviceCost) / serviceCost) * 100;

      setActivationResults({
        roi: roi.toFixed(1),
        baselineRevenue: Math.round(baselineRevenue),
        newRevenue: Math.round(newRevenue),
        revenueGain: Math.round(revenueGain),
        baselinePaidUsers: Math.round(baselinePaidUsers),
        newPaidUsers: Math.round(newPaidUsers),
        currentConversionRate,
        newConversionRate: newConversionRate.toFixed(1),
      });

      setIsCalculating(false);
    }, 250);
  };

  // Retention calculator
  const handleRetentionInputChange = (field: string, value: string) => {
    setRetentionInputs((prev) => ({ ...prev, [field]: value }));
    setRetentionErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateRetentionInputs = () => {
    const newErrors: Record<string, string> = {};
    const { monthlyChurnRate, paidUsersPerMonth, clv, expectedChurnReduction, serviceCost } = retentionInputs;

    if (!monthlyChurnRate || isNaN(parseFloat(monthlyChurnRate)) || parseFloat(monthlyChurnRate) <= 0 || parseFloat(monthlyChurnRate) > 100) {
      newErrors.monthlyChurnRate = "Please enter a valid churn rate (1-100%)";
    }
    if (!paidUsersPerMonth || isNaN(parseFloat(paidUsersPerMonth)) || parseFloat(paidUsersPerMonth) < 0) {
      newErrors.paidUsersPerMonth = "Please enter a valid positive number";
    }
    if (!clv || isNaN(parseFloat(clv)) || parseFloat(clv) < 0) {
      newErrors.clv = "Please enter a valid positive number";
    }
    if (!expectedChurnReduction || isNaN(parseFloat(expectedChurnReduction)) || parseFloat(expectedChurnReduction) < 0) {
      newErrors.expectedChurnReduction = "Please select a valid option";
    }
    if (!serviceCost || isNaN(parseFloat(serviceCost)) || parseFloat(serviceCost) < 0) {
      newErrors.serviceCost = "Please enter a valid positive number";
    }

    setRetentionErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateRetentionROI = () => {
    if (!validateRetentionInputs()) return;

    setIsCalculating(true);

    setTimeout(() => {
      const monthlyChurnRate = parseFloat(retentionInputs.monthlyChurnRate) / 100;
      const paidUsersPerMonth = parseFloat(retentionInputs.paidUsersPerMonth);
      const clv = parseFloat(retentionInputs.clv);
      const expectedChurnReduction = parseFloat(retentionInputs.expectedChurnReduction) / 100;
      const serviceCost = parseFloat(retentionInputs.serviceCost);

      const newChurnRate = monthlyChurnRate * (1 - expectedChurnReduction);
      const currentLifespan = 1 / monthlyChurnRate;
      const newLifespan = 1 / newChurnRate;
      const monthlyRevenue = clv / currentLifespan;
      const newCLV = monthlyRevenue * newLifespan;
      const extraRevenuePerUser = newCLV - clv;
      const extraRevenuePerYear = extraRevenuePerUser * paidUsersPerMonth;
      const roi = ((extraRevenuePerYear - serviceCost) / serviceCost) * 100;

      setRetentionResults({
        roi: roi.toFixed(1),
        oldChurnRate: (monthlyChurnRate * 100).toFixed(1),
        newChurnRate: (newChurnRate * 100).toFixed(2),
        oldLifespan: currentLifespan.toFixed(1),
        newLifespan: newLifespan.toFixed(1),
        oldCLV: Math.round(clv),
        newCLV: Math.round(newCLV),
        extraRevenuePerYear: Math.round(extraRevenuePerYear),
      });

      setIsCalculating(false);
    }, 250);
  };

  // Expansion calculator
  const handleExpansionInputChange = (field: string, value: string) => {
    setExpansionInputs((prev) => ({ ...prev, [field]: value }));
    setExpansionErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateExpansionInputs = () => {
    const newErrors: Record<string, string> = {};
    const { currentExpansionRevenue, activeCustomers, currentCLV, expectedLift, serviceCost } = expansionInputs;

    if (!currentExpansionRevenue || isNaN(parseFloat(currentExpansionRevenue)) || parseFloat(currentExpansionRevenue) < 0) {
      newErrors.currentExpansionRevenue = "Please enter a valid positive number";
    }
    if (!activeCustomers || isNaN(parseFloat(activeCustomers)) || parseFloat(activeCustomers) < 0) {
      newErrors.activeCustomers = "Please enter a valid positive number";
    }
    if (!currentCLV || isNaN(parseFloat(currentCLV)) || parseFloat(currentCLV) < 0) {
      newErrors.currentCLV = "Please enter a valid positive number";
    }
    if (!expectedLift || isNaN(parseFloat(expectedLift)) || parseFloat(expectedLift) < 0) {
      newErrors.expectedLift = "Please select a valid option";
    }
    if (!serviceCost || isNaN(parseFloat(serviceCost)) || parseFloat(serviceCost) < 0) {
      newErrors.serviceCost = "Please enter a valid positive number";
    }

    setExpansionErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateExpansionROI = () => {
    if (!validateExpansionInputs()) return;

    setIsCalculating(true);

    setTimeout(() => {
      const currentExpansionRevenue = parseFloat(expansionInputs.currentExpansionRevenue);
      const activeCustomers = parseFloat(expansionInputs.activeCustomers);
      const currentCLV = parseFloat(expansionInputs.currentCLV);
      const expectedLift = parseFloat(expansionInputs.expectedLift) / 100;
      const serviceCost = parseFloat(expansionInputs.serviceCost);

      const newExpansionRevenue = currentExpansionRevenue * (1 + expectedLift);
      const increasePerUser = newExpansionRevenue - currentExpansionRevenue;
      const newCLV = currentCLV + (increasePerUser * 12);
      const extraRevenuePerYear = increasePerUser * activeCustomers * 12;
      const roi = ((extraRevenuePerYear - serviceCost) / serviceCost) * 100;

      setExpansionResults({
        roi: roi.toFixed(1),
        oldExpansionRevenue: currentExpansionRevenue.toFixed(2),
        newExpansionRevenue: newExpansionRevenue.toFixed(2),
        oldCLV: Math.round(currentCLV),
        newCLV: Math.round(newCLV),
        extraRevenuePerYear: Math.round(extraRevenuePerYear),
      });

      setIsCalculating(false);
    }, 250);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "activation":
        return "See how much revenue better onboarding emails could unlock.";
      case "retention":
        return "See how much revenue better retention emails could unlock.";
      case "expansion":
        return "See how much revenue better expansion emails could unlock.";
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case "activation":
        return "Use this calculator to estimate the ROI of improving your free-to-paid conversion with onboarding emails powered by DigiStorms.";
      case "retention":
        return "Use this calculator to estimate the ROI of reducing your monthly churn rate with retention emails powered by DigiStorms.";
      case "expansion":
        return "Use this calculator to estimate the ROI of increasing your expansion revenue with lifecycle emails powered by DigiStorms.";
    }
  };

  return (
    <>
      <Helmet>
        <title>SaaS Email ROI Calculator | DigiStorms</title>
        <meta name="description" content="Calculate the ROI of lifecycle email marketing for your SaaS. See how onboarding and retention emails impact MRR, churn, and LTV." />
        <link rel="canonical" href="https://digistorms.ai/roi-calculator" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="SaaS Email ROI Calculator | DigiStorms" />
        <meta property="og:description" content="Calculate the ROI of lifecycle email marketing for your SaaS." />
        <meta property="og:url" content="https://digistorms.ai/roi-calculator" />
      </Helmet>
      <Navbar />
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            {getTabTitle()}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {getTabDescription()}
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="py-6 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="activation">Activation</TabsTrigger>
              <TabsTrigger value="retention">Retention</TabsTrigger>
              <TabsTrigger value="expansion">Expansion</TabsTrigger>
            </TabsList>

            {/* Activation Tab */}
            <TabsContent value="activation">
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Input Column */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-foreground mb-6">
                        Your Numbers
                      </h2>

                      <div className="space-y-2">
                        <Label htmlFor="currentConversionRate">
                          Current free-to-paid conversion rate (%)
                        </Label>
                        <Input
                          id="currentConversionRate"
                          type="number"
                          placeholder="15"
                          value={activationInputs.currentConversionRate}
                          onChange={(e) =>
                            handleActivationInputChange("currentConversionRate", e.target.value)
                          }
                        />
                        <p className="text-sm text-muted-foreground">
                          Your current free-to-paid conversion rate (e.g. 15 for 15%).
                        </p>
                        {activationErrors.currentConversionRate && (
                          <p className="text-sm text-destructive">{activationErrors.currentConversionRate}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="freeUsersPerMonth">Free users per month</Label>
                        <Input
                          id="freeUsersPerMonth"
                          type="number"
                          placeholder="1000"
                          value={activationInputs.freeUsersPerMonth}
                          onChange={(e) =>
                            handleActivationInputChange("freeUsersPerMonth", e.target.value)
                          }
                        />
                        <p className="text-sm text-muted-foreground">
                          Average number of free/trial users who sign up each month.
                        </p>
                        {activationErrors.freeUsersPerMonth && (
                          <p className="text-sm text-destructive">{activationErrors.freeUsersPerMonth}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="activationClv">Customer lifetime value (CLV)</Label>
                        <Input
                          id="activationClv"
                          type="number"
                          placeholder="228"
                          value={activationInputs.clv}
                          onChange={(e) => handleActivationInputChange("clv", e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">
                          Average revenue you earn from a customer over their lifetime.
                        </p>
                        {activationErrors.clv && (
                          <p className="text-sm text-destructive">{activationErrors.clv}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estimatedLift">
                          Expected conversion rate lift
                        </Label>
                        <Select
                          value={activationCustomLift ? "custom" : activationInputs.estimatedLift}
                          onValueChange={(value) => {
                            if (value === "custom") {
                              setActivationCustomLift(true);
                              handleActivationInputChange("estimatedLift", "");
                            } else {
                              setActivationCustomLift(false);
                              handleActivationInputChange("estimatedLift", value);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select your current situation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="40">I don't send onboarding emails → +40% lift</SelectItem>
                            <SelectItem value="20">I already send onboarding emails → +20% lift</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {activationCustomLift && (
                          <Input
                            type="number"
                            placeholder="Enter custom lift %"
                            value={activationInputs.estimatedLift}
                            onChange={(e) => handleActivationInputChange("estimatedLift", e.target.value)}
                          />
                        )}
                        <p className="text-sm text-muted-foreground">
                          Select your current onboarding email situation.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="activationServiceCost">Service cost ($)</Label>
                        <Input
                          id="activationServiceCost"
                          type="number"
                          placeholder="690"
                          value={activationInputs.serviceCost}
                          onChange={(e) => handleActivationInputChange("serviceCost", e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">
                          One month of the Concierge plan ($690/month) is enough to achieve these results.
                        </p>
                      </div>

                      <Button
                        onClick={calculateActivationROI}
                        disabled={isCalculating}
                        className="w-full"
                        size="lg"
                      >
                        {isCalculating ? "Calculating..." : "Calculate ROI"}
                      </Button>
                    </div>

                    {/* Results Column */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-foreground mb-6">
                        Your Results
                      </h2>

                      {!activationResults ? (
                        <div className="flex items-center justify-center h-full min-h-[300px] text-center">
                          <p className="text-muted-foreground">
                            Enter your numbers and click "Calculate ROI" to see your potential
                            results.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="p-6 bg-primary/10 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-2">
                              Estimated ROI
                            </p>
                            <p
                              className={`text-4xl font-bold ${
                                parseFloat(activationResults.roi) < 0
                                  ? "text-destructive"
                                  : "text-primary"
                              }`}
                            >
                              {parseFloat(activationResults.roi) < 0 ? "–" : ""}
                              {formatNumber(Math.abs(parseFloat(activationResults.roi)))}%
                            </p>
                          </div>

                          {parseFloat(activationResults.roi) < 0 ? (
                            <p className="text-sm text-destructive">
                              No gain with current inputs. Try adjusting your numbers.
                            </p>
                          ) : (
                            <>
                              <div className="space-y-4">
                                <div className="space-y-1 pb-2 border-b border-border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                      Baseline revenue
                                    </span>
                                    <span className="font-semibold text-foreground">
                                      ${formatNumber(activationResults.baselineRevenue)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Free users × current conversion rate × CLV
                                  </p>
                                </div>
                                <div className="space-y-1 pb-2 border-b border-border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">New revenue</span>
                                    <span className="font-semibold text-foreground">
                                      ${formatNumber(activationResults.newRevenue)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Free users × new conversion rate × CLV
                                  </p>
                                </div>
                                <div className="space-y-1 pb-2 border-b border-border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                      Additional revenue from new conversions
                                    </span>
                                    <span className="font-semibold text-primary">
                                      ${formatNumber(activationResults.revenueGain)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    New revenue - baseline revenue
                                  </p>
                                </div>
                                <div className="space-y-1 pb-2 border-b border-border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                      New paid users per month
                                    </span>
                                    <span className="font-semibold text-foreground">
                                      {formatNumber(activationResults.newPaidUsers)} vs{" "}
                                      {formatNumber(activationResults.baselinePaidUsers)} baseline
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Free users × new conversion rate (compared to baseline)
                                  </p>
                                </div>
                              </div>

                              <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                  With your current numbers, improving your free-to-paid
                                  conversion from {activationResults.currentConversionRate}% to{" "}
                                  {activationResults.newConversionRate}% could generate an additional $
                                  {formatNumber(activationResults.revenueGain)} in customer lifetime
                                  value from each month's new conversions — for an estimated ROI of{" "}
                                  {formatNumber(parseFloat(activationResults.roi))}% on a $
                                  {formatNumber(parseFloat(activationInputs.serviceCost))} investment.
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {activationResults && parseFloat(activationResults.roi) >= 0 && (
                    <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 text-center">
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        Want help actually getting this lift?
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        DigiStorms helps you design and generate your onboarding email sequence so you can hit these numbers faster.
                      </p>
                      <Button size="lg" asChild className="w-full sm:w-auto">
                        <a href={appUrl("/email-sequence-generator")}>Generate my first email</a>
                      </Button>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground text-center mt-8 pt-6 border-t border-border">
                    These are estimates based on the numbers you provide and are for
                    illustration only.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Retention Tab */}
            <TabsContent value="retention">
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Input Column */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-foreground mb-6">
                        Your Numbers
                      </h2>

                      <div className="space-y-2">
                        <Label htmlFor="monthlyChurnRate">
                          Monthly churn rate (%)
                        </Label>
                        <Input
                          id="monthlyChurnRate"
                          type="number"
                          placeholder="6"
                          value={retentionInputs.monthlyChurnRate}
                          onChange={(e) =>
                            handleRetentionInputChange("monthlyChurnRate", e.target.value)
                          }
                        />
                        <p className="text-sm text-muted-foreground">
                          Your current gross monthly churn (e.g., 6% means 0.06).
                        </p>
                        {retentionErrors.monthlyChurnRate && (
                          <p className="text-sm text-destructive">{retentionErrors.monthlyChurnRate}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paidUsersPerMonth">Active paid users (your current customer base)</Label>
                        <Input
                          id="paidUsersPerMonth"
                          type="number"
                          placeholder="500"
                          value={retentionInputs.paidUsersPerMonth}
                          onChange={(e) =>
                            handleRetentionInputChange("paidUsersPerMonth", e.target.value)
                          }
                        />
                        <p className="text-sm text-muted-foreground">
                          Your current customer base.
                        </p>
                        {retentionErrors.paidUsersPerMonth && (
                          <p className="text-sm text-destructive">{retentionErrors.paidUsersPerMonth}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="retentionClv">Customer lifetime value (CLV)</Label>
                        <Input
                          id="retentionClv"
                          type="number"
                          placeholder="228"
                          value={retentionInputs.clv}
                          onChange={(e) => handleRetentionInputChange("clv", e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">
                          Average revenue you earn from a customer over their lifetime.
                          <br />
                          <span className="text-xs italic">
                            If unsure: CLV ≈ ARPU × customer lifespan (where lifespan = 1 ÷ churn rate)
                          </span>
                        </p>
                        {retentionErrors.clv && (
                          <p className="text-sm text-destructive">{retentionErrors.clv}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expectedChurnReduction">
                          Expected churn reduction (%)
                        </Label>
                        <Select
                          value={retentionCustomReduction ? "custom" : retentionInputs.expectedChurnReduction}
                          onValueChange={(value) => {
                            if (value === "custom") {
                              setRetentionCustomReduction(true);
                              handleRetentionInputChange("expectedChurnReduction", "");
                            } else {
                              setRetentionCustomReduction(false);
                              handleRetentionInputChange("expectedChurnReduction", value);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select your current situation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">I don't send retention emails → ~30% churn reduction</SelectItem>
                            <SelectItem value="15">I send some retention emails → ~15% churn reduction</SelectItem>
                            <SelectItem value="5">I already have a system → ~5% churn reduction</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {retentionCustomReduction && (
                          <Input
                            type="number"
                            placeholder="Enter custom churn reduction %"
                            value={retentionInputs.expectedChurnReduction}
                            onChange={(e) => handleRetentionInputChange("expectedChurnReduction", e.target.value)}
                          />
                        )}
                        <p className="text-sm text-muted-foreground">
                          Select your current retention email situation.
                        </p>
                        {retentionErrors.expectedChurnReduction && (
                          <p className="text-sm text-destructive">{retentionErrors.expectedChurnReduction}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="retentionServiceCost">Service cost ($)</Label>
                        <Input
                          id="retentionServiceCost"
                          type="number"
                          placeholder="690"
                          value={retentionInputs.serviceCost}
                          onChange={(e) => handleRetentionInputChange("serviceCost", e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">
                          One month of the Concierge plan ($690/month) is enough to achieve these results.
                        </p>
                      </div>

                      <Button
                        onClick={calculateRetentionROI}
                        disabled={isCalculating}
                        className="w-full"
                        size="lg"
                      >
                        {isCalculating ? "Calculating..." : "Calculate ROI"}
                      </Button>
                    </div>

                    {/* Results Column */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-foreground mb-6">
                        Your Results
                      </h2>

                      {!retentionResults ? (
                        <div className="flex items-center justify-center h-full min-h-[300px] text-center">
                          <p className="text-muted-foreground">
                            Enter your numbers and click "Calculate ROI" to see your potential
                            results.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="p-6 bg-primary/10 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-2">
                              Estimated ROI
                            </p>
                            <p
                              className={`text-4xl font-bold ${
                                parseFloat(retentionResults.roi) < 0
                                  ? "text-destructive"
                                  : "text-primary"
                              }`}
                            >
                              {parseFloat(retentionResults.roi) < 0 ? "–" : ""}
                              {formatNumber(Math.abs(parseFloat(retentionResults.roi)))}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              Retention improvements compound over months, which is why ROI can appear unusually high.
                            </p>
                          </div>

                          {parseFloat(retentionResults.roi) < 0 ? (
                            <p className="text-sm text-destructive">
                              No gain with current inputs. Try adjusting your numbers.
                            </p>
                          ) : (
                            <>
                              <div className="space-y-4">
                                <div className="space-y-1 pb-2 border-b border-border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                      New churn rate
                                    </span>
                                    <span className="font-semibold text-foreground">
                                      {retentionResults.oldChurnRate}% → {retentionResults.newChurnRate}%
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Current churn × (1 - churn reduction)
                                  </p>
                                </div>
                                <div className="space-y-1 pb-2 border-b border-border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                      New customer lifespan
                                    </span>
                                    <span className="font-semibold text-foreground">
                                      {retentionResults.oldLifespan} → {retentionResults.newLifespan} months
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    1 / new churn rate
                                  </p>
                                </div>
                                <div className="space-y-1 pb-2 border-b border-border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">New CLV</span>
                                    <span className="font-semibold text-foreground">
                                      ${formatNumber(retentionResults.oldCLV)} → ${formatNumber(retentionResults.newCLV)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Monthly revenue × new lifespan
                                  </p>
                                </div>
                                <div className="space-y-1 pb-2 border-b border-border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                      Extra revenue per year
                                    </span>
                                    <span className="font-semibold text-primary">
                                      ${formatNumber(retentionResults.extraRevenuePerYear)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    (New CLV - Current CLV) × paid users
                                  </p>
                                </div>
                              </div>

                              <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                  With your current numbers, reducing churn from {retentionResults.oldChurnRate}% → {retentionResults.newChurnRate}% increases your customer lifespan from {retentionResults.oldLifespan} months → {retentionResults.newLifespan} months, raising your CLV and generating ${formatNumber(retentionResults.extraRevenuePerYear)} in additional yearly revenue — for an estimated ROI of {formatNumber(parseFloat(retentionResults.roi))}% on a ${formatNumber(parseFloat(retentionInputs.serviceCost))} investment.
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {retentionResults && parseFloat(retentionResults.roi) >= 0 && (
                    <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 text-center">
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        Want help actually getting this lift?
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        DigiStorms helps you design and generate retention emails so you can reduce churn faster.
                      </p>
                      <Button size="lg" asChild className="w-full sm:w-auto">
                        <a href={appUrl("/email-sequence-generator")}>Generate my first email</a>
                      </Button>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground text-center mt-8 pt-6 border-t border-border">
                    These are estimates based on the numbers you provide and are for
                    illustration only.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Expansion Tab */}
            <TabsContent value="expansion">
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Input Column */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-foreground mb-6">
                        Your Numbers
                      </h2>

                      <div className="space-y-2">
                        <Label htmlFor="currentExpansionRevenue">
                          Current monthly expansion revenue per user ($)
                        </Label>
                        <Input
                          id="currentExpansionRevenue"
                          type="number"
                          placeholder="2"
                          value={expansionInputs.currentExpansionRevenue}
                          onChange={(e) =>
                            handleExpansionInputChange("currentExpansionRevenue", e.target.value)
                          }
                        />
                        <p className="text-sm text-muted-foreground">
                          The average expansion revenue generated per user each month (upsells, add-ons, usage, annual upgrades, referrals).
                        </p>
                        {expansionErrors.currentExpansionRevenue && (
                          <p className="text-sm text-destructive">{expansionErrors.currentExpansionRevenue}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="activeCustomers">Number of active customers</Label>
                        <Input
                          id="activeCustomers"
                          type="number"
                          placeholder="500"
                          value={expansionInputs.activeCustomers}
                          onChange={(e) =>
                            handleExpansionInputChange("activeCustomers", e.target.value)
                          }
                        />
                        <p className="text-sm text-muted-foreground">
                          Your current number of paying customers.
                        </p>
                        {expansionErrors.activeCustomers && (
                          <p className="text-sm text-destructive">{expansionErrors.activeCustomers}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expansionClv">Current customer lifetime value (CLV)</Label>
                        <Input
                          id="expansionClv"
                          type="number"
                          placeholder="300"
                          value={expansionInputs.currentCLV}
                          onChange={(e) => handleExpansionInputChange("currentCLV", e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">
                          Average revenue you earn from a customer over their lifetime.
                          <br />
                          <span className="text-xs italic">
                            If unsure: CLV ≈ ARPU × customer lifespan (where lifespan = 1 ÷ churn rate)
                          </span>
                        </p>
                        {expansionErrors.currentCLV && (
                          <p className="text-sm text-destructive">{expansionErrors.currentCLV}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expansionLift">
                          Expected expansion revenue lift (%)
                        </Label>
                        <Select
                          value={expansionCustomLift ? "custom" : expansionInputs.expectedLift}
                          onValueChange={(value) => {
                            if (value === "custom") {
                              setExpansionCustomLift(true);
                              handleExpansionInputChange("expectedLift", "");
                            } else {
                              setExpansionCustomLift(false);
                              handleExpansionInputChange("expectedLift", value);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select your current situation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">I don't send expansion emails → +30% lift</SelectItem>
                            <SelectItem value="15">I send some expansion emails → +15% lift</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {expansionCustomLift && (
                          <Input
                            type="number"
                            placeholder="Enter custom lift %"
                            value={expansionInputs.expectedLift}
                            onChange={(e) => handleExpansionInputChange("expectedLift", e.target.value)}
                          />
                        )}
                        <p className="text-sm text-muted-foreground">
                          Select your current expansion email situation.
                        </p>
                        {expansionErrors.expectedLift && (
                          <p className="text-sm text-destructive">{expansionErrors.expectedLift}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expansionServiceCost">Service cost ($)</Label>
                        <Input
                          id="expansionServiceCost"
                          type="number"
                          placeholder="690"
                          value={expansionInputs.serviceCost}
                          onChange={(e) => handleExpansionInputChange("serviceCost", e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">
                          One month of the Concierge plan ($690/month) is enough to achieve these results.
                        </p>
                      </div>

                      <Button
                        onClick={calculateExpansionROI}
                        disabled={isCalculating}
                        className="w-full"
                        size="lg"
                      >
                        {isCalculating ? "Calculating..." : "Calculate ROI"}
                      </Button>
                    </div>

                    {/* Results Column */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-foreground mb-6">
                        Your Results
                      </h2>

                      {!expansionResults ? (
                        <div className="flex items-center justify-center h-full min-h-[300px] text-center">
                          <p className="text-muted-foreground">
                            Enter your numbers and click "Calculate ROI" to see your potential
                            results.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="p-6 bg-primary/10 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-2">
                              Estimated ROI
                            </p>
                            <p
                              className={`text-4xl font-bold ${
                                parseFloat(expansionResults.roi) < 0
                                  ? "text-destructive"
                                  : "text-primary"
                              }`}
                            >
                              {parseFloat(expansionResults.roi) < 0 ? "–" : ""}
                              {formatNumber(Math.abs(parseFloat(expansionResults.roi)))}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              Expansion revenue compounds over time as more customers upgrade. Because expansion stacks monthly, ROI can appear unusually high.
                            </p>
                          </div>

                          {parseFloat(expansionResults.roi) < 0 ? (
                            <p className="text-sm text-destructive">
                              No gain with current inputs. Try adjusting your numbers.
                            </p>
                          ) : (
                            <>
                              <div className="space-y-4">
                                <div className="space-y-1 pb-2 border-b border-border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                      New expansion revenue per user
                                    </span>
                                    <span className="font-semibold text-foreground">
                                      ${expansionResults.oldExpansionRevenue} → ${expansionResults.newExpansionRevenue}/mo
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Current × (1 + lift %)
                                  </p>
                                </div>
                                <div className="space-y-1 pb-2 border-b border-border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">New CLV</span>
                                    <span className="font-semibold text-foreground">
                                      ${formatNumber(expansionResults.oldCLV)} → ${formatNumber(expansionResults.newCLV)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Current CLV + (monthly increase × 12)
                                  </p>
                                </div>
                                <div className="space-y-1 pb-2 border-b border-border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                      Extra revenue per year
                                    </span>
                                    <span className="font-semibold text-primary">
                                      ${formatNumber(expansionResults.extraRevenuePerYear)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Monthly increase × customers × 12
                                  </p>
                                </div>
                              </div>

                              <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                  With your current numbers, increasing expansion revenue per user from ${expansionResults.oldExpansionRevenue} to ${expansionResults.newExpansionRevenue}/mo could generate ${formatNumber(expansionResults.extraRevenuePerYear)} in additional yearly revenue — for an estimated ROI of {formatNumber(parseFloat(expansionResults.roi))}% on a ${formatNumber(parseFloat(expansionInputs.serviceCost))} investment.
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {expansionResults && parseFloat(expansionResults.roi) >= 0 && (
                    <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 text-center">
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        Want help actually getting this lift?
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        DigiStorms helps you design and generate upsell, upgrade, and referral emails so you can grow expansion revenue faster.
                      </p>
                      <Button size="lg" asChild className="w-full sm:w-auto">
                        <a href={appUrl("/email-sequence-generator")}>Generate my first email</a>
                      </Button>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground text-center mt-8 pt-6 border-t border-border">
                    These are estimates based on the numbers you provide and are for
                    illustration only.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
}

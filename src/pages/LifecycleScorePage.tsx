import { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { appUrl } from "@/config/appUrl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, RotateCcw, ArrowRight, Calendar } from "lucide-react";

// Quiz questions data
const questions = [
  {
    id: 1,
    question: "Do you send a welcome email within minutes of someone signing up?",
    helper: "The first email sets the tone. Fast, warm welcomes improve activation and reduce early drop-off.",
    gapText: "No immediate welcome email for new signups",
  },
  {
    id: 2,
    question: "Do you send a structured onboarding sequence (3+ emails) guiding new users to their first win?",
    helper: "A single welcome email isn't enough. A sequence walks users step by step toward the moment they get real value.",
    gapText: "No structured onboarding sequence",
  },
  {
    id: 3,
    question: "Do you automatically nudge users who sign up but never complete a key action (e.g. creating a project, connecting an integration, inviting a teammate)?",
    helper: "Most signups stall before they reach value. A well-timed nudge can double your activation rate.",
    gapText: "No behavior-triggered nudge for incomplete setup",
  },
  {
    id: 4,
    question: "Do you send a follow-up email if a user ignores your first nudge and still hasn't re-engaged?",
    helper: "One nudge isn't enough. A short 2–3 email follow-up sequence recovers users who would otherwise ghost.",
    gapText: "No follow-up sequence after the first nudge",
  },
  {
    id: 5,
    question: "Do you email users when they hit a meaningful milestone — like their first project, their 10th action, or reaching a usage threshold?",
    helper: "Milestone emails reinforce momentum, build emotional connection, and create natural moments to ask for referrals or upgrades.",
    gapText: "No milestone celebration emails",
  },
  {
    id: 6,
    question: "Do you send upgrade emails triggered by usage signals — like hitting limits, completing onboarding, or becoming a power user?",
    helper: "Upgrade emails sent at the right moment — when a user just got value — convert far better than blanket campaigns.",
    gapText: "No behavior-triggered upgrade emails",
  },
];

// Score tier configuration
const getTierInfo = (score: number) => {
  if (score <= 1) {
    return {
      label: "Leaking Users",
      description: "Your onboarding is leaving a lot on the table. Most signups are probably not reaching value — and many are churning silently without you ever knowing.",
      mood: "worried",
      color: "text-red-500",
    };
  } else if (score <= 4) {
    return {
      label: "Getting There",
      description: "You've got some onboarding in place, but there are still meaningful gaps. A few targeted flows could meaningfully improve how many free users convert to paid.",
      mood: "neutral",
      color: "text-yellow-500",
    };
  } else {
    return {
      label: "Onboarding Pro",
      description: "Strong work — your onboarding is more complete than most teams. A few final upgrades and you'll have a fully automated system moving users from signup to paid.",
      mood: "excited",
      color: "text-green-500",
    };
  }
};

// Stormi character component
const StormiCharacter = ({ mood }: { mood: "curious" | "worried" | "neutral" | "excited" }) => {
  const expressions = {
    curious: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="35" fill="hsl(var(--primary))" opacity="0.1" />
        <circle cx="40" cy="40" r="28" fill="hsl(var(--primary))" opacity="0.2" />
        <circle cx="40" cy="40" r="20" fill="hsl(var(--primary))" />
        <circle cx="34" cy="36" r="4" fill="white" />
        <circle cx="46" cy="36" r="4" fill="white" />
        <circle cx="35" cy="35" r="2" fill="hsl(var(--primary-foreground))" />
        <circle cx="47" cy="35" r="2" fill="hsl(var(--primary-foreground))" />
        <path d="M35 48 Q40 52 45 48" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    ),
    worried: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="35" fill="hsl(var(--destructive))" opacity="0.1" />
        <circle cx="40" cy="40" r="28" fill="hsl(var(--destructive))" opacity="0.2" />
        <circle cx="40" cy="40" r="20" fill="hsl(var(--destructive))" />
        <circle cx="34" cy="36" r="4" fill="white" />
        <circle cx="46" cy="36" r="4" fill="white" />
        <circle cx="35" cy="37" r="2" fill="hsl(var(--destructive-foreground))" />
        <circle cx="47" cy="37" r="2" fill="hsl(var(--destructive-foreground))" />
        <path d="M35 50 Q40 46 45 50" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    ),
    neutral: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="35" fill="hsl(45 93% 47%)" opacity="0.1" />
        <circle cx="40" cy="40" r="28" fill="hsl(45 93% 47%)" opacity="0.2" />
        <circle cx="40" cy="40" r="20" fill="hsl(45 93% 47%)" />
        <circle cx="34" cy="36" r="4" fill="white" />
        <circle cx="46" cy="36" r="4" fill="white" />
        <circle cx="35" cy="36" r="2" fill="hsl(var(--foreground))" />
        <circle cx="47" cy="36" r="2" fill="hsl(var(--foreground))" />
        <path d="M35 48 Q40 50 45 48" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    ),
    excited: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="35" fill="hsl(142 76% 36%)" opacity="0.1" />
        <circle cx="40" cy="40" r="28" fill="hsl(142 76% 36%)" opacity="0.2" />
        <circle cx="40" cy="40" r="20" fill="hsl(142 76% 36%)" />
        <circle cx="34" cy="36" r="4" fill="white" />
        <circle cx="46" cy="36" r="4" fill="white" />
        <circle cx="35" cy="35" r="2" fill="hsl(var(--foreground))" />
        <circle cx="47" cy="35" r="2" fill="hsl(var(--foreground))" />
        <path d="M33 46 Q40 54 47 46" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
        <line x1="28" y1="28" x2="24" y2="22" stroke="hsl(142 76% 36%)" strokeWidth="2" strokeLinecap="round" />
        <line x1="52" y1="28" x2="56" y2="22" stroke="hsl(142 76% 36%)" strokeWidth="2" strokeLinecap="round" />
        <line x1="40" y1="16" x2="40" y2="10" stroke="hsl(142 76% 36%)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  };
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {expressions[mood]}
    </motion.div>
  );
};

// Analytics event stubs — wire to posthog/gtag/etc. when ready
const trackEvent = (_eventName: string, _data?: Record<string, unknown>) => {
  // no-op until analytics is configured
};

export default function LifecycleScorePage() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showResults, setShowResults] = useState(false);

  const scrollToQuiz = () => {
    const quizSection = document.getElementById("quiz-section");
    if (quizSection) {
      quizSection.scrollIntoView({ behavior: "smooth" });
    }
    if (!quizStarted) {
      setQuizStarted(true);
      trackEvent("quiz_start");
    }
  };

  const handleAnswer = useCallback((answer: boolean) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Quiz complete
      const score = newAnswers.filter(Boolean).length;
      const tier = getTierInfo(score).label;
      trackEvent("quiz_complete", { score, tier });
      setShowResults(true);
    }
  }, [answers, currentQuestion]);

  const handleRetake = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setQuizStarted(true);
    trackEvent("quiz_start");
  };

  const handleCtaClick = (ctaType: "generate_email" | "book_call") => {
    trackEvent("quiz_cta_click", { cta_type: ctaType });
  };

  const score = answers.filter(Boolean).length;
  const tierInfo = getTierInfo(score);
  const gaps = answers
    .map((answer, index) => (!answer ? questions[index].gapText : null))
    .filter(Boolean);

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Check Your Onboarding Score | DigiStorms</title>
        <meta name="description" content="See how well you onboard new users in 60 seconds. Discover gaps in your welcome, activation, milestone, and upgrade emails — and fix them automatically." />
        <link rel="canonical" href="https://digistorms.ai/lifecycle-score" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Check Your Onboarding Score | DigiStorms" />
        <meta property="og:description" content="See how well you onboard new users in 60 seconds. Discover gaps in your welcome, activation, milestone, and upgrade emails." />
        <meta property="og:url" content="https://digistorms.ai/lifecycle-score" />
      </Helmet>
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Check your onboarding score in 60 seconds.
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Answer 6 quick questions to see how well you welcome new users, celebrate milestones, nudge the ones who stall, follow up when they go quiet, and upgrade them at the right time.
                </p>
                <Button
                  size="lg"
                  onClick={scrollToQuiz}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
                >
                  Check my score
                  <ChevronDown className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <div className="flex-shrink-0">
                <StormiCharacter mood="curious" />
              </div>
            </div>
          </div>
        </section>

        {/* Quiz Section */}
        <section id="quiz-section" className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="shadow-lg border-border">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <StormiCharacter mood={showResults ? tierInfo.mood as "worried" | "neutral" | "excited" : "curious"} />
                </div>
                <CardTitle className="text-2xl font-bold">
                  {showResults ? "Your Onboarding Score" : "Your Onboarding Score"}
                </CardTitle>
                {!showResults && (
                  <p className="text-muted-foreground mt-2">
                    Answer 6 quick yes/no questions about how you onboard new users.
                  </p>
                )}
              </CardHeader>

              <CardContent>
                <AnimatePresence mode="wait">
                  {!showResults ? (
                    <motion.div
                      key={`question-${currentQuestion}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Progress bar */}
                      <div className="mb-6">
                        <Progress value={progress} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-2 text-center">
                          Question {currentQuestion + 1} of {questions.length}
                        </p>
                      </div>

                      {/* Question */}
                      <div className="mb-8">
                        <h3 className="text-lg font-medium text-foreground mb-3">
                          {questions[currentQuestion].question}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {questions[currentQuestion].helper}
                        </p>
                      </div>

                      {/* Answer buttons */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          variant="outline"
                          size="lg"
                          className="flex-1 py-6 text-lg border-2 hover:bg-green-50 hover:border-green-500 hover:text-green-700 dark:hover:bg-green-950 dark:hover:border-green-400 dark:hover:text-green-300"
                          onClick={() => handleAnswer(true)}
                        >
                          Yes
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="flex-1 py-6 text-lg border-2 hover:bg-red-50 hover:border-red-500 hover:text-red-700 dark:hover:bg-red-950 dark:hover:border-red-400 dark:hover:text-red-300"
                          onClick={() => handleAnswer(false)}
                        >
                          No
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      {/* Score display */}
                      <div className="text-center mb-8">
                        <div className={`text-6xl font-bold ${tierInfo.color} mb-2`}>
                          {score} / 6
                        </div>
                        <div className={`text-2xl font-semibold ${tierInfo.color}`}>
                          {tierInfo.label}
                        </div>
                        <p className="text-muted-foreground mt-4 max-w-md mx-auto">
                          {tierInfo.description}
                        </p>
                      </div>

                      {/* Gaps detected */}
                      {gaps.length > 0 && (
                        <div className="mb-8">
                          <h4 className="font-semibold text-foreground mb-3">
                            Gaps detected:
                          </h4>
                          <ul className="space-y-2">
                            {gaps.map((gap, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-muted-foreground"
                              >
                                <span className="text-destructive">•</span>
                                {gap}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Summary */}
                      <p className="text-muted-foreground mb-8 p-4 bg-muted/50 rounded-lg">
                        DigiStorms can build every one of these flows for you automatically — welcome emails, nudges, milestone triggers, reactivation sequences, and upgrade emails — all based on real user behavior.
                      </p>

                      {/* CTAs */}
                      <div className="space-y-4">
                        <a
                          href={appUrl("/email-sequence-generator")}
                          onClick={() => handleCtaClick("generate_email")}
                        >
                          <Button
                            size="lg"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                          >
                            Build my onboarding emails
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </a>

                        <a
                          href="https://calendly.com/jonathan-digistorms/30-min-call"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleCtaClick("book_call")}
                          className="block"
                        >
                          <Button
                            variant="ghost"
                            size="lg"
                            className="w-full text-muted-foreground hover:text-foreground"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Prefer talking to an expert? Book a strategy call
                          </Button>
                        </a>

                        <div className="pt-4 border-t border-border">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRetake}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Retake quiz
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MeshBackground } from "@/components/site/mesh-background";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Buyer Onboarding — Loomly" },
      { name: "description", content: "A four-minute conversational setup that tunes fabric recommendations to your industry, budget and MOQ." },
      { property: "og:title", content: "Conversational buyer onboarding — Loomly" },
      { property: "og:description", content: "Tell Loom AI what you make. Get a personalised sourcing feed." },
    ],
  }),
  component: Onboarding,
});

const steps = [
  { key: "industry", q: "What do you manufacture?", options: ["Apparel & fashion", "Home textiles", "Technical & workwear", "Accessories"] },
  { key: "type", q: "How would you describe your business?", options: ["Emerging label", "Established brand", "Contract manufacturer", "Sourcing agency"] },
  { key: "budget", q: "Typical budget per metre?", options: ["Under ₹300", "₹300 – ₹800", "₹800 – ₹2,000", "Above ₹2,000"] },
  { key: "fabric", q: "Which materials matter most?", options: ["Cotton & blends", "Silk & luxury", "Linen & hemp", "Wool & suiting"] },
  { key: "moq", q: "What order volume do you usually place?", options: ["Under 200 m", "200 – 1,000 m", "1,000 – 5,000 m", "5,000 m+"] },
];

function Onboarding() {
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<string[]>([]);
  const done = step >= steps.length;
  const current = steps[step];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-28">
      <MeshBackground />
      <div className="relative w-full max-w-2xl">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="text-xs text-muted-foreground">
            Step {Math.min(step + 1, steps.length)} of {steps.length}
          </span>
        </div>
        <Progress value={(Math.min(step, steps.length) / steps.length) * 100} className="mt-5 h-1.5" />

        <div className="glass-strong mt-8 rounded-3xl p-8 shadow-lift sm:p-10">
          <div className="space-y-6">
            {answers.map((a, i) => (
              <div key={i} className="space-y-3">
                <p className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  {steps[i]?.q}
                </p>
                <p className="ml-auto w-max max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  {a}
                </p>
              </div>
            ))}

            <AnimatePresence mode="wait">
              {done ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 16 }}
                    className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-ai"
                  >
                    <Check className="size-6 text-primary-foreground" />
                  </motion.span>
                  <h2 className="mt-6 text-xl font-semibold">Your sourcing feed is ready</h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Loom AI matched 214 fabrics across 38 verified mills to your profile, ranked by
                    landed cost and lead time. Recommendations improve with every order.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button size="lg" asChild>
                      <Link to="/marketplace">See my matches <ArrowRight /></Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/dashboard/buyer">Open dashboard</Link>
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="flex items-start gap-3 text-base font-medium leading-relaxed">
                    <Sparkles className="mt-1 size-4 shrink-0 text-primary" />
                    {current?.q}
                  </p>
                  <div className="mt-6 grid gap-2 sm:grid-cols-2">
                    {current?.options.map((o) => (
                      <button
                        key={o}
                        onClick={() => {
                          setAnswers((a) => [...a, o]);
                          setStep((s) => s + 1);
                        }}
                        className={cn(
                          "rounded-xl border border-border bg-surface px-4 py-3.5 text-left text-sm font-medium transition-all duration-300",
                          "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft",
                        )}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

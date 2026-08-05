import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { MeshBackground } from "@/components/site/mesh-background";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding — Loomly" },
      { name: "description", content: "Onboarding setup for Loomly marketplace profiles." },
    ],
  }),
  component: Onboarding,
});

interface OnboardingStep {
  key: string;
  q: string;
  options?: string[];
  isInput?: boolean;
  placeholder?: string;
}

const buyerSteps: OnboardingStep[] = [
  { key: "industry", q: "What do you manufacture?", options: ["Apparel & fashion", "Home textiles", "Technical & workwear", "Accessories"] },
  { key: "type", q: "How would you describe your business?", options: ["Emerging label", "Established brand", "Contract manufacturer", "Sourcing agency"] },
  { key: "budget", q: "Typical budget per metre?", options: ["Under ₹300", "₹300 – ₹800", "₹800 – ₹2,000", "Above ₹2,000"] },
  { key: "fabric", q: "Which materials matter most?", options: ["Cotton & blends", "Silk & luxury", "Linen & hemp", "Wool & suiting"] },
  { key: "moq", q: "What order volume do you usually place?", options: ["Under 200 m", "200 – 1,000 m", "1,000 – 5,000 m", "5,000 m+"] },
];

const supplierSteps: OnboardingStep[] = [
  { key: "companyName", q: "What is your mill or business name?", isInput: true, placeholder: "e.g., Arvind Weaving House" },
  { key: "location", q: "Where is your mill located? (City, Country)", isInput: true, placeholder: "e.g., Ahmedabad, India" },
  { key: "categories", q: "Which fabric categories do you specialize in?", options: ["Cotton & Denim", "Silk & luxury", "Linen & hemp", "Wool & suiting"] },
  { key: "moq", q: "What is your standard Minimum Order Quantity (MOQ)?", options: ["No MOQ", "Under 100 m", "100 – 300 m", "300 m+"] },
  { key: "about", q: "Tell us briefly about your mill's weaving heritage or capacity", isInput: true, placeholder: "e.g., 3 generations of air-jet weaving, serving global labels..." }
];

function Onboarding() {
  const { user, profile } = useAuth();
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<string[]>([]);
  const [inputValue, setInputValue] = React.useState("");

  const activeSteps = profile?.role === "supplier" ? supplierSteps : buyerSteps;
  const done = step >= activeSteps.length;
  const current = activeSteps[step];

  const savePreferences = React.useCallback(async (ans: string[]) => {
    if (!user) {
      localStorage.setItem("loomly_guest_onboarding", JSON.stringify(ans));
      return;
    }

    try {
      if (profile?.role === "supplier") {
        const companyName = ans[0] || "My Mill";
        const locationStr = ans[1] || "";
        const cityParts = locationStr.split(",");
        const city = cityParts[0]?.trim() || "Unknown City";
        const country = cityParts[1]?.trim() || "India";
        const categoryVal = ans[2] || "Cotton & Denim";
        const moqText = ans[3] || "No MOQ";
        const moqVal = moqText === "No MOQ" ? 0 : moqText === "Under 100 m" ? 50 : moqText === "100 – 300 m" ? 150 : 300;
        const aboutText = ans[4] || "";

        const { error } = await supabase.from("suppliers").upsert({
          id: user.id,
          name: companyName,
          city,
          country,
          categories: [categoryVal],
          moq: moqVal,
          about: aboutText,
          verified: true,
          rating: 5.0,
          orders_count: 0,
          response_hours: 2,
          hours: "Mon–Fri · 09:00–18:00 Local",
        });

        if (error) throw error;
        toast.success("Mill profile initialized successfully!");
      } else {
        const { error } = await supabase.from("buyers").upsert({
          id: user.id,
          industry: ans[0],
          business_type: ans[1],
          typical_budget: ans[2],
          preferred_materials: [ans[3]],
          typical_volume: ans[4],
        });

        if (error) throw error;
        toast.success("Sourcing preferences saved to your profile!");
      }
    } catch (err: any) {
      console.error("Error saving preferences:", err.message);
      toast.error("Failed to sync preferences to account.");
    }
  }, [user, profile]);

  const handleSelect = async (option: string) => {
    const nextAnswers = [...answers, option];
    setAnswers(nextAnswers);
    setStep((s) => s + 1);

    if (step + 1 >= activeSteps.length) {
      await savePreferences(nextAnswers);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-28">
      <MeshBackground />
      <div className="relative w-full max-w-2xl">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="text-xs text-muted-foreground">
            Step {Math.min(step + 1, activeSteps.length)} of {activeSteps.length}
          </span>
        </div>
        <Progress value={(Math.min(step, activeSteps.length) / activeSteps.length) * 100} className="mt-5 h-1.5" />

        <div className="glass-strong mt-8 rounded-3xl p-8 shadow-lift sm:p-10">
          <div className="space-y-6">
            {answers.map((a, i) => (
              <div key={i} className="space-y-3">
                <p className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  {activeSteps[i]?.q}
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
                  
                  {profile?.role === "supplier" ? (
                    <>
                      <h2 className="mt-6 text-xl font-semibold">Your mill workspace is ready</h2>
                      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                        Loom AI has initialized your digital showroom. List your catalog fabrics and manage incoming buyer contracts from one unified workspace.
                      </p>
                      <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Button size="lg" asChild>
                          <Link to="/dashboard/supplier">Go to Dashboard <ArrowRight /></Link>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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

                  {current?.isInput ? (
                    <div className="mt-6 space-y-4">
                      <Input
                        placeholder={current.placeholder}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && inputValue.trim()) {
                            e.preventDefault();
                            handleSelect(inputValue.trim());
                            setInputValue("");
                          }
                        }}
                        className="h-12 text-sm bg-surface"
                        required
                      />
                      <Button 
                        size="lg" 
                        className="w-full sm:w-auto"
                        disabled={!inputValue.trim()}
                        onClick={() => {
                          handleSelect(inputValue.trim());
                          setInputValue("");
                        }}
                      >
                        Continue
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-2 sm:grid-cols-2">
                      {current?.options?.map((o) => (
                        <button
                          key={o}
                          onClick={() => handleSelect(o)}
                          className={cn(
                            "rounded-xl border border-border bg-surface px-4 py-3.5 text-left text-sm font-medium transition-all duration-300",
                            "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft",
                          )}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

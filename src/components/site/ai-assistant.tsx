import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Mic, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface Msg {
  role: "user" | "assistant";
  text: string;
}

const suggestions = [
  "Find sustainable cotton under ₹300",
  "Compare silk charmeuse vs voile",
  "Best fabric for MOQ 100",
  "Recommended suppliers in Italy",
];

export function AiAssistant() {
  const { profile } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const [messages, setMessages] = React.useState<Msg[]>([
    {
      role: "assistant",
      text: "I'm Loom, your sourcing copilot. Describe the fabric you need in plain language — weight, hand-feel, budget, certification, MOQ — and I'll surface matching mills.",
    },
  ]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  // Hide the floating chatbot completely for Suppliers
  if (profile?.role === "supplier") {
    return null;
  }

  const send = (text: string) => {
    if (!text.trim() || streaming) return;
    
    // Add user message to state
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setStreaming(true);

    // Call backend Chat endpoint
    fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          ...messages.map((m) => ({
            role: m.role,
            content: m.text,
          })),
          { role: "user", content: text },
        ],
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network error contacting Loom AI.");
        return res.json() as Promise<{ text: string }>;
      })
      .then((data) => {
        const full = data.text;
        let i = 0;
        setMessages((m) => [...m, { role: "assistant", text: "" }]);
        const timer = setInterval(() => {
          i += 4;
          setMessages((m) => {
            const next = [...m];
            next[next.length - 1] = { role: "assistant", text: full.slice(0, i) };
            return next;
          });
          if (i >= full.length) {
            clearInterval(timer);
            setStreaming(false);
          }
        }, 16);
      })
      .catch((err) => {
        console.error("Loom AI chat call failed:", err);
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: "Sorry, I had trouble reaching my AI core. Please check your network and try again.",
          },
        ]);
        setStreaming(false);
      });
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AI assistant" : "Open AI sourcing assistant"}
        aria-expanded={open}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-6 right-6 z-50 flex h-14 items-center gap-2.5 rounded-full bg-gradient-ai px-5 text-sm font-semibold text-primary-foreground shadow-glow"
      >
        {open ? <X className="size-5" /> : <Sparkles className="size-5" />}
        <span className="hidden sm:inline">{open ? "Close" : "Ask Loom AI"}</span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-label="Loom AI sourcing assistant"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="gradient-ring glass-strong fixed bottom-24 right-4 z-50 flex h-[32rem] w-[calc(100vw-2rem)] max-w-[26rem] flex-col overflow-hidden rounded-3xl shadow-lift sm:right-6"
          >
            <header className="flex items-center gap-3 border-b border-border px-5 py-4">
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-ai">
                <Sparkles className="size-4 text-primary-foreground" />
              </span>
              <div>
                <p className="text-sm font-semibold">Loom AI</p>
                <p className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-success" />
                  Semantic search over 10,412 fabrics
                </p>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[88%] text-sm leading-relaxed",
                      m.role === "user"
                        ? "rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground"
                        : "text-foreground",
                    )}
                  >
                    {m.text}
                    {streaming && i === messages.length - 1 ? (
                      <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-primary align-middle" />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-4 pb-4 pt-3">
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-[0.7rem] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2"
              >
                <button
                  type="button"
                  aria-label="Voice search"
                  className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                >
                  <Mic className="size-4" />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe the fabric you need…"
                  aria-label="Message Loom AI"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle"
                />
                <button
                  type="submit"
                  disabled={streaming || !input.trim()}
                  aria-label="Send message"
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-ai text-primary-foreground transition-opacity disabled:opacity-40"
                >
                  <ArrowUp className="size-4" />
                </button>
              </form>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, ExternalLink, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { products, fabricImages } from "@/lib/data";

interface Msg {
  role: "user" | "assistant";
  text: string;
}

interface ProductResult {
  productId: string;
  name: string;
  image?: string;
  gsm?: number | string;
  width?: string;
  price?: number | string;
  unit?: string;
  moq?: string | number;
  certifications?: string[];
  description?: string;
}

function getEnrichedProduct(item: Partial<ProductResult>): ProductResult {
  const rawId = (item.productId || "").toLowerCase();
  const rawName = (item.name || "").toLowerCase();

  const catalogProduct = products.find((p) => {
    const pId = p.id.toLowerCase();
    const pName = p.name.toLowerCase();
    return (
      (rawId && (pId === rawId || pId.includes(rawId) || rawId.includes(pId))) ||
      (rawName && (pName === rawName || pName.includes(rawName) || rawName.includes(pName)))
    );
  });

  return {
    productId: catalogProduct?.id || item.productId || "organic-cotton-poplin",
    name: item.name || catalogProduct?.name || "Textile Fabric",
    image: catalogProduct?.image || item.image || fabricImages.cotton,
    gsm: item.gsm ?? catalogProduct?.gsm ?? "120",
    width: item.width || (catalogProduct ? `${catalogProduct.widthCm} cm` : "148 cm"),
    price: item.price ?? catalogProduct?.pricePerMetre ?? 200,
    unit: item.unit || "metre",
    moq: item.moq ?? (catalogProduct ? `${catalogProduct.moq} m` : "100 m"),
    certifications:
      item.certifications && item.certifications.length > 0
        ? item.certifications
        : catalogProduct?.certifications || ["GOTS", "OEKO-TEX 100"],
    description:
      item.description ||
      catalogProduct?.subtitle ||
      catalogProduct?.description ||
      "High quality textile fabric from verified mill.",
  };
}

function ProductResultCard({ item }: { item: ProductResult }) {
  const product = getEnrichedProduct(item);
  const detailUrl = `/products/${product.productId}`;

  return (
    <div className="group relative rounded-2xl border border-border/80 bg-surface/90 p-3.5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
      <div className="flex gap-3">
        {/* Fabric Image */}
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Details Header & Specs */}
        <div className="min-w-0 flex-1 space-y-1">
          <a
            href={detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="line-clamp-1 text-sm font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <span className="text-xs">🌿</span>
            <span className="truncate">{product.name}</span>
          </a>

          {/* GSM & Width */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{product.gsm} GSM</span>
            <span>•</span>
            <span>{product.width}</span>
          </div>

          {/* Price & MOQ */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-xs font-bold text-primary">
              ₹{product.price} <span className="text-[0.7rem] font-normal text-muted-foreground">/ {product.unit || "metre"}</span>
            </span>
            <span className="text-[0.7rem] font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
              MOQ: {product.moq}
            </span>
          </div>
        </div>
      </div>

      {/* Certifications & Description */}
      <div className="mt-2.5 space-y-1.5 border-t border-border/40 pt-2">
        {product.certifications && product.certifications.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {product.certifications.map((cert, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-md bg-accent/60 px-1.5 py-0.5 text-[0.65rem] font-semibold text-foreground"
              >
                {cert}
              </span>
            ))}
          </div>
        ) : null}

        {product.description ? (
          <p className="text-[0.75rem] text-muted-foreground line-clamp-2 leading-snug">
            {product.description}
          </p>
        ) : null}
      </div>

      {/* View Product CTA */}
      <a
        href={detailUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-ai px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-95 active:scale-[0.98]"
      >
        <span>View Product</span>
        <ExternalLink className="size-3.5" />
      </a>
    </div>
  );
}

function parseAssistantResponse(text: string): {
  introText?: string;
  products?: ProductResult[];
  rawText?: string;
} {
  if (!text) return {};

  // 1. Try parsing JSON block (e.g. ```json { ... } ``` or raw JSON object)
  const jsonBlockMatch =
    text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
    text.match(/(\{[\s\S]*"type"\s*:\s*"product_results"[\s\S]*\})/);

  if (jsonBlockMatch) {
    try {
      const rawJson = jsonBlockMatch[1] || jsonBlockMatch[0];
      const parsed = JSON.parse(rawJson);
      if (parsed && parsed.type === "product_results" && Array.isArray(parsed.products)) {
        return {
          introText: parsed.intro || text.split("```")[0].trim(),
          products: parsed.products,
        };
      }
    } catch {
      // Fallback if partial JSON during streaming
    }
  }

  // 2. Check for Markdown Table syntax (lines containing | col | col |)
  const lines = text.split("\n");
  const tableLines: string[] = [];
  const nonTableLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      tableLines.push(trimmed);
    } else {
      nonTableLines.push(line);
    }
  }

  if (tableLines.length >= 2) {
    const parsedProducts: ProductResult[] = [];
    // Index 0 = Header, Index 1 = Divider (|---|---|)
    for (let i = 2; i < tableLines.length; i++) {
      const row = tableLines[i];
      const cells = row
        .split("|")
        .map((c) => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

      if (cells.length >= 2) {
        const rawFabricCell = cells[0] || "";
        const rawWeightCell = cells[1] || "";
        const rawPriceCell = cells[2] || "";
        const rawMoqCell = cells[3] || "";
        const rawCertCell = cells[4] || "";
        const rawDescCell = cells[5] || "";

        let name = rawFabricCell.replace(/\[([^\]]+)\]\(([^)]+)\)/, "$1").replace(/\*\*/g, "").trim();
        let productId = "";
        const linkMatch = rawFabricCell.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch && linkMatch[2]) {
          productId = linkMatch[2].replace(/^.*\/products\//, "").replace(/^\//, "").trim();
        }

        const gsmMatch = rawWeightCell.match(/(\d+)\s*gsm/i);
        const widthMatch = rawWeightCell.match(/(\d+\s*cm)/i);
        const priceMatch = rawPriceCell.match(/₹?\s*(\d+(?:\.\d+)?)/);

        parsedProducts.push({
          productId: productId || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name: name,
          gsm: gsmMatch ? parseInt(gsmMatch[1], 10) : undefined,
          width: widthMatch ? widthMatch[1] : undefined,
          price: priceMatch ? parseFloat(priceMatch[1]) : rawPriceCell.replace(/^₹/, "").trim(),
          moq: rawMoqCell,
          certifications: rawCertCell
            ? rawCertCell.split(/[,•]/).map((s) => s.trim()).filter(Boolean)
            : [],
          description: rawDescCell,
        });
      }
    }

    if (parsedProducts.length > 0) {
      return {
        introText: nonTableLines.join("\n").trim(),
        products: parsedProducts,
      };
    }
  }

  return {
    rawText: text,
  };
}

function formatMessageText(rawText: string) {
  if (!rawText) return "";

  // Strip raw HTML tags & localhost URLs
  let text = rawText
    .replace(/<[^>]*>?/gm, "")
    .replace(/http:\/\/localhost:\d+/gi, "")
    .replace(/https?:\/\/localhost:\d+/gi, "");

  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    const [_, linkText = "", url = ""] = match;
    const startIndex = match.index;

    if (startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, startIndex));
    }

    const cleanUrl = url.startsWith("http") ? url : url.startsWith("/") ? url : `/${url}`;
    const isInternal = cleanUrl.startsWith("/");

    parts.push(
      <a
        key={startIndex}
        href={cleanUrl}
        target={isInternal ? "_blank" : "_blank"}
        rel="noopener noreferrer"
        className="font-semibold text-primary underline underline-offset-4 decoration-primary/45 transition-colors hover:text-primary/80"
      >
        {linkText}
      </a>
    );

    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  if (parts.length === 0) {
    parts.push(text);
  }

  return parts.map((part, index) => {
    if (typeof part !== "string") return part;

    const boldRegex = /\*\*([^*]+)\*\*/g;
    const subParts: React.ReactNode[] = [];
    let subLastIndex = 0;
    let subMatch;

    while ((subMatch = boldRegex.exec(part)) !== null) {
      const [_, boldText] = subMatch;
      const subStartIndex = subMatch.index;

      if (subStartIndex > subLastIndex) {
        subParts.push(part.substring(subLastIndex, subStartIndex));
      }

      subParts.push(
        <strong key={subStartIndex} className="font-semibold text-foreground">
          {boldText}
        </strong>
      );

      subLastIndex = boldRegex.lastIndex;
    }

    if (subLastIndex < part.length) {
      subParts.push(part.substring(subLastIndex));
    }

    return <span key={index}>{subParts}</span>;
  });
}

const suggestions = [
  "Find sustainable cotton under ₹300",
  "Compare silk charmeuse vs voile",
  "Best fabric for MOQ 100",
  "Recommended suppliers in Italy",
];

export function openAiAssistant(detail?: { product: any; supplier?: any }) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("texora:open-ai-assistant", { detail }));
  }
}

function buildProductContextString(product: any, supplier?: any): string {
  const supplierName = supplier?.name || "Verified Mill";
  const supplierLoc = supplier ? `${supplier.city}, ${supplier.country}` : "India";
  const supplierSince = supplier?.since || 2020;
  const supplierRating = supplier?.rating || 4.8;
  const supplierOrders = supplier?.orders ? Number(supplier.orders).toLocaleString("en-IN") : "1,000+";
  const supplierResponse = supplier?.responseHours ? `${supplier.responseHours}h` : "24h";

  return `
The user is currently viewing ${product.name}. Use the following product information as primary context when answering questions:

Product: ${product.name}
Composition: ${product.composition}
Price: ₹${product.pricePerMetre} / metre
MOQ: ${product.moq} metres
Lead time: ${product.leadTimeDays} days
Sampling: Free
Supplier: ${supplierName}
Supplier Location: ${supplierLoc}
Supplier Since: ${supplierSince}
Supplier Rating: ${supplierRating}
Supplier Orders: ${supplierOrders}
Supplier Response Time: ${supplierResponse}
Certifications: ${(product.certifications || []).join(", ") || "Standard Mill Certification"}

Specifications:
Weight: ${product.gsm} GSM
Width: ${product.widthCm} cm
Material: ${product.material}
Finish: ${product.subtitle}

Commercial Terms:
Price: ₹${product.pricePerMetre} / metre
MOQ: ${product.moq} metres
Lead time: ${product.leadTimeDays} days
Availability: ${product.availability}
Stock: ${(product.stockMetres || 10000).toLocaleString("en-IN")} metres

Description:
${product.description}
`.trim();
}

export function AiAssistant() {
  const { profile } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const [activeProductCtx, setActiveProductCtx] = React.useState<{ product: any; supplier?: any } | null>(null);
  const [messages, setMessages] = React.useState<Msg[]>([
    {
      role: "assistant",
      text: "I'm Texora, your sourcing copilot. Describe the fabric you need in plain language — weight, hand-feel, budget, certification, MOQ — and I'll surface matching mills.",
    },
  ]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const userHasScrolledUp = React.useRef(false);
  const scrollRafId = React.useRef<number>(0);
  const scrollCheckRafId = React.useRef<number>(0);

  const handleScroll = React.useCallback(() => {
    // Throttle scroll checks to one per animation frame
    if (scrollCheckRafId.current) return;
    scrollCheckRafId.current = requestAnimationFrame(() => {
      scrollCheckRafId.current = 0;
      if (!scrollRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      userHasScrolledUp.current = scrollHeight - scrollTop - clientHeight > 60;
    });
  }, []);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ product: any; supplier?: any }>;
      setOpen(true);
      userHasScrolledUp.current = false;
      if (customEvent.detail && customEvent.detail.product) {
        const p = customEvent.detail.product;
        setActiveProductCtx(customEvent.detail);
        setMessages((m) => {
          const text = `I'm ready! Ask me anything about **${p.name}** — suitability for activewear/garments, pricing, MOQ (${p.moq}m), lead times (${p.leadTimeDays} days), or certifications.`;
          return [...m, { role: "assistant", text }];
        });
      }
    };

    window.addEventListener("texora:open-ai-assistant", handler);
    return () => {
      window.removeEventListener("texora:open-ai-assistant", handler);
    };
  }, []);

  // Auto-scroll batched via rAF to avoid per-tick layout thrashing during streaming
  React.useEffect(() => {
    if (!scrollRef.current || userHasScrolledUp.current) return;
    cancelAnimationFrame(scrollRafId.current);
    scrollRafId.current = requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
  }, [messages, streaming]);

  // Hide the floating chatbot completely for Suppliers
  if (profile?.role === "supplier") {
    return null;
  }

  const send = (text: string) => {
    if (!text.trim() || streaming) return;

    userHasScrolledUp.current = false;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setStreaming(true);

    const payloadMessages = [];
    if (activeProductCtx?.product) {
      payloadMessages.push({
        role: "system",
        content: buildProductContextString(activeProductCtx.product, activeProductCtx.supplier),
      });
    }

    payloadMessages.push(
      ...messages.map((m) => ({
        role: m.role,
        content: m.text,
      })),
      { role: "user", content: text }
    );

    fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: payloadMessages,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network error contacting Texora AI.");
        return res.json() as Promise<{ text: string }>;
      })
      .then((data) => {
        const full = data.text;
        let i = 0;
        setMessages((m) => [...m, { role: "assistant", text: "" }]);
        const timer = setInterval(() => {
          i += 6;
          setMessages((m) => {
            const next = [...m];
            next[next.length - 1] = { role: "assistant", text: full.slice(0, i) };
            return next;
          });
          if (i >= full.length) {
            clearInterval(timer);
            setMessages((m) => {
              const next = [...m];
              next[next.length - 1] = { role: "assistant", text: full };
              return next;
            });
            setStreaming(false);
          }
        }, 16);
      })
      .catch((err) => {
        console.error("Texora AI chat call failed:", err);
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
        <span className="hidden sm:inline">{open ? "Close" : "Ask Texora AI"}</span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-label="Texora AI sourcing assistant"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="gradient-ring glass-strong fixed bottom-24 right-4 z-50 flex h-[32rem] w-[calc(100vw-2rem)] max-w-[26rem] flex-col overflow-hidden rounded-3xl shadow-lift sm:right-6"
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-gradient-ai">
                  <Sparkles className="size-4 text-primary-foreground" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Texora AI</p>
                  <p className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-success" />
                    Semantic search over verified fabric catalogs
                  </p>
                </div>
              </div>
            </header>

            {activeProductCtx?.product ? (
              <div className="flex items-center justify-between border-b border-border bg-accent/50 px-4 py-2 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-foreground truncate">
                  <span className="font-semibold text-primary">Discussing:</span>
                  <span className="truncate">{activeProductCtx.product.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveProductCtx(null)}
                  className="ml-2 shrink-0 rounded px-1.5 py-0.5 text-[0.7rem] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  Clear context
                </button>
              </div>
            ) : null}

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
              style={{
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
                willChange: "scroll-position",
                contain: "strict",
              }}
            >
              {messages.map((m, i) => {
                if (m.role === "user") {
                  return (
                    <div key={i} className="flex justify-end">
                      <div className="max-w-[88%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground whitespace-pre-line">
                        {m.text}
                      </div>
                    </div>
                  );
                }

                const parsed = parseAssistantResponse(m.text);
                const isCurrentlyStreaming = streaming && i === messages.length - 1;

                return (
                  <div key={i} className="flex justify-start">
                    <div className="w-full max-w-[95%] space-y-2 text-sm leading-relaxed text-foreground">
                      {parsed.products && parsed.products.length > 0 ? (
                        <>
                          {parsed.introText ? (
                            <p className="whitespace-pre-line text-xs font-medium leading-relaxed text-muted-foreground">
                              {formatMessageText(parsed.introText)}
                            </p>
                          ) : null}
                          <div className="space-y-2.5 pt-1">
                            {parsed.products.map((item, pIdx) => (
                              <ProductResultCard key={pIdx} item={item} />
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="whitespace-pre-line">
                          {formatMessageText(parsed.rawText || m.text)}
                        </div>
                      )}

                      {isCurrentlyStreaming ? (
                        <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-primary align-middle" />
                      ) : null}
                    </div>
                  </div>
                );
              })}

              {/* Thinking indicator — shown while waiting for API response */}
              {streaming && messages.length > 0 && messages[messages.length - 1].role === "user" ? (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-surface border border-border/60 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1.2s" }} />
                      <span className="size-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: "150ms", animationDuration: "1.2s" }} />
                      <span className="size-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: "300ms", animationDuration: "1.2s" }} />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Thinking…</span>
                  </div>
                </div>
              ) : null}
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
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe the fabric you need…"
                  aria-label="Message Texora AI"
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



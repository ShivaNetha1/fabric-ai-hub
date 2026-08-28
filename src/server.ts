import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { aiService } from "./lib/ai-service";
import { dbService } from "./lib/db-service";
import { supabase } from "./lib/supabase";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// Intercept B2B AI Assistant APIs
async function handleApiRoute(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (!pathname.startsWith("/api/ai/")) {
    return null;
  }

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const body = await request.json().catch(() => ({}));

    switch (pathname) {
      case "/api/ai/chat": {
        const { messages } = body as { messages: any[] };
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
          return new Response(JSON.stringify({ error: "Invalid messages payload." }), {
            status: 400,
            headers: corsHeaders,
          });
        }
        const userMessages = messages.filter((m) => m.role === "user");
        const latestQuery = userMessages[userMessages.length - 1]?.content || "";

        let contextText = "No directly matching fabrics were found in the database.";
        if (latestQuery) {
          const matches = await aiService.semanticSearch(latestQuery, 0.35, 4);
          if (matches.length > 0) {
            contextText = matches
              .map((m, index) => {
                return `
[Match #${index + 1}]
Fabric ID: ${m.id}
Fabric Name: ${m.name}
Subtitle: ${m.subtitle}
Material: ${m.material}
Composition: ${m.composition}
Price: INR ${m.price_per_metre} per metre
MOQ: ${m.moq} metres
GSM: ${m.gsm} weight
Width: ${m.width_cm} cm
Availability: ${m.availability}
Certifications: ${(m.certifications || []).join(", ")}
Tags: ${(m.tags || []).join(", ")}
Description: ${m.description}
Supplier ID: ${m.supplier_id}
Semantic Similarity Score: ${(m.similarity * 100).toFixed(1)}%
                `.trim();
              })
              .join("\n\n");
          }
        }

        const systemPrompt = `
You are Texora, the premium, highly intelligent B2B sourcing assistant for the Texora Textile Marketplace.
Your job is to match buyers with verified mills, materials, and contracts.
Respond with a helpful, professional, and concise tone.

CRITICAL LAWS:
1. You are STRICTLY grounded in the provided Sourcing Context facts. 
2. If the context does not contain relevant specifications, prices, MOQs, or mill details to answer a question, state honestly that you don't have that information and suggest browsing the marketplace or contacting the mill. Do NOT make up, assume, or estimate specifications, certifications, prices, or mill details (no hallucinations).
3. Do not recommend or list fabrics that are not mentioned in the context.
4. Give all prices in Indian Rupees (INR, ₹).
5. NEVER output raw Markdown tables (do not use '| Header |' markdown tables).
6. NEVER output raw HTML or hardcoded localhost URLs. Use relative paths like '/products/fabric-id' for links.
7. When recommending, searching, or presenting fabrics from the Sourcing Context, respond in JSON format wrapped in a \`\`\`json block:

\`\`\`json
{
  "type": "product_results",
  "intro": "Here are the matching fabric options from our verified mills:",
  "products": [
    {
      "productId": "exact-fabric-id",
      "name": "Fabric Name 120 GSM",
      "gsm": 120,
      "width": "148 cm",
      "price": 212,
      "unit": "metre",
      "moq": "300 m",
      "certifications": ["GOTS", "OEKO-TEX 100"],
      "description": "Short 1-sentence note about the fabric."
    }
  ]
}
\`\`\`

If the user is asking a general Q&A question that doesn't involve listing or comparing products, respond with concise, well-formatted text using short paragraphs or clean bullet points. When referencing a fabric, use the markdown link format [Fabric Name](/products/fabric-id).

Retrieved Sourcing Context:
${contextText}
`.trim();

        const groundedMessages = [
          { role: "system" as const, content: systemPrompt },
          ...messages.slice(-6).map((m) => ({
            role: m.role as "system" | "user" | "assistant",
            content: m.content as string,
          })),
        ];

        const reply = await aiService.queryLLM(groundedMessages);
        return new Response(JSON.stringify({ text: reply }), { headers: corsHeaders });
      }

      case "/api/ai/search": {
        const { query, threshold, limit } = body as { query: string; threshold?: number; limit?: number };
        if (!query) {
          return new Response(JSON.stringify({ error: "Missing required query parameter." }), {
            status: 400,
            headers: corsHeaders,
          });
        }
        const results = await aiService.semanticSearch(query, threshold ?? 0.35, limit ?? 6);
        return new Response(JSON.stringify({ results }), { headers: corsHeaders });
      }

      case "/api/ai/recommend": {
        const { buyerId, preferences } = body as { buyerId?: string; preferences?: string };
        let queryStr = preferences || "Premium sustainable apparel fabrics";

        if (buyerId) {
          try {
            const { data: buyer } = await supabase
              .from("buyers")
              .select("company_name, materials, certifications")
              .eq("id", buyerId)
              .maybeSingle();

            if (buyer) {
              const mats = Array.isArray(buyer.materials) ? buyer.materials.join(", ") : "";
              const certs = Array.isArray(buyer.certifications) ? buyer.certifications.join(", ") : "";
              queryStr = `Fabrics matching company ${buyer.company_name || ""}. Materials: ${mats}. Certifications: ${certs}. Sustainable high quality.`;
            }
          } catch (buyerErr) {
            console.warn("Failed to query buyer profile for recommendations:", buyerErr);
          }
        }

        const results = await aiService.semanticSearch(queryStr, 0.3, 4);
        return new Response(JSON.stringify({ recommendations: results }), { headers: corsHeaders });
      }

      case "/api/ai/similar": {
        const { productId, limit } = body as { productId: string; limit?: number };
        if (!productId) {
          return new Response(JSON.stringify({ error: "Missing required productId." }), {
            status: 400,
            headers: corsHeaders,
          });
        }
        const product = await dbService.getProductById(productId);
        if (!product) {
          return new Response(JSON.stringify({ error: `Product ${productId} not found.` }), {
            status: 404,
            headers: corsHeaders,
          });
        }

        const queryStr = `Fabric Name: ${product.name}, Material: ${product.material}, Composition: ${product.composition}, GSM: ${product.gsm}, Tags: ${(product.tags || []).join(", ")}`;
        const matches = await aiService.semanticSearch(queryStr, 0.35, (limit ?? 5) + 1);
        const similar = matches.filter((m) => m.id !== productId).slice(0, limit ?? 4);
        return new Response(JSON.stringify({ similar }), { headers: corsHeaders });
      }

      case "/api/ai/compare": {
        const { productIds } = body as { productIds: string[] };
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
          return new Response(JSON.stringify({ error: "Missing or invalid productIds list." }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        const productsData = [];
        for (const id of productIds) {
          const prod = await dbService.getProductById(id);
          if (prod) {
            productsData.push(prod);
          }
        }

        if (productsData.length === 0) {
          return new Response(JSON.stringify({ error: "None of the specified products were found." }), {
            status: 404,
            headers: corsHeaders,
          });
        }

        const productsContextText = productsData
          .map((p, i) => `
Product #${i + 1}:
Name: ${p.name}
Composition: ${p.composition}
GSM: ${p.gsm}
Width: ${p.widthCm}cm
Price: INR ${p.pricePerMetre}/m
MOQ: ${p.moq}m
Availability: ${p.availability}
Certifications: ${(p.certifications || []).join(", ")}
Description: ${p.description}
          `.trim())
          .join("\n\n");

        const prompt = `
You are Texora, the premium B2B textile sourcing advisor.
Analyze and compare the following fabrics side-by-side:

${productsContextText}

Provide a structured, clean markdown comparison focusing on:
1. **Weight & Feel**: Compare the weights (GSM), composition, and hand-feel.
2. **Best Applications**: Which garments or products is each fabric best suited for?
3. **Buying Terms**: Compare the price-points and Minimum Order Quantities (MOQ).
4. **Final Recommendation**: Provide a concise summary on which one to choose for specific design requirements.

Keep the tone professional, objective, and clear. Use standard Markdown tables if helpful.
`.trim();

        const analysis = await aiService.queryLLM([
          {
            role: "system",
            content: "You are a professional textile inspector and purchasing advisor. Output clean markdown.",
          },
          { role: "user", content: prompt },
        ]);

        return new Response(JSON.stringify({ comparison: analysis }), { headers: corsHeaders });
      }

      case "/api/ai/product-qa": {
        const { productId, question } = body as { productId: string; question: string };
        if (!productId || !question) {
          return new Response(JSON.stringify({ error: "Missing required productId or question." }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        const product = await dbService.getProductById(productId);
        if (!product) {
          return new Response(JSON.stringify({ error: `Product ${productId} not found.` }), {
            status: 404,
            headers: corsHeaders,
          });
        }

        let supplierDetails = "No supplier details available.";
        try {
          const supplier = await dbService.getSupplierById(product.supplierId);
          if (supplier) {
            supplierDetails = `Supplier: ${supplier.name}\nLocation: ${supplier.city}, ${supplier.country}\nSince: ${supplier.since}\nAbout: ${supplier.about || "N/A"}`;
          }
        } catch (supErr) {
          console.warn(`Failed to fetch supplier details for Q&A:`, supErr);
        }

        const productDetails = `
Fabric Name: ${product.name}
Subtitle: ${product.subtitle}
Material: ${product.material}
Composition: ${product.composition}
Price: INR ${product.pricePerMetre} per metre
MOQ: ${product.moq} metres
GSM: ${product.gsm} weight
Width: ${product.widthCm} cm
Availability: ${product.availability}
Certifications: ${(product.certifications || []).join(", ")}
Tags: ${(product.tags || []).join(", ")}
Description: ${product.description}
        `.trim();

        const systemPrompt = `
You are Texora, a premium textile sourcing advisor.
You are helping a buyer evaluate this specific fabric:
${productDetails}

Mill Info:
${supplierDetails}

CRITICAL RULES:
1. Answer the user's question using ONLY the details listed above.
2. If the user asks for information not specified in the details above (like washing instructions, weight in ounces, custom color dyeing capacities, or shipping costs to a specific country), state clearly and honestly that this information is not in the specifications sheet and suggest contacting the mill. Do NOT make up or hallucinate any facts.
3. Be professional, direct, and concise.
`.trim();

        const reply = await aiService.queryLLM([
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ]);

        return new Response(JSON.stringify({ answer: reply }), { headers: corsHeaders });
      }

      case "/api/ai/reindex": {
        const products = await dbService.getProducts();
        console.log(`Batch vector indexing triggered for ${products.length} products.`);

        for (const p of products) {
          await aiService.indexProduct(p.id);
        }

        return new Response(JSON.stringify({ success: true, count: products.length }), { headers: corsHeaders });
      }

      default: {
        return new Response(JSON.stringify({ error: "API route not found." }), {
          status: 404,
          headers: corsHeaders,
        });
      }
    }
  } catch (err: any) {
    console.error(`API route error on ${pathname}:`, err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error." }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

// h3 swallows unhandled SSR throws
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      // 1. Process B2B AI APIs
      const apiResponse = await handleApiRoute(request);
      if (apiResponse) {
        return apiResponse;
      }

      // 2. Delegate to default SSR handler
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

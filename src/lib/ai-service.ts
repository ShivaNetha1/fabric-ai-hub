import { createClient } from "@supabase/supabase-js";
import { pipeline, env } from "@xenova/transformers";
import { supabase } from "./supabase";
import { dbService } from "./db-service";

// Configure Xenova to fetch models from Hugging Face CDN and store in writable /tmp directory (critical for Vercel Serverless)
env.allowLocalModels = false;
env.cacheDir = "/tmp/transformers-cache";

const supabaseUrl = process.env["VITE_SUPABASE_URL"] || import.meta.env["VITE_SUPABASE_URL"];
const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] || import.meta.env["SUPABASE_SERVICE_ROLE_KEY"];

// Privileged Supabase client to bypass Row Level Security policies during server-side indexing writes
const privilegedSupabase = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey)
  : supabase;

let embeddingPipeline: any = null;

async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embeddingPipeline;
}

export const aiService = {
  /**
   * Generates a 384-dimensional embedding vector for a given text.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const extractor = await getEmbeddingPipeline();
      const output = await extractor(text, { pooling: "mean", normalize: true });
      return Array.from(output.data);
    } catch (err) {
      console.error("Failed to generate embedding locally:", err);
      throw err;
    }
  },

  /**
   * Calls the Groq Chat Completions API with context-grounded messages.
   */
  async queryLLM(messages: { role: "system" | "user" | "assistant"; content: string }[]): Promise<string> {
    const apiKey = process.env["GROQ_API_KEY"] || import.meta.env["GROQ_API_KEY"];
    if (!apiKey) {
      console.warn("GROQ_API_KEY is not defined in environment variables. Falling back to default response.");
      return "Hello! I am your sourcing copilot, but my Groq LLM engine is currently missing an API key. Please configure GROQ_API_KEY in your env settings.";
    }

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.1,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API returned status ${response.status}: ${errText}`);
      }

      const result = await response.json();
      return result.choices?.[0]?.message?.content || "No response generated.";
    } catch (err: any) {
      console.error("Failed to query Groq LLM:", err);
      throw err;
    }
  },

  /**
   * Generates and saves the vector embedding for a single product.
   */
  async indexProduct(productId: string): Promise<void> {
    try {
      const product = await dbService.getProductById(productId);
      if (!product) {
        console.warn(`Product ${productId} not found. Skipping embedding index.`);
        return;
      }

      // Fetch public supplier details
      let supplierName = "Unknown Mill";
      let supplierCity = "Unknown";
      let supplierCountry = "Unknown";
      let supplierAbout = "";

      try {
        const supplier = await dbService.getSupplierById(product.supplierId);
        if (supplier) {
          supplierName = supplier.name;
          supplierCity = supplier.city;
          supplierCountry = supplier.country;
          supplierAbout = supplier.about || "";
        }
      } catch (supErr) {
        console.warn(`Failed to fetch supplier details for indexing product ${productId}:`, supErr);
      }

      // Compile comprehensive specifications string
      const textToEmbed = `
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
Supplier/Mill Name: ${supplierName}
Supplier Location: ${supplierCity}, ${supplierCountry}
Supplier About: ${supplierAbout}
`.trim();

      const embedding = await this.generateEmbedding(textToEmbed);

      const { error } = await privilegedSupabase
        .from("products")
        .update({ embedding })
        .eq("id", productId);

      if (error) throw error;
      console.log(`Successfully generated and indexed vector embedding for product: ${productId}`);
    } catch (err) {
      console.error(`Failed to index product embedding for ${productId}:`, err);
    }
  },

  /**
   * Performs semantic product lookup using pgvector.
   */
  async semanticSearch(query: string, threshold: number = 0.5, limit: number = 5): Promise<any[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);

      const { data, error } = await supabase.rpc("match_products", {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Semantic search vector query failed:", err);
      return [];
    }
  }
};

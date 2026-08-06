# Texora — Premium B2B AI Textile Marketplace

Texora is a modern, responsive B2B textile marketplace that connects fabric buyers and verified mills. The platform features an intelligent, vector-backed AI sourcing assistant, browser-native voice search, transactional cart management, and dedicated workspaces for both buyers and suppliers.

---

## 🚀 Key Features

### 1. AI Sourcing Assistant (Texora AI)
* **Client-side Embeddings**: Computes text embeddings directly in the browser using the **Xenova Transformers pipeline** (running on a local 384-dimensional MiniLM-L6 vector engine).
* **Semantic DB Matching**: Performs similarity searches on catalog products using Supabase's `pgvector` extension and custom SQL search queries (`match_products`).
* **Intelligent Chat Core**: Uses the **Groq LLaMA** model on the server-side to provide high-speed, conversational sourcing guidance.
* **Direct Sourcing Links**: The AI automatically returns clickable markdown links (e.g., `[Fabric Name](/products/Fabric-ID)`) mapped directly into styled React components.

### 2. Browser-Native Voice Search
* Integration of the browser's Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) in the chatbot.
* Single-click recording with real-time feedback (pulsating active indicators) that transcribes search inputs locally.

### 3. Supplier Workspace (SaaS Console)
* **SaaS Analytics Cards**: Tracks revenue, incoming purchase orders, average contract size, and low-stock alerts.
* **Mill Profile Customization**: Allows mills to manage operating hours, contact details, certifications, and capabilities.
* **Catalog Management (CRUD)**: Create, read, update, and delete active fabrics, including direct image uploads to Supabase storage buckets.
* **Purchase Order Lifecycle**: Mills can view incoming order contracts and toggle PO stages (`Pending`, `Accepted`, `Preparing`, `Ready for Dispatch`, `Completed`).

### 4. Buyer Workspace
* **Personalized Dashboard**: Displays ongoing order timelines, active supplier response hours, and quarter spend charts.
* **Conversational Onboarding**: A step-by-step preference questionnaire that saves buyer sizing, material preferences, and MOQs directly to their user profiles.

### 5. Transactional Cart & Checkout
* **Multi-Item Shopping Cart**: Built using a React context provider with localStorage fallback sync (`texora_guest_cart`).
* **Escrow-Protected Checkout**: A 2-step checkout flow collecting delivery and net-30 payment terms, writing multi-vendor transactions to the database, and triggering inventory deductions.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, TanStack Router (Start / Vinxi), Lucide Icons, Framer Motion (for smooth 60 FPS transitions).
* **Styling**: Tailwind CSS + Custom Vanilla CSS utility systems in `src/styles.css`.
* **Database & Auth**: Supabase (PostgreSQL + `pgvector` extension + Storage Buckets + RLS policies).
* **AI Embeddings**: `@xenova/transformers` (local ONNX pipeline with model weights caching).
* **Sourcing LLM**: Groq Cloud API.

---

## 💾 Database Schema

The complete database schema is saved in [supabase_schema.sql](file:///s:/loomly/supabase_schema.sql). Core tables include:

* `profiles`: Links authenticated user accounts to roles (`buyer` or `supplier`).
* `suppliers`: Houses verified mill information, rating metrics, locations, and GOTS/OEKO-TEX certifications.
* `products`: Holds fabric detail specs, price per metre, MOQ, stock levels, and their corresponding 384-dimension `embedding` vector.
* `orders`: Logs transactional purchase orders raised between buyers and mills.

---

## ⚙️ Environment Configuration

Copy the sample environment values to a `.env` file in the root directory:

```bash
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-publishable-key"
SUPABASE_SERVICE_ROLE_KEY="your-secret-service-role-key" # Required for indexing vectors on backend
GROQ_API_KEY="gsk_your-groq-api-key"
```

---

## 💻 Local Setup

1. **Install Dependencies**:
   ```bash
   bun install
   # or npm install
   ```

2. **Database Setup**:
   - Run the DDL declarations in `supabase_schema.sql` on your Supabase SQL Editor.
   - Upload mock files to the `product-images` storage bucket.

3. **Start Development Server**:
   ```bash
   bun run dev
   # or npm run dev
   ```
   Open `http://localhost:8080` in your web browser.

4. **Compile & Typecheck**:
   ```bash
   npx tsc --noEmit
   ```

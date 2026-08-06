import * as React from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  Clock, 
  FileText, 
  MapPin, 
  Package, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Upload, 
  User, 
  Edit3, 
  Tag,
  AlertTriangle,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { dbService } from "@/lib/db-service";
import { uploadProductImage } from "@/lib/storage-upload";
import { MeshBackground } from "@/components/site/mesh-background";
import { inr, type Product, type Supplier, type Availability } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/supplier")({
  head: () => ({
    meta: [{ title: "Supplier Dashboard — Texora" }],
  }),
  component: SupplierDashboard,
});

function SupplierDashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [supplier, setSupplier] = React.useState<Supplier | null>(null);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  
  // UI states
  const [ordersLoading, setOrdersLoading] = React.useState(true);
  const [productsLoading, setProductsLoading] = React.useState(true);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [isAddingProduct, setIsAddingProduct] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  // Profile Form States
  const [profileName, setProfileName] = React.useState("");
  const [profileCity, setProfileCity] = React.useState("");
  const [profileCountry, setProfileCountry] = React.useState("");
  const [profilePhone, setProfilePhone] = React.useState("");
  const [profileAbout, setProfileAbout] = React.useState("");
  const [profileHours, setProfileHours] = React.useState("");

  // Product Form States
  const [prodId, setProdId] = React.useState("");
  const [prodName, setProdName] = React.useState("");
  const [prodSubtitle, setProdSubtitle] = React.useState("");
  const [prodMaterial, setProdMaterial] = React.useState("Cotton");
  const [prodComposition, setProdComposition] = React.useState("");
  const [prodPrice, setProdPrice] = React.useState(200);
  const [prodMoq, setProdMoq] = React.useState(100);
  const [prodGsm, setProdGsm] = React.useState(120);
  const [prodWidth, setProdWidth] = React.useState(148);
  const [prodImage, setProdImage] = React.useState("");
  const [prodAvailability, setProdAvailability] = React.useState<Availability>("In stock");
  const [prodCertifications, setProdCertifications] = React.useState("GOTS, OEKO-TEX 100");
  const [prodTags, setProdTags] = React.useState("Shirting, Breathable");
  const [prodDescription, setProdDescription] = React.useState("");
  const [prodStock, setProdStock] = React.useState(5000);
  const [uploadingImage, setUploadingImage] = React.useState(false);

  // RBAC Redirects
  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        toast.error("Please sign in to access your dashboard.");
        navigate({ to: "/auth" });
      } else if (profile && profile.role !== "supplier") {
        toast.error("Access denied. Directing to Buyer workspace.");
        navigate({ to: "/dashboard/buyer" });
      }
    }
  }, [user, profile, loading, navigate]);

  // Load Data
  const loadData = React.useCallback(async () => {
    if (!user) return;
    try {
      const sup = await dbService.getSupplierById(user.id);
      if (sup) {
        setSupplier(sup);
        setProfileName(sup.name);
        setProfileCity(sup.city);
        setProfileCountry(sup.country);
        setProfilePhone(sup.phone || "");
        setProfileAbout(sup.about || "");
        setProfileHours(sup.hours || "");
      }

      const ords = await dbService.getOrdersBySupplier(user.id);
      setOrders(ords);
      setOrdersLoading(false);

      const prods = await dbService.getProducts();
      setProducts(prods.filter((p) => p.supplierId === user.id));
      setProductsLoading(false);
    } catch (err) {
      console.error("Error loading supplier dashboard data:", err);
    }
  }, [user]);

  React.useEffect(() => {
    if (user && profile?.role === "supplier") {
      loadData();
    }
  }, [user, profile, loadData]);

  if (loading || !user || (profile && profile.role !== "supplier")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground animate-pulse">Loading supplier workspace...</p>
      </div>
    );
  }

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const lowStockAlerts = products.filter((p) => p.stockMetres < 1000).length;

  // Handle Order Status Update
  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await dbService.updateOrderStatus(orderId, status);
      toast.success(`Order status updated to ${status}`);
      // Reload orders list
      const ords = await dbService.getOrdersBySupplier(user.id);
      setOrders(ords);
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await dbService.updateSupplierProfile(user.id, {
        name: profileName,
        city: profileCity,
        country: profileCountry,
        phone: profilePhone,
        about: profileAbout,
        hours: profileHours,
      });
      setSupplier(updated);
      setIsEditingProfile(false);
      toast.success("Mill profile updated successfully!");
    } catch (err: any) {
      toast.error("Failed to update profile: " + err.message);
    }
  };

  // Handle Image Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadProductImage(file, user.id);
      setProdImage(url);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      toast.error("Failed to upload image: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Open Add Product Form
  const startAddProduct = () => {
    setEditingProduct(null);
    setProdId("");
    setProdName("");
    setProdSubtitle("");
    setProdMaterial("Cotton");
    setProdComposition("");
    setProdPrice(200);
    setProdMoq(100);
    setProdGsm(120);
    setProdWidth(148);
    setProdImage("");
    setProdAvailability("In stock");
    setProdCertifications("GOTS, OEKO-TEX 100");
    setProdTags("Shirting, Breathable");
    setProdDescription("");
    setProdStock(5000);
    setIsAddingProduct(true);
  };

  // Open Edit Product Form
  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdId(prod.id);
    setProdName(prod.name);
    setProdSubtitle(prod.subtitle);
    setProdMaterial(prod.material);
    setProdComposition(prod.composition);
    setProdPrice(prod.pricePerMetre);
    setProdMoq(prod.moq);
    setProdGsm(prod.gsm);
    setProdWidth(prod.widthCm);
    setProdImage(prod.image);
    setProdAvailability(prod.availability);
    setProdCertifications(prod.certifications.join(", "));
    setProdTags(prod.tags.join(", "));
    setProdDescription(prod.description);
    setProdStock(prod.stockMetres);
    setIsAddingProduct(true);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodImage) {
      toast.error("Please upload or provide a product image URL.");
      return;
    }

    const cleanId = prodId.toLowerCase().replace(/\s+/g, "-");
    const certsArray = prodCertifications.split(",").map((s) => s.trim()).filter(Boolean);
    const tagsArray = prodTags.split(",").map((s) => s.trim()).filter(Boolean);

    const productPayload: any = {
      id: cleanId,
      name: prodName,
      subtitle: prodSubtitle,
      material: prodMaterial,
      composition: prodComposition,
      image: prodImage,
      gallery: [prodImage],
      pricePerMetre: Number(prodPrice),
      currency: "₹",
      moq: Number(prodMoq),
      gsm: Number(prodGsm),
      widthCm: Number(prodWidth),
      colors: [{ name: "Default", hex: "#666" }], // simple fallback color structure
      supplierId: user.id,
      leadTimeDays: 15,
      availability: prodAvailability,
      certifications: certsArray,
      sustainable: certsArray.includes("GOTS"),
      tags: tagsArray,
      description: prodDescription,
      stockMetres: Number(prodStock),
    };

    try {
      if (editingProduct) {
        await dbService.updateProduct(editingProduct.id, productPayload);
        toast.success("Product updated successfully!");
      } else {
        await dbService.createProduct(productPayload);
        toast.success("New product listed successfully!");
      }

      setIsAddingProduct(false);
      setEditingProduct(null);
      // Reload products list
      const prods = await dbService.getProducts();
      setProducts(prods.filter((p) => p.supplierId === user.id));
    } catch (err: any) {
      toast.error("Failed to save product: " + err.message);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    try {
      await dbService.deleteProduct(id);
      toast.success("Product deleted from catalog.");
      // Reload products list
      const prods = await dbService.getProducts();
      setProducts(prods.filter((p) => p.supplierId === user.id));
    } catch (err: any) {
      toast.error("Failed to delete product: " + err.message);
    }
  };

  return (
    <div className="relative min-h-screen">
      <MeshBackground intensity="soft" />
      <div className="relative mx-auto max-w-[88rem] px-6 pb-24 pt-32">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em]">Supplier Workspace</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage inventory, upload fabrics, and process incoming POs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/suppliers/$supplierId"
              params={{ supplierId: user.id }}
              className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-xs font-medium hover:border-primary/50 hover:bg-card/90 transition-all cursor-pointer"
            >
              <Building2 className="size-3.5 text-primary" />
              <span>{supplier?.name || profile?.full_name || user.email}</span>
            </Link>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard title="Total Revenue" value={inr(totalRevenue)} desc="Escrow funds settled" icon={TrendingUp} />
          <StatCard title="Received Orders" value={totalOrders} desc="Total volume of contracts" icon={Package} />
          <StatCard title="Average Order Value" value={inr(averageOrderValue)} desc="Consolidated PO size" icon={FileText} />
          <StatCard title="Pending Review" value={pendingOrders} desc="Action required" icon={Clock} />
          <StatCard title="Total Products" value={products.length} desc="Items in catalog" icon={Layers} />
          <StatCard 
            title="Inventory Alerts" 
            value={lowStockAlerts} 
            desc="Low stock warnings (<1000m)" 
            icon={AlertTriangle} 
            className={lowStockAlerts > 0 ? "border-destructive/30 bg-destructive/5 text-destructive" : ""}
          />
        </div>

        {/* Content Tabs / Main Layout */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">

          {/* Catalog & Inventory CRUD Section */}
          <div className="glass-strong rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <Package className="size-4.5 text-primary" />
                Active Catalog
              </h2>
              <Button size="sm" onClick={startAddProduct} className="rounded-full">
                <Plus className="size-4 mr-1" /> Add Product
              </Button>
            </div>
            <Separator className="my-5" />

            {/* Catalog List */}
            {productsLoading ? (
              <p className="text-sm text-muted-foreground py-10 text-center animate-pulse">Loading catalog...</p>
            ) : products.length === 0 ? (
              <div className="py-14 text-center">
                <p className="text-sm text-muted-foreground">Your catalog is currently empty.</p>
                <Button size="sm" variant="outline" className="mt-4" onClick={startAddProduct}>
                  List first fabric
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {products.map((p) => (
                  <div key={p.id} className="relative rounded-2xl border border-border bg-surface p-4 flex gap-4 hover:shadow-soft transition-all duration-300">
                    <img src={p.image} alt={p.name} className="size-16 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm truncate">{p.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{p.composition}</p>
                      <p className="text-xs font-semibold text-primary mt-2">{inr(p.pricePerMetre)}/m</p>
                      <p className="text-[0.68rem] text-subtle mt-0.5">Stock: {p.stockMetres}m · MOQ: {p.moq}m</p>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0 justify-center">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => startEditProduct(p)}>
                        <Edit3 className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteProduct(p.id)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile & Received Orders Section */}
          <div className="space-y-6">

            {/* Received Orders */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-7">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Clock className="size-4 text-primary" /> Incoming Purchase Orders
              </h3>
              <Separator className="my-4" />

              {ordersLoading ? (
                <p className="text-xs text-muted-foreground animate-pulse text-center py-4">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No purchase orders received yet.</p>
              ) : (
                <div className="space-y-4 max-h-[30rem] overflow-y-auto">
                  {orders.map((o) => (
                    <div key={o.id} className="rounded-xl border border-border bg-surface p-4 text-xs space-y-2">
                      <div className="flex justify-between font-medium">
                        <span className="font-mono text-primary">LM-{o.id.slice(0, 6).toUpperCase()}</span>
                        <span>{o.placed}</span>
                      </div>
                      <Separator className="my-1.5" />
                      <p><strong>Item</strong>: {o.product} ({o.colour})</p>
                      <p><strong>Qty</strong>: {o.qty} m · <strong>Value</strong>: {inr(o.total)}</p>
                      {o.shippingAddress && (
                        <p><strong>Ship To</strong>: {o.shippingAddress}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-semibold">Status:</span>
                        <select 
                          value={o.status} 
                          onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                          className="bg-background border border-border rounded px-2 py-1 text-xs"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready for Dispatch">Ready for Dispatch</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mill Profile Panel */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="size-4 text-primary" /> Mill Profile
                </h3>
                {!isEditingProfile && (
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setIsEditingProfile(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
              <Separator className="my-4" />

              {isEditingProfile ? (
                <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
                  <div>
                    <Label className="text-xs">Mill Name</Label>
                    <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="h-9 mt-1" required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">City</Label>
                      <Input value={profileCity} onChange={(e) => setProfileCity(e.target.value)} className="h-9 mt-1" required />
                    </div>
                    <div>
                      <Label className="text-xs">Country</Label>
                      <Input value={profileCountry} onChange={(e) => setProfileCountry(e.target.value)} className="h-9 mt-1" required />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Phone</Label>
                    <Input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="h-9 mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Operational Hours</Label>
                    <Input value={profileHours} onChange={(e) => setProfileHours(e.target.value)} className="h-9 mt-1" placeholder="e.g. Mon–Sat · 09:00–18:00 IST" />
                  </div>
                  <div>
                    <Label className="text-xs">About / Capability Description</Label>
                    <textarea value={profileAbout} onChange={(e) => setProfileAbout(e.target.value)} rows={3} className="w-full mt-1 border border-border bg-background rounded px-3 py-2 outline-none focus:border-primary/50" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" type="submit">Save Changes</Button>
                    <Button size="sm" variant="outline" type="button" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3.5 text-xs text-muted-foreground">
                  <p><strong>Mill Name</strong>: {supplier?.name}</p>
                  <p><strong>Location</strong>: {supplier?.city}, {supplier?.country}</p>
                  {supplier?.phone && <p><strong>Phone</strong>: {supplier.phone}</p>}
                  <p><strong>Response rate</strong>: {supplier?.responseHours}h average</p>
                  {supplier?.about && (
                    <div>
                      <strong className="block text-foreground mt-2">Capabilities:</strong>
                      <p className="mt-1 leading-relaxed">{supplier.about}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Create / Edit Product Form Modal */}
        <AnimatePresence>
          {isAddingProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-card rounded-3xl border border-border p-7 shadow-lift max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-lg font-semibold tracking-tight">
                  {editingProduct ? "Edit Fabric Listing" : "Add Fabric to Catalog"}
                </h3>
                <Separator className="my-4" />

                <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Product ID (Unique Clean Name)</Label>
                      <Input 
                        value={prodId} 
                        onChange={(e) => setProdId(e.target.value)} 
                        placeholder="e.g. organic-cotton-poplin" 
                        className="h-10 mt-1.5" 
                        required 
                        disabled={!!editingProduct}
                      />
                    </div>
                    <div>
                      <Label>Fabric Display Name</Label>
                      <Input 
                        value={prodName} 
                        onChange={(e) => setProdName(e.target.value)} 
                        placeholder="e.g. Organic Cotton Poplin 120 GSM" 
                        className="h-10 mt-1.5" 
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Subtitle (Yarn / Twist Specs)</Label>
                    <Input 
                      value={prodSubtitle} 
                      onChange={(e) => setProdSubtitle(e.target.value)} 
                      placeholder="e.g. Combed compact yarn · shirting weight" 
                      className="h-10 mt-1.5" 
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label>Material Category</Label>
                      <select 
                        value={prodMaterial} 
                        onChange={(e) => setProdMaterial(e.target.value)}
                        className="w-full h-10 mt-1.5 bg-background border border-border rounded-xl px-3"
                      >
                        <option value="Cotton">Cotton</option>
                        <option value="Silk">Silk</option>
                        <option value="Linen">Linen</option>
                        <option value="Denim">Denim</option>
                        <option value="Wool">Wool</option>
                        <option value="Blend">Blend</option>
                        <option value="Knit">Knit</option>
                        <option value="Technical">Technical</option>
                      </select>
                    </div>
                    <div>
                      <Label>Composition Detail</Label>
                      <Input 
                        value={prodComposition} 
                        onChange={(e) => setProdComposition(e.target.value)} 
                        placeholder="e.g. 100% GOTS organic cotton" 
                        className="h-10 mt-1.5" 
                        required 
                      />
                    </div>
                    <div>
                      <Label>Availability Status</Label>
                      <select 
                        value={prodAvailability} 
                        onChange={(e) => setProdAvailability(e.target.value as Availability)}
                        className="w-full h-10 mt-1.5 bg-background border border-border rounded-xl px-3"
                      >
                        <option value="In stock">In stock</option>
                        <option value="Low stock">Low stock</option>
                        <option value="Made to order">Made to order</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-4">
                    <div>
                      <Label>Price (INR ₹ / m)</Label>
                      <Input type="number" value={prodPrice} onChange={(e) => setProdPrice(Number(e.target.value))} className="h-10 mt-1.5" required min={0} />
                    </div>
                    <div>
                      <Label>MOQ (metres)</Label>
                      <Input type="number" value={prodMoq} onChange={(e) => setProdMoq(Number(e.target.value))} className="h-10 mt-1.5" required min={0} />
                    </div>
                    <div>
                      <Label>GSM (weight)</Label>
                      <Input type="number" value={prodGsm} onChange={(e) => setProdGsm(Number(e.target.value))} className="h-10 mt-1.5" required min={0} />
                    </div>
                    <div>
                      <Label>Width (cm)</Label>
                      <Input type="number" value={prodWidth} onChange={(e) => setProdWidth(Number(e.target.value))} className="h-10 mt-1.5" required min={0} />
                    </div>
                  </div>

                  <div>
                    <Label>Product Photo / Catalog Image</Label>
                    <div className="mt-1.5 flex items-center gap-3">
                      <div className="relative h-12 w-16 border border-border rounded-lg bg-surface flex items-center justify-center overflow-hidden shrink-0">
                        {prodImage ? (
                          <img src={prodImage} alt="" className="size-full object-cover" />
                        ) : (
                          <Upload className="size-4 text-subtle" />
                        )}
                      </div>
                      {prodImage ? (
                        <div className="flex-1 flex items-center justify-between h-10 px-3.5 rounded-xl border border-border bg-accent/10 min-w-0">
                          <span className="truncate text-xs text-muted-foreground font-medium flex items-center gap-1.5 min-w-0">
                            <span className="inline-block size-1.5 rounded-full bg-success animate-pulse shrink-0" />
                            <span className="truncate">
                              {prodImage.startsWith("data:") 
                                ? "Local preview asset uploaded" 
                                : `Uploaded: ${prodImage.split("/").pop()}`}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setProdImage("")}
                            className="text-[0.7rem] font-semibold text-destructive hover:text-destructive/80 transition-colors shrink-0 ml-2"
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <Input 
                          value={prodImage} 
                          onChange={(e) => setProdImage(e.target.value)} 
                          placeholder="Public CDN Image URL or upload file..." 
                          className="h-10 flex-1" 
                          required 
                        />
                      )}
                      <div className="relative">
                        <input 
                          type="file" 
                          id="file-upload" 
                          accept="image/*" 
                          onChange={handleImageFileChange} 
                          className="sr-only" 
                          disabled={uploadingImage}
                        />
                        <Label htmlFor="file-upload" className="flex items-center justify-center h-10 px-4 rounded-xl border border-border bg-surface cursor-pointer hover:bg-accent font-medium">
                          {uploadingImage ? "Uploading..." : "Upload File"}
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Certifications (comma separated)</Label>
                      <Input value={prodCertifications} onChange={(e) => setProdCertifications(e.target.value)} placeholder="e.g. GOTS, OEKO-TEX 100" className="h-10 mt-1.5" />
                    </div>
                    <div>
                      <Label>Tags (comma separated)</Label>
                      <Input value={prodTags} onChange={(e) => setProdTags(e.target.value)} placeholder="e.g. Shirting, Sustainable, Low MOQ" className="h-10 mt-1.5" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Stock quantity (metres)</Label>
                      <Input type="number" value={prodStock} onChange={(e) => setProdStock(Number(e.target.value))} className="h-10 mt-1.5" required min={0} />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <span className="font-semibold">Sustainable fabric?</span>
                      <input 
                        type="checkbox" 
                        checked={prodCertifications.includes("GOTS")} 
                        disabled
                        className="size-4"
                      />
                      <span className="text-subtle text-[10px]">(Auto-calculated based on GOTS cert)</span>
                    </div>
                  </div>

                  <div>
                    <Label>Detailed Specifications & Description</Label>
                    <textarea 
                      value={prodDescription} 
                      onChange={(e) => setProdDescription(e.target.value)} 
                      rows={4} 
                      placeholder="Specify material origin, shuttle loom specifications, dye lot methods, GOTS scope references, and handfeel description..." 
                      className="w-full mt-1.5 border border-border bg-background rounded-xl px-4 py-3 outline-none focus:border-primary/50" 
                      required 
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <Button size="lg" type="submit">
                      {editingProduct ? "Save Changes" : "Create Listing"}
                    </Button>
                    <Button size="lg" variant="outline" type="button" onClick={() => {
                      setIsAddingProduct(false);
                      setEditingProduct(null);
                    }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

function StatCard({ title, value, desc, icon: Icon, className }: { title: string; value: string | number; desc: string; icon: any; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-6 shadow-soft hover-lift transition-all", className)}>
      <div className="flex justify-between items-start">
        <span className="text-xs uppercase tracking-[0.1em] text-subtle">{title}</span>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1.5 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}

import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  Clock, 
  FileText, 
  MapPin, 
  Package, 
  Sparkles, 
  TrendingUp, 
  User 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { dbService } from "@/lib/db-service";
import { supabase } from "@/lib/supabase";
import { MeshBackground } from "@/components/site/mesh-background";
import { inr } from "@/lib/data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/buyer")({
  head: () => ({
    meta: [{ title: "Buyer Dashboard — Loomly" }],
  }),
  component: BuyerDashboard,
});

function BuyerDashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = React.useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(true);

  // Profile states
  const [isViewingProfile, setIsViewingProfile] = React.useState(false);
  const [buyerData, setBuyerData] = React.useState<any>(null);
  const [profileName, setProfileName] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        toast.error("Please sign in to access your dashboard.");
        navigate({ to: "/auth" });
      } else if (profile && profile.role !== "buyer") {
        toast.error("Access denied. Directing to Supplier workspace.");
        navigate({ to: "/dashboard/supplier" });
      }
    }
  }, [user, profile, loading, navigate]);

  React.useEffect(() => {
    if (user && profile?.role === "buyer") {
      dbService.getOrdersByBuyer(user.id).then((res) => {
        setOrders(res);
        setOrdersLoading(false);
      });

      // Load buyer profile details
      supabase
        .from("buyers")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setBuyerData(data);
            setCompanyName(data.company_name || "");
            setWebsite(data.website || "");
          }
        });
      
      if (profile.full_name) {
        setProfileName(profile.full_name);
      }
    }
  }, [user, profile]);

  if (loading || !user || (profile && profile.role !== "buyer")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground animate-pulse">Loading buyer workspace...</p>
      </div>
    );
  }

  // Summary Metrics
  const activeOrders = orders.filter((o) => o.status !== "Completed").length;
  const totalSpend = orders.reduce((sum, o) => sum + o.total, 0);
  const completedOrders = orders.filter((o) => o.status === "Completed").length;

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      // 1. Update profiles table full_name
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: profileName })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // 2. Update buyers table company_name & website
      const { error: buyerError } = await supabase
        .from("buyers")
        .upsert({
          id: user.id,
          company_name: companyName,
          website: website,
        });

      if (buyerError) throw buyerError;

      // Update local state
      setBuyerData({
        ...buyerData,
        company_name: companyName,
        website: website,
      });

      toast.success("Profile updated successfully!");
      setIsViewingProfile(false);
    } catch (err: any) {
      toast.error("Failed to save profile: " + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <MeshBackground intensity="soft" />
      <div className="relative mx-auto max-w-[88rem] px-6 pb-24 pt-32">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em]">Buyer Workspace</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage purchase orders, swatches, and mill certifications.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsViewingProfile(true)}
              className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-xs font-medium hover:border-primary/50 hover:bg-card/90 transition-all cursor-pointer"
            >
              <User className="size-3.5 text-primary" />
              <span>{profileName || profile?.full_name || user.email}</span>
            </button>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Active orders" value={activeOrders} desc="Escrow protected" icon={Clock} />
          <StatCard title="Total spend" value={inr(totalSpend)} desc="Excluding customs & duties" icon={TrendingUp} />
          <StatCard title="Completed deliveries" value={completedOrders} desc="100% quality checked" icon={Package} />
          <StatCard title="Verified mills" value="38" desc="Across 48 sourcing lanes" icon={Building2} />
        </div>

        {/* Orders Section */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.9fr_1.1fr]">
          <div className="glass-strong rounded-3xl border border-border bg-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold tracking-tight">Active Sourcing Lanes</h2>
            <Separator className="my-5" />

            {ordersLoading ? (
              <p className="text-sm text-muted-foreground py-10 text-center animate-pulse">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="py-14 text-center">
                <p className="text-sm text-muted-foreground">No active purchase orders.</p>
                <Button size="sm" className="mt-4" asChild>
                  <Link to="/marketplace">Explore fabrics</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[0.7rem] uppercase tracking-wider text-subtle">
                      <th className="pb-3 font-semibold">PO Number</th>
                      <th className="pb-3 font-semibold">Product</th>
                      <th className="pb-3 font-semibold">Quantity</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">ETA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-accent/30 transition-colors">
                        <td className="py-4 font-mono font-medium text-xs text-primary">
                          LM-{o.id.slice(0, 6).toUpperCase()}
                        </td>
                        <td className="py-4">
                          <p className="font-medium text-foreground">{o.product}</p>
                          <p className="text-[0.7rem] text-subtle mt-0.5">{o.colour}</p>
                        </td>
                        <td className="py-4 font-medium text-muted-foreground">{o.qty} m</td>
                        <td className="py-4">
                          <span className={cn(
                            "inline-block rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold",
                            o.status === "Pending" && "bg-warning/15 text-warning",
                            o.status === "Accepted" && "bg-info/15 text-info",
                            o.status === "Preparing" && "bg-primary/10 text-primary",
                            o.status === "Ready for Dispatch" && "bg-success/15 text-success",
                            o.status === "Completed" && "bg-muted-foreground/10 text-muted-foreground"
                          )}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-4 font-semibold">{inr(o.total)}</td>
                        <td className="py-4 text-xs text-subtle">{o.eta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sourcing Insights */}
          <div className="space-y-6">
            {/* Certifications Escrow Info */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-7">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="size-4 text-primary" /> Sourcing Security
              </h3>
              <ul className="mt-4 space-y-3.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 block size-1.5 rounded-full bg-success" />
                  <span><strong>Escrow Protection</strong>: Funds are kept safe and only disbursed to the mill when physical inspection matches the GOTS specification sheet.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 block size-1.5 rounded-full bg-success" />
                  <span><strong>Freight Coordination</strong>: Loomly automatically handles custom clearances and consolidates shipments from verified hubs to lower carbon foot-print.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Buyer Profile Modal */}
        <AnimatePresence>
          {isViewingProfile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-card rounded-3xl border border-border p-7 shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold tracking-tight">Buyer Profile</h3>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Buyer Workspace
                  </span>
                </div>
                <Separator className="my-4" />

                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                    <input 
                      type="text"
                      value={profileName} 
                      onChange={(e) => setProfileName(e.target.value)} 
                      placeholder="e.g. Rahul Sharma" 
                      className="w-full mt-1.5 border border-border bg-background rounded-xl px-4 py-2.5 outline-none focus:border-primary/50 text-sm" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Company Name</label>
                    <input 
                      type="text"
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)} 
                      placeholder="e.g. Arrow Apparel" 
                      className="w-full mt-1.5 border border-border bg-background rounded-xl px-4 py-2.5 outline-none focus:border-primary/50 text-sm" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Website</label>
                    <input 
                      type="url"
                      value={website} 
                      onChange={(e) => setWebsite(e.target.value)} 
                      placeholder="e.g. https://arrowapparel.com" 
                      className="w-full mt-1.5 border border-border bg-background rounded-xl px-4 py-2.5 outline-none focus:border-primary/50 text-sm" 
                    />
                  </div>

                  <div className="rounded-2xl border border-border bg-surface p-4 space-y-3 mt-4 text-xs text-muted-foreground">
                    <p><strong>Account Email</strong>: {user.email}</p>
                    {buyerData?.sourcing_for && (
                      <p><strong>Sourcing For</strong>: {buyerData.sourcing_for.join(", ")}</p>
                    )}
                    {buyerData?.preferred_materials && (
                      <p><strong>Preferred Materials</strong>: {buyerData.preferred_materials.join(", ")}</p>
                    )}
                    {buyerData?.moq_preference && (
                      <p><strong>MOQ Preference</strong>: {buyerData.moq_preference} metres</p>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <Button size="lg" type="submit" disabled={isSavingProfile}>
                      {isSavingProfile ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button size="lg" variant="outline" type="button" onClick={() => setIsViewingProfile(false)}>
                      Close
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

function StatCard({ title, value, desc, icon: Icon }: { title: string; value: string | number; desc: string; icon: any }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft hover-lift transition-all">
      <div className="flex justify-between items-start">
        <span className="text-xs uppercase tracking-[0.1em] text-subtle">{title}</span>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1.5 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}

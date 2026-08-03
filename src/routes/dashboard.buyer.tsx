import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
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
import { MeshBackground } from "@/components/site/mesh-background";
import { inr } from "@/lib/data";
import { toast } from "sonner";

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
            <div className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-xs font-medium">
              <User className="size-3.5 text-primary" />
              <span>{profile?.full_name || user.email}</span>
            </div>
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
                            o.status === "Dispatch" && "bg-success/15 text-success",
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

          {/* Sourcing Insights / AI Matches */}
          <div className="space-y-6">
            <div className="gradient-ring rounded-3xl bg-surface p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-gradient-ai">
                  <Sparkles className="size-4.5 text-primary-foreground" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">Loom AI Sourcing Recommendations</h3>
                  <p className="text-[0.7rem] text-subtle mt-0.5">Updated real-time</p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                We've matched your profile with GOTS Organic Cotton Poplin from Arvind Weaves. This matches your preferred composition, with a 2-day lead time reduction on bulk orders above 1,000m.
              </p>
              <Button variant="ai" size="sm" className="mt-5 w-full" asChild>
                <Link to="/marketplace">Explore Matches</Link>
              </Button>
            </div>

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

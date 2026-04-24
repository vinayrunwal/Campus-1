import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Clock, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const statusConfig: Record<string, { icon: typeof AlertCircle; color: string; label: string }> = {
  open: { icon: AlertCircle, color: "text-destructive", label: "Open" },
  "in-progress": { icon: Clock, color: "text-primary", label: "In Progress" },
  resolved: { icon: CheckCircle2, color: "text-primary", label: "Resolved" },
  closed: { icon: CheckCircle2, color: "text-muted-foreground", label: "Closed" },
};

const AdminComplaintsPage = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["admin_complaints"],
    queryFn: async () => {
      const { data, error } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, status, admin_note }: { id: string; status: string; admin_note?: string }) => {
      const payload: Record<string, unknown> = { status };
      if (admin_note !== undefined) payload.admin_note = admin_note;
      if (status === "resolved") payload.resolved_at = new Date().toISOString();
      const { error } = await supabase.from("complaints").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Complaint updated" });
      qc.invalidateQueries({ queryKey: ["admin_complaints"] });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const open = complaints.filter(c => c.status === "open");
  const inProgress = complaints.filter(c => c.status === "in-progress");
  const resolved = complaints.filter(c => ["resolved", "closed"].includes(c.status));

  const ComplaintCard = ({ c }: { c: typeof complaints[0] }) => {
    const cfg = statusConfig[c.status] ?? statusConfig.open;
    const isOpen = expanded === c.id;
    return (
      <div className="rounded-lg border border-border bg-card">
        <button onClick={() => setExpanded(isOpen ? null : c.id)} className="flex w-full items-start justify-between p-4 text-left">
          <div className="flex items-start gap-3">
            <cfg.icon size={16} className={`mt-0.5 ${cfg.color}`} />
            <div>
              <p className="font-medium text-foreground">{c.title}</p>
              <p className="text-xs text-muted-foreground">{c.category} · {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
            <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </button>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="overflow-hidden border-t border-border px-4 pb-4 pt-3">
            <p className="mb-3 text-sm text-muted-foreground">{c.description}</p>
            {c.admin_note && (
              <p className="mb-3 rounded bg-primary/5 px-3 py-2 text-sm text-foreground">
                <span className="font-medium">Previous note:</span> {c.admin_note}
              </p>
            )}
            <div className="space-y-2">
              <Textarea placeholder="Add admin note..." rows={2} value={notes[c.id] ?? c.admin_note ?? ""}
                onChange={e => setNotes(n => ({ ...n, [c.id]: e.target.value }))} />
              <div className="flex flex-wrap gap-2">
                <Select value={c.status} onValueChange={v => update.mutate({ id: c.id, status: v, admin_note: notes[c.id] ?? c.admin_note ?? "" })}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => update.mutate({ id: c.id, status: c.status, admin_note: notes[c.id] ?? "" })}
                  disabled={update.isPending}>Save Note</Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Complaints</h1>
        <p className="text-muted-foreground">View and resolve student complaints.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-8">
          {open.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Open ({open.length})</h2>
              <div className="space-y-2">{open.map(c => <ComplaintCard key={c.id} c={c} />)}</div>
            </div>
          )}
          {inProgress.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">In Progress ({inProgress.length})</h2>
              <div className="space-y-2">{inProgress.map(c => <ComplaintCard key={c.id} c={c} />)}</div>
            </div>
          )}
          {resolved.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resolved ({resolved.length})</h2>
              <div className="space-y-2">{resolved.map(c => <ComplaintCard key={c.id} c={c} />)}</div>
            </div>
          )}
          {complaints.length === 0 && <p className="py-12 text-center text-muted-foreground">No complaints submitted yet.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminComplaintsPage;

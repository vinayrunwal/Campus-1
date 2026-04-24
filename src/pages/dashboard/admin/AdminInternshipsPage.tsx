import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Check, X, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

const AdminInternshipsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    company: "", role: "", location: "", type: "Remote", stipend: "", description: "", apply_link: "", deadline: "",
  });

  const { data: internships = [], isLoading } = useQuery({
    queryKey: ["admin_internships"],
    queryFn: async () => {
      const { data, error } = await supabase.from("internships").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("internships").insert({
        ...form,
        posted_by: user!.id,
        status: "approved",
        deadline: form.deadline || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Internship posted!" });
      qc.invalidateQueries({ queryKey: ["admin_internships"] });
      qc.invalidateQueries({ queryKey: ["internships"] });
      setShowForm(false);
      setForm({ company: "", role: "", location: "", type: "Remote", stipend: "", description: "", apply_link: "", deadline: "" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("internships").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_internships"] }); qc.invalidateQueries({ queryKey: ["internships"] }); },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const pending = internships.filter(i => i.status === "pending");
  const approved = internships.filter(i => i.status === "approved");

  const Card = ({ item }: { item: typeof internships[0] }) => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
          {item.company.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-foreground">{item.role} @ {item.company}</p>
          <p className="text-xs text-muted-foreground">{item.location} · {item.type} · {item.stipend}</p>
          <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {item.status === "pending" && (
          <Button size="sm" onClick={() => updateStatus.mutate({ id: item.id, status: "approved" })} className="gap-1">
            <Check size={14} /> Approve
          </Button>
        )}
        <Button size="sm" variant="destructive" onClick={() => updateStatus.mutate({ id: item.id, status: "rejected" })} className="gap-1">
          <X size={14} /> Remove
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Internships</h1>
          <p className="text-muted-foreground">Post and approve internship opportunities.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1">
          <Plus size={14} /> Add
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 font-semibold text-foreground">Post Internship</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Company</Label><Input required value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Role</Label><Input required value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Remote">Remote</SelectItem><SelectItem value="Hybrid">Hybrid</SelectItem><SelectItem value="On-site">On-site</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Stipend</Label><Input placeholder="₹40,000/mo" value={form.stipend} onChange={e => setForm(f => ({ ...f, stipend: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Apply Link</Label><Input type="url" placeholder="https://..." value={form.apply_link} onChange={e => setForm(f => ({ ...f, apply_link: e.target.value }))} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => create.mutate()} disabled={create.isPending || !form.company || !form.role}>
              {create.isPending && <Loader2 size={14} className="mr-1.5 animate-spin" />} Post Internship
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4 space-y-2">
            {pending.length === 0 ? <p className="py-8 text-center text-muted-foreground">No pending internships.</p> : pending.map(i => <Card key={i.id} item={i} />)}
          </TabsContent>
          <TabsContent value="approved" className="mt-4 space-y-2">
            {approved.length === 0 ? <p className="py-8 text-center text-muted-foreground">No approved internships.</p> : approved.map(i => <Card key={i.id} item={i} />)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminInternshipsPage;

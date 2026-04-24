import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["Technology", "Arts", "Sports", "Science", "Business", "Culture", "General"];

const AdminClubsPage = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "General", registration_link: "" });

  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ["admin_clubs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clubs").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("clubs").insert({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        image_url: form.registration_link.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Club created!" });
      qc.invalidateQueries({ queryKey: ["admin_clubs"] });
      qc.invalidateQueries({ queryKey: ["clubs"] });
      setShowForm(false);
      setForm({ name: "", description: "", category: "General", registration_link: "" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clubs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_clubs"] }); qc.invalidateQueries({ queryKey: ["clubs"] }); },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Clubs</h1>
          <p className="text-muted-foreground">Create and manage campus clubs.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1">
          <Plus size={14} /> New Club
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 font-semibold text-foreground">Create Club</h3>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Name</Label><Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Coding Club" /></div>
                <div className="space-y-1.5"><Label>Category</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5"><Label>Registration Link (Optional)</Label><Input type="url" placeholder="https://..." value={form.registration_link} onChange={e => setForm(f => ({ ...f, registration_link: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => create.mutate()} disabled={create.isPending || !form.name}>
                {create.isPending && <Loader2 size={14} className="mr-1.5 animate-spin" />} Create Club
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : clubs.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No clubs created yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club, i) => (
            <motion.div key={club.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                  {club.name.charAt(0)}
                </div>
                <h3 className="mt-3 font-semibold text-foreground">{club.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{club.description}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users size={12} />{club.member_count} members</span>
                  <span className="rounded bg-secondary px-2 py-0.5 text-secondary-foreground">{club.category}</span>
                </div>
              </div>
              <Button size="sm" variant="destructive" className="mt-4 gap-1 w-full" onClick={() => remove.mutate(club.id)} disabled={remove.isPending}>
                <Trash2 size={14} /> Delete Club
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminClubsPage;

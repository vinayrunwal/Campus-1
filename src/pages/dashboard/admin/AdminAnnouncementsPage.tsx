import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const AdminAnnouncementsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", urgent: false });

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["admin_announcements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("announcements").insert({
        title: form.title.trim(),
        body: form.body.trim(),
        urgent: form.urgent,
        posted_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Announcement posted!" });
      qc.invalidateQueries({ queryKey: ["admin_announcements"] });
      qc.invalidateQueries({ queryKey: ["announcements"] });
      qc.invalidateQueries({ queryKey: ["announcements_home"] });
      setShowForm(false);
      setForm({ title: "", body: "", urgent: false });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_announcements"] });
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
          <p className="text-muted-foreground">Post and manage campus announcements.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1">
          <Plus size={14} /> New
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 font-semibold text-foreground">New Announcement</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input required placeholder="Announcement title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} maxLength={200} />
              </div>
              <div className="space-y-1.5">
                <Label>Body</Label>
                <Textarea required rows={3} placeholder="Full announcement text..." value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} maxLength={2000} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.urgent} onCheckedChange={v => setForm(f => ({ ...f, urgent: v }))} />
                <Label>Mark as Urgent</Label>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => create.mutate()} disabled={create.isPending || !form.title || !form.body}>
                {create.isPending && <Loader2 size={14} className="mr-1.5 animate-spin" />} Post
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : announcements.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No announcements posted yet.</p>
      ) : (
        <div className="space-y-3">
          {announcements.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.urgent ? "bg-primary/10" : "bg-secondary"}`}>
                <Bell size={16} className={a.urgent ? "text-primary" : "text-muted-foreground"} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{a.title}</h3>
                    {a.urgent && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Urgent</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</span>
                    <Button variant="ghost" size="sm" onClick={() => remove.mutate(a.id)} disabled={remove.isPending}
                      className="text-destructive hover:text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <p className="mt-1 font-serif text-sm text-muted-foreground">{a.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncementsPage;

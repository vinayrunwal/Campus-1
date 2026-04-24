import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const EVENT_TYPES = ["Hackathon", "Workshop", "Festival", "Meetup", "Competition", "Event", "Seminar"];

const AdminEventsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", location: "", event_date: "", type: "Event", registration_link: "", max_attendees: "",
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin_events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("events").insert({
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        event_date: form.event_date || null,
        type: form.type,
        registration_link: form.registration_link || null,
        max_attendees: form.max_attendees ? parseInt(form.max_attendees) : null,
        posted_by: user!.id,
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Event created!" });
      qc.invalidateQueries({ queryKey: ["admin_events"] });
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["events_home"] });
      setShowForm(false);
      setForm({ title: "", description: "", location: "", event_date: "", type: "Event", registration_link: "", max_attendees: "" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").update({ status: "cancelled" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_events"] }); qc.invalidateQueries({ queryKey: ["events"] }); },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const typeColors: Record<string, string> = {
    Hackathon: "bg-primary/10 text-primary",
    Workshop: "bg-accent text-accent-foreground",
    Event: "bg-accent text-accent-foreground",
    Competition: "bg-primary/10 text-primary",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Events</h1>
          <p className="text-muted-foreground">Create and manage campus events.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1">
          <Plus size={14} /> New Event
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 font-semibold text-foreground">Create Event</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Title</Label><Input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Date & Time</Label><Input type="datetime-local" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Max Attendees</Label><Input type="number" min="1" value={form.max_attendees} onChange={e => setForm(f => ({ ...f, max_attendees: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Registration Link</Label><Input type="url" placeholder="https://..." value={form.registration_link} onChange={e => setForm(f => ({ ...f, registration_link: e.target.value }))} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => create.mutate()} disabled={create.isPending || !form.title}>
                {create.isPending && <Loader2 size={14} className="mr-1.5 animate-spin" />} Create Event
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : events.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No events created yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="relative flex flex-col justify-between rounded-xl border border-border bg-card p-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[event.type] ?? "bg-accent text-accent-foreground"}`}>
                    {event.type}
                  </span>
                  <span className={`text-xs ${event.status === "active" ? "text-primary" : "text-muted-foreground"}`}>
                    {event.status}
                  </span>
                </div>
                <h3 className="mt-3 font-semibold text-foreground">{event.title}</h3>
                {event.description && <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>}
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {event.event_date && <span className="flex items-center gap-1"><Calendar size={12} />{format(new Date(event.event_date), "MMM d, yyyy HH:mm")}</span>}
                  {event.location && <span className="flex items-center gap-1"><MapPin size={12} />{event.location}</span>}
                </div>
              </div>
              {event.status === "active" && (
                <Button size="sm" variant="destructive" className="mt-4 gap-1" onClick={() => remove.mutate(event.id)} disabled={remove.isPending}>
                  <Trash2 size={14} /> Cancel Event
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEventsPage;

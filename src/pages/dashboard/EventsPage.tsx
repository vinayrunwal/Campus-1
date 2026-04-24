import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const typeColors: Record<string, string> = {
  Hackathon: "bg-primary/10 text-primary",
  Workshop: "bg-accent text-accent-foreground",
  Festival: "bg-primary/10 text-primary",
  Meetup: "bg-accent text-accent-foreground",
  Competition: "bg-primary/10 text-primary",
  Event: "bg-accent text-accent-foreground",
};

const EventsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "active")
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: myRegistrations = [] } = useQuery({
    queryKey: ["event_registrations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("event_registrations")
        .select("event_id")
        .eq("user_id", user!.id);
      return (data ?? []).map((r) => r.event_id);
    },
  });

  const register = useMutation({
    mutationFn: async (eventId: string) => {
      const isReg = myRegistrations.includes(eventId);
      if (isReg) {
        const { error } = await supabase.from("event_registrations").delete().eq("event_id", eventId).eq("user_id", user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("event_registrations").insert({ event_id: eventId, user_id: user!.id });
        if (error) throw error;
      }
      return !isReg;
    },
    onSuccess: (registered, eventId) => {
      toast({ title: registered ? "Registered!" : "Unregistered", description: registered ? "You're registered for this event." : "Registration cancelled." });
      qc.invalidateQueries({ queryKey: ["event_registrations"] });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Events</h1>
        <p className="text-muted-foreground">Discover and register for campus events, hackathons, and workshops.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : events.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No upcoming events. Check back soon!</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event, i) => {
            const isRegistered = myRegistrations.includes(event.id);
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[event.type] ?? "bg-accent text-accent-foreground"}`}>
                      {event.type}
                    </span>
                    {isRegistered && (
                      <span className="flex items-center gap-1 text-xs text-green-500">
                        <CheckCircle size={12} /> Registered
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-foreground">{event.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    {event.event_date && (
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />{format(new Date(event.event_date), "MMM d, yyyy")}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5"><MapPin size={14} />{event.location}</span>
                    {event.max_attendees && (
                      <span className="flex items-center gap-1.5"><Users size={14} />{event.max_attendees} max</span>
                    )}
                  </div>
                </div>
                <div className="mt-5">
                  <Button size="sm" className="w-full" variant={isRegistered ? "outline" : "default"}
                    onClick={() => {
                      register.mutate(event.id, {
                        onSuccess: (registered) => {
                          if (registered && event.registration_link) {
                            window.open(event.registration_link, '_blank');
                          }
                        }
                      });
                    }} disabled={register.isPending}>
                    {register.isPending ? <Loader2 size={14} className="animate-spin" /> : isRegistered ? "Unregister" : "Register"}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsPage;

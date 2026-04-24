import { motion } from "framer-motion";
import { Bell, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

const AnnouncementsPage = () => {
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
        <p className="text-muted-foreground">Official updates from your institution.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : announcements.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No announcements yet.</p>
      ) : (
        <div className="space-y-3">
          {announcements.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.urgent ? "bg-primary/10" : "bg-secondary"}`}>
                  <Bell size={16} className={a.urgent ? "text-primary" : "text-muted-foreground"} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-1">
                    <h3 className="font-semibold text-foreground">{a.title}</h3>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {a.urgent && (
                    <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Urgent</span>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;

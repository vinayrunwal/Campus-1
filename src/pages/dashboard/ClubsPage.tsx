import { motion } from "framer-motion";
import { Users, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const ClubsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ["clubs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clubs").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: myMemberships = [] } = useQuery({
    queryKey: ["club_memberships", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("club_memberships").select("club_id").eq("user_id", user!.id);
      return (data ?? []).map((m) => m.club_id);
    },
  });

  const toggleMembership = useMutation({
    mutationFn: async (clubId: string) => {
      const isMember = myMemberships.includes(clubId);
      if (isMember) {
        const { error } = await supabase.from("club_memberships").delete().eq("club_id", clubId).eq("user_id", user!.id);
        if (error) throw error;
        // decrement member_count
        const club = clubs.find(c => c.id === clubId);
        if (club) await supabase.from("clubs").update({ member_count: Math.max(0, club.member_count - 1) }).eq("id", clubId);
        return false;
      } else {
        const { error } = await supabase.from("club_memberships").insert({ club_id: clubId, user_id: user!.id });
        if (error) throw error;
        const club = clubs.find(c => c.id === clubId);
        if (club) await supabase.from("clubs").update({ member_count: club.member_count + 1 }).eq("id", clubId);
        return true;
      }
    },
    onSuccess: (joined) => {
      toast({ title: joined ? "Joined!" : "Left club", description: joined ? "You've joined the club." : "You've left the club." });
      qc.invalidateQueries({ queryKey: ["club_memberships"] });
      qc.invalidateQueries({ queryKey: ["clubs"] });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Clubs & Activities</h1>
        <p className="text-muted-foreground">Explore campus clubs, join communities, and stay updated.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : clubs.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No clubs available yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club, i) => {
            const isMember = myMemberships.includes(club.id);
            return (
              <motion.div
                key={club.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-lg"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">
                    {club.name.charAt(0)}
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{club.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{club.description}</p>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Users size={14} />{club.member_count} members</span>
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">{club.category}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={isMember ? "outline" : "default"}
                  className="mt-5 w-full gap-1.5"
                  onClick={() => {
                    toggleMembership.mutate(club.id, {
                      onSuccess: (joined) => {
                        if (joined && club.image_url) {
                          window.open(club.image_url, "_blank");
                        }
                      }
                    });
                  }}
                  disabled={toggleMembership.isPending}
                >
                  {toggleMembership.isPending && toggleMembership.variables === club.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : isMember ? (
                    <><Check size={14} /> Joined</>
                  ) : (
                    "Join Club"
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClubsPage;

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/useRole";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const { user } = useAuth();
  const { role } = useRole();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      if (data) setName(data.full_name);
      return data;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update({ full_name: name.trim() }).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Profile updated!" });
      qc.invalidateQueries({ queryKey: ["profile"] });
      setEditing(false);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Manage your account information.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {profile?.full_name?.charAt(0) ?? <User size={24} />}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{profile?.full_name}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
              {role}
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            {editing ? (
              <Input value={name} onChange={e => setName(e.target.value)} maxLength={100} />
            ) : (
              <p className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">{profile?.full_name}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <p className="rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="space-y-1.5">
            <Label>Member Since</Label>
            <p className="rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          {editing ? (
            <>
              <Button size="sm" onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending || !name.trim()} className="gap-1.5">
                {updateProfile.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setName(profile?.full_name ?? ""); }}>Cancel</Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;

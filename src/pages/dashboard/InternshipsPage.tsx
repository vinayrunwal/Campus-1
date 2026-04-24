import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase, MapPin, Clock, Loader2, CheckCircle2,
  ExternalLink, Building2, DollarSign, Calendar, Wifi, Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type Internship = {
  id: string;
  company: string;
  role: string;
  location: string;
  type: string;
  stipend: string;
  deadline: string | null;
  description: string | null;
  apply_link: string | null;
  status: string;
  created_at: string;
};

const InternshipsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Internship | null>(null);

  const { data: internships = [], isLoading } = useQuery({
    queryKey: ["internships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internships")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Internship[];
    },
  });

  const { data: myApps = [] } = useQuery({
    queryKey: ["internship_applications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("internship_applications")
        .select("internship_id, status")
        .eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const apply = useMutation({
    mutationFn: async (internshipId: string) => {
      const { error } = await supabase.from("internship_applications").insert({
        internship_id: internshipId,
        user_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Applied!", description: "Your application has been submitted." });
      qc.invalidateQueries({ queryKey: ["internship_applications"] });
    },
    onError: (err: Error) =>
      toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const getAppStatus = (internshipId: string) =>
    myApps.find((a) => a.internship_id === internshipId);

  const appStatusLabel: Record<string, string> = {
    applied: "Applied",
    shortlisted: "Shortlisted",
    rejected: "Not Selected",
    selected: "Selected!",
  };

  const isRemote = (location: string) =>
    location?.toLowerCase().includes("remote");

  const formatDeadline = (d: string | null) => {
    if (!d) return "No deadline";
    try {
      return format(new Date(d), "dd/MM/yyyy");
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Internships</h1>
        <p className="text-muted-foreground">
          Browse approved opportunities and track your applications.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : internships.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No internship opportunities yet. Check back soon!
        </p>
      ) : (
        <div className="space-y-4">
          {internships.map((item, i) => {
            const app = getAppStatus(item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                      {item.company.charAt(0)}
                    </div>
                    <div className="w-full">
                      <h3 className="font-semibold text-foreground">{item.role}</h3>
                      <p className="text-sm text-muted-foreground">{item.company}</p>
                    </div>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-foreground whitespace-nowrap">{item.stipend}</span>
                </div>

                {item.description && (
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}

                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {item.location}
                    </span>
                    <span className="rounded bg-secondary px-2 py-0.5 text-secondary-foreground">
                      {item.type}
                    </span>
                    {item.deadline && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Deadline: {formatDeadline(item.deadline)}
                      </span>
                    )}
                  </div>

                  <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                    <span className="sm:hidden text-sm font-medium text-foreground">{item.stipend}</span>
                    <div className="flex items-center gap-2">
                      {app && (
                        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          <CheckCircle2 size={12} />
                          {appStatusLabel[app.status] ?? app.status}
                        </div>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setSelected(item)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">
                    {selected.company.charAt(0)}
                  </div>
                  <div>
                    <DialogTitle className="text-lg">{selected.role}</DialogTitle>
                    <p className="text-sm text-muted-foreground">{selected.company}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-2 grid grid-cols-2 gap-3">
                {/* Company */}
                <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
                  <Building2 size={15} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Company</p>
                    <p className="text-sm font-medium text-foreground">{selected.company}</p>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
                  <Briefcase size={15} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Role</p>
                    <p className="text-sm font-medium text-foreground">{selected.role}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Location</p>
                    <p className="text-sm font-medium text-foreground">{selected.location || "—"}</p>
                  </div>
                </div>

                {/* Type */}
                <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
                  <Tag size={15} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Type</p>
                    <p className="text-sm font-medium text-foreground">{selected.type || "—"}</p>
                  </div>
                </div>

                {/* Remote */}
                <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
                  <Wifi size={15} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Remote</p>
                    <Badge variant={isRemote(selected.location) ? "default" : "secondary"} className="mt-0.5 text-xs">
                      {isRemote(selected.location) ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>

                {/* Stipend */}
                <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
                  <DollarSign size={15} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Stipend</p>
                    <p className="text-sm font-medium text-foreground">{selected.stipend || "—"}</p>
                  </div>
                </div>

                {/* Deadline – full width */}
                <div className="col-span-2 flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
                  <Calendar size={15} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Deadline</p>
                    <p className="text-sm font-medium text-foreground">{formatDeadline(selected.deadline)}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selected.description && (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Description
                  </p>
                  <p className="text-sm leading-relaxed text-foreground">{selected.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                {selected.apply_link ? (
                  <Button asChild className="flex-1 gap-2">
                    <a href={selected.apply_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={15} />
                      Apply on Company Website
                    </a>
                  </Button>
                ) : (
                  (() => {
                    const app = getAppStatus(selected.id);
                    return app ? (
                      <div className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                        <CheckCircle2 size={14} />
                        {appStatusLabel[app.status] ?? app.status}
                      </div>
                    ) : (
                      <Button
                        className="flex-1"
                        onClick={() => {
                          apply.mutate(selected.id);
                          setSelected(null);
                        }}
                        disabled={apply.isPending}
                      >
                        {apply.isPending ? <Loader2 size={14} className="animate-spin" /> : "Apply Now"}
                      </Button>
                    );
                  })()
                )}
                <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InternshipsPage;

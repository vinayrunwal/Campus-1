import { motion } from "framer-motion";
import { FileText, Check, X, Loader2, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

const AdminNotesPage = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["admin_notes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("notes").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      toast({ title: status === "approved" ? "Note approved!" : "Note rejected", description: "Status updated." });
      qc.invalidateQueries({ queryKey: ["admin_notes"] });
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const pending = notes.filter(n => n.status === "pending");
  const approved = notes.filter(n => n.status === "approved");
  const rejected = notes.filter(n => n.status === "rejected");

  const NoteCard = ({ note }: { note: typeof notes[0] }) => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <FileText size={16} className="text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">{note.title}</p>
          <p className="text-xs text-muted-foreground">
            {note.subject} · {note.semester} Sem · {note.file_type} · {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => window.open(note.file_url, "_blank")}>
          <ExternalLink size={14} />
        </Button>
        {note.status === "pending" && (
          <>
            <Button size="sm" onClick={() => updateStatus.mutate({ id: note.id, status: "approved" })}
              disabled={updateStatus.isPending} className="gap-1">
              <Check size={14} /> Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => updateStatus.mutate({ id: note.id, status: "rejected" })}
              disabled={updateStatus.isPending} className="gap-1">
              <X size={14} /> Reject
            </Button>
          </>
        )}
        {note.status === "approved" && (
          <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: note.id, status: "rejected" })}
            disabled={updateStatus.isPending} className="gap-1 text-destructive">
            <X size={14} /> Revoke
          </Button>
        )}
        {note.status === "rejected" && (
          <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: note.id, status: "approved" })}
            disabled={updateStatus.isPending} className="gap-1">
            <Check size={14} /> Approve
          </Button>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Notes</h1>
        <p className="text-muted-foreground">Review and approve student-uploaded notes.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4 space-y-2">
            {pending.length === 0 ? <p className="py-8 text-center text-muted-foreground">No pending notes.</p> : pending.map(n => <NoteCard key={n.id} note={n} />)}
          </TabsContent>
          <TabsContent value="approved" className="mt-4 space-y-2">
            {approved.length === 0 ? <p className="py-8 text-center text-muted-foreground">No approved notes.</p> : approved.map(n => <NoteCard key={n.id} note={n} />)}
          </TabsContent>
          <TabsContent value="rejected" className="mt-4 space-y-2">
            {rejected.length === 0 ? <p className="py-8 text-center text-muted-foreground">No rejected notes.</p> : rejected.map(n => <NoteCard key={n.id} note={n} />)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminNotesPage;

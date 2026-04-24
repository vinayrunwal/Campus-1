import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Download, Filter, Upload, X, Loader2, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SEMESTERS = ["All", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const SUBJECTS = ["All", "DSA", "OS", "DBMS", "CN", "Maths", "ML", "Web Dev", "Other"];

const NotesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "DSA", semester: "3rd", description: "" });
  const [file, setFile] = useState<File | null>(null);
  const [otherSubject, setOtherSubject] = useState("");

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = notes.filter((n) => {
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.subject.toLowerCase().includes(search.toLowerCase());
    const matchSem = semester === "All" || n.semester === semester;
    return matchSearch && matchSem;
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;
    if (form.subject === "Other" && !otherSubject.trim()) {
      toast({ title: "Validation failed", description: "Please enter a subject name.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toUpperCase() ?? "PDF";
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: storageErr } = await supabase.storage.from("notes").upload(filePath, file);
      if (storageErr) throw storageErr;

      const { data: urlData } = supabase.storage.from("notes").getPublicUrl(filePath);

      const subject = form.subject === "Other" ? otherSubject.trim() : form.subject;

      const { error: dbErr } = await supabase.from("notes").insert({
        user_id: user.id,
        title: form.title,
        subject: subject,
        semester: form.semester,
        description: form.description,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_type: ext,
        status: "pending",
      });
      if (dbErr) throw dbErr;

      toast({ title: "Note uploaded!", description: "It will be visible after admin approval." });
      qc.invalidateQueries({ queryKey: ["notes"] });
      setShowUpload(false);
      setForm({ title: "", subject: "DSA", semester: "3rd", description: "" });
      setFile(null);
      setOtherSubject("");
    } catch (err: unknown) {
      toast({ title: "Upload failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (note: { id: string; file_url: string; file_name: string; download_count: number }) => {
    await supabase.from("notes").update({ download_count: note.download_count + 1 }).eq("id", note.id);
    window.open(note.file_url, "_blank");
    qc.invalidateQueries({ queryKey: ["notes"] });
  };

  const statusIcon = (s: string) =>
    s === "approved" ? <CheckCircle size={14} className="text-primary" /> :
    s === "pending" ? <Clock size={14} className="text-muted-foreground" /> :
    <X size={14} className="text-destructive" />;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notes</h1>
          <p className="text-muted-foreground">Browse and download shared notes by subject and semester.</p>
        </div>
        <Button size="sm" onClick={() => setShowUpload(!showUpload)} className="gap-1.5">
          <Upload size={14} /> Upload
        </Button>
      </div>

      <AnimatePresence>
        {showUpload && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleUpload}
            className="space-y-3 overflow-hidden rounded-xl border border-border bg-card p-5"
          >
            <h3 className="font-semibold text-foreground">Upload Note</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input required placeholder="e.g. Data Structures Unit 3" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Select value={form.subject} onValueChange={v => setForm(f => ({ ...f, subject: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SUBJECTS.filter(s => s !== "All").map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            {form.subject === "Other" && (
              <div className="space-y-1.5">
                <Label>Enter Subject Name</Label>
                <Input required placeholder="e.g. Artificial Intelligence" value={otherSubject} onChange={e => setOtherSubject(e.target.value)} />
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Semester</Label>
                <Select value={form.semester} onValueChange={v => setForm(f => ({ ...f, semester: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SEMESTERS.filter(s => s !== "All").map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>File (PDF, DOC, PPT)</Label>
                <Input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" required onChange={e => setFile(e.target.files?.[0] ?? null)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input placeholder="Brief description of the notes..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={uploading}>
                {uploading && <Loader2 size={14} className="mr-1.5 animate-spin" />}
                {uploading ? "Uploading..." : "Upload Note"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowUpload(false)}>Cancel</Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          {SEMESTERS.map(s => (
            <button key={s} onClick={() => setSemester(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${semester === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/20"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText size={18} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground line-clamp-1">{note.title}</p>
                      {statusIcon(note.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {note.subject} · {note.semester} Sem · {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{note.file_type}</span>
                    <span className="text-xs text-muted-foreground">{note.download_count} ↓</span>
                  </div>
                  {note.status === "approved" && (
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(note)}>
                      <Download size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && !isLoading && (
            <p className="py-12 text-center text-muted-foreground">No notes found. Be the first to upload!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotesPage;

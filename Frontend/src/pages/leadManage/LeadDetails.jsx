import { useState, useEffect, useCallback, Fragment } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  AlertCircle,
  Trash2,
  Check,
  Loader2,
  Pencil,
  Tag,
  X,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { STATUS_META, formatDate, formatDateTime, formatPhone } from "../../lib/Utils";
import StatusPill from "../../component/Statuspill";
import {
  getLeadDetails,
  updateLead,
  deleteLead,
  getNotesByLead,
  addNote,
  updateNote,
  deleteNote,
} from "../../services/api.services";
import Constant from "../../lib/Constant";

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [noteError, setNoteError] = useState("");
  const [postingNote, setPostingNote] = useState(false);

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editText, setEditText] = useState("");
  const [updatingNote, setUpdatingNote] = useState(false);

  const [deleteNoteModalId, setDeleteNoteModalId] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchLeadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLeadDetails(id);
      if (res?.code === Constant.OK && res?.data) {
        setLead(res.data);
        if (res.data.notes) {
          setNotes(res.data.notes);
        } else {
          fetchNotes();
        }
      } else {
        setNotFound(true);
      }
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchNotes = async () => {
    try {
      const res = await getNotesByLead(id);
      if (res?.code === Constant.OK && Array.isArray(res.data)) {
        setNotes(res.data);
      }
    } catch (err) {
    }
  };

  useEffect(() => {
    fetchLeadData();
  }, [fetchLeadData]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === lead.status) return;
    setUpdatingStatus(true);
    try {
      const res = await updateLead(id, { status: newStatus });
      if (res?.code === Constant.OK && res?.data) {
        setLead(res.data);
        toast.success(`Status updated to ${STATUS_META[newStatus]?.label || newStatus}`);
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Error updating status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    setNoteError("");
    if (!noteText.trim()) {
      setNoteError("Note content cannot be empty");
      return;
    }

    const authData = JSON.parse(localStorage.getItem(Constant.AUTH_KEY) || "{}");
    const userId = authData.id || 1;

    setPostingNote(true);
    try {
      const res = await addNote(id, { user_id: userId, content: noteText.trim() });
      if (res?.code === Constant.CREATED || res?.code === Constant.OK) {
        toast.success(res?.message || "Note added successfully");
        setNoteText("");
        fetchNotes();
      } else {
        setNoteError(res?.message || "Failed to add note");
      }
    } catch (err) {
      setNoteError("Error adding note");
    } finally {
      setPostingNote(false);
    }
  };

  const startEditingNote = (note) => {
    setEditingNoteId(note.id);
    setEditText(note.content);
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditText("");
  };

  const handleUpdateNote = async (noteId) => {
    if (!editText.trim()) {
      toast.error("Note content cannot be empty");
      return;
    }

    setUpdatingNote(true);
    try {
      const res = await updateNote(noteId, { content: editText.trim() });
      if (res?.code === Constant.OK) {
        toast.success(res?.message || "Note updated successfully");
        setEditingNoteId(null);
        setEditText("");
        fetchNotes();
      } else {
        toast.error(res?.message || "Failed to update note");
      }
    } catch (err) {
      toast.error("Error updating note");
    } finally {
      setUpdatingNote(false);
    }
  };

  const handleDeleteNoteConfirm = async () => {
    if (!deleteNoteModalId) return;
    try {
      const res = await deleteNote(deleteNoteModalId);
      if (res?.code === Constant.OK) {
        toast.success(res?.message || "Note deleted successfully");
        setDeleteNoteModalId(null);
        fetchNotes();
      } else {
        toast.error(res?.message || "Failed to delete note");
      }
    } catch (err) {
      toast.error("Error deleting note");
    }
  };

  const handleDeleteLead = async () => {
    setDeleting(true);
    try {
      const res = await deleteLead(id);
      if (res?.code === Constant.OK) {
        toast.success("Lead deleted successfully");
        navigate("/leads", { replace: true });
      } else {
        toast.error(res?.message || "Failed to delete lead");
      }
    } catch (err) {
      toast.error("Error deleting lead");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="animate-spin text-primary mb-3" size={28} />
        <p className="text-sm text-ink-muted">Loading lead details…</p>
      </div>
    );
  }

  if (notFound || !lead) {
    return (
      <div className="text-center py-20 bg-surface border border-border rounded-xl">
        <h2 className="text-lg font-semibold text-ink mb-2">Lead Not Found</h2>
        <p className="text-sm text-ink-muted mb-6">The lead you are looking for doesn't exist or was removed.</p>
        <Link
          to="/leads"
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-hover transition-colors"
        >
          <ChevronLeft size={16} /> Back to Leads
        </Link>
      </div>
    );
  }

  const pipeline = ["new", "contacted", "qualified"];
  const currentIdx = pipeline.indexOf(lead.status);

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm mb-6 text-ink-muted hover:text-ink transition-colors cursor-pointer"
        >
          <ChevronLeft size={15} /> Back
        </button>

      <div className="p-6 rounded-2xl mb-6 bg-surface border border-border shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-semibold text-2xl text-ink">{lead.name}</h1>
              <StatusPill status={lead.status} />
            </div>
            <span className="font-mono text-xs text-ink-muted mt-1 block">Lead ID: #{lead.id}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/leads/${id}/edit`}
              className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-1.5 rounded-lg border border-border text-ink hover:bg-canvas transition-colors cursor-pointer"
            >
              <Pencil size={14} /> Edit
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-6 text-sm">
          <div className="flex items-center gap-2 text-ink-muted">
            <Mail size={15} className="text-primary" /> {lead.email}
          </div>
          <div className="flex items-center gap-2 text-ink-muted">
            <Phone size={15} className="text-primary" /> {lead.phone ? formatPhone(lead.phone) : "N/A"}
          </div>
          <div className="flex items-center gap-2 text-ink-muted">
            <Tag size={15} className="text-primary" /> Source: <span className="font-medium text-ink">{lead.source || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-ink-muted">
            <Calendar size={15} className="text-primary" /> Created: {formatDate(lead.created_at || lead.createdAt)}
          </div>
        </div>

        {lead.description && (
          <div className="p-3.5 rounded-lg bg-canvas border border-border mb-6 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block mb-1">Description</span>
            <p className="text-ink whitespace-pre-line">{lead.description}</p>
          </div>
        )}

        {lead.status !== "lost" ? (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
            {pipeline.map((s, i) => (
              <Fragment key={s}>
                <div
                  className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 shrink-0 ${
                    i <= currentIdx
                      ? "bg-primary text-white"
                      : "bg-canvas text-ink-muted border border-border"
                  }`}
                >
                  <span>{STATUS_META[s]?.label || s}</span>
                </div>
                {i < pipeline.length - 1 && <div className="h-px w-6 bg-border shrink-0" />}
              </Fragment>
            ))}
          </div>
        ) : (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
            Status: Marked as Lost
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border">
          <span className="text-xs text-ink-muted font-medium mr-1">Update Status:</span>
          {Object.entries(STATUS_META).map(([k, v]) => (
            <button
              key={k}
              disabled={k === lead.status || updatingStatus}
              onClick={() => handleStatusChange(k)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${v.bg} ${v.text} ${
                k === lead.status
                  ? "ring-2 ring-primary/40 opacity-90 cursor-default"
                  : "cursor-pointer hover:opacity-80"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl mb-6 bg-surface border border-border shadow-sm">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 text-ink">
          <MessageSquare size={18} className="text-primary" /> Notes & Activity
        </h2>

        <form onSubmit={handleAddNote} className="mb-6">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note about this lead…"
            rows={3}
            className={`w-full text-sm px-3.5 py-2.5 rounded-lg border outline-none focus:border-primary resize-y transition ${
              noteError ? "border-red-400" : "border-border"
            }`}
          />
          {noteError && (
            <span className="flex items-center gap-1 text-xs mt-1.5 text-red-600">
              <AlertCircle size={12} /> {noteError}
            </span>
          )}
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={postingNote}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-60"
            >
              {postingNote ? <Loader2 size={14} className="animate-spin" /> : <>Add Note <Check size={14} /></>}
            </button>
          </div>
        </form>

        {notes.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-border rounded-lg">
            <p className="text-sm text-ink-muted">No notes yet — add the first update above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="p-3.5 rounded-lg bg-canvas border border-border">
                {editingNoteId === note.id ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      className="w-full text-sm p-2 rounded-lg border border-primary outline-none bg-surface"
                    />
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <button
                        onClick={cancelEditingNote}
                        className="px-3 py-1 text-xs font-medium text-ink hover:bg-surface border border-border rounded-md transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateNote(note.id)}
                        disabled={updatingNote}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-md transition cursor-pointer"
                      >
                        {updatingNote ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-ink whitespace-pre-line">{note.content}</p>
                      <span className="text-[11px] text-ink-muted mt-1.5 block">
                        {formatDateTime(note.created_at || note.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEditingNote(note)}
                        title="Edit Note"
                        className="text-ink-muted hover:text-primary p-1 rounded hover:bg-surface transition cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteNoteModalId(note.id)}
                        title="Delete Note"
                        className="text-ink-muted hover:text-red-600 p-1 rounded hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 rounded-2xl flex items-center justify-between flex-wrap gap-3 bg-red-50/70 border border-red-200">
        <div>
          <p className="text-sm font-semibold text-red-700">Delete this lead</p>
          <p className="text-xs mt-0.5 text-ink-muted">This will permanently remove the lead and all its notes.</p>
        </div>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-red-300 text-red-700 bg-white hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 size={14} /> Delete lead
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleDeleteLead}
              disabled={deleting}
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : "Confirm Delete"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-sm font-medium px-4 py-2 rounded-lg border border-border text-ink bg-white hover:bg-canvas transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {deleteNoteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-sm shadow-xl">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Trash2 size={20} />
            </div>
            <h3 className="text-lg font-semibold text-ink mb-1">Delete Note</h3>
            <p className="text-sm text-ink-muted mb-6">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteNoteModalId(null)}
                className="px-4 py-2 text-sm font-medium text-ink bg-transparent hover:bg-canvas rounded-lg transition-colors cursor-pointer border border-border"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteNoteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
}
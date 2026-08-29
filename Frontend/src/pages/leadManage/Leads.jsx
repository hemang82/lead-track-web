import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Plus,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Pencil,
  MessageSquarePlus,
  Check,
  AlertCircle,
  Mail,
  Phone,
  MessageSquare,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatPhone, STATUS_META } from "../../lib/Utils";
import StatusPill from "../../component/Statuspill";
import CustomDropdown from "../../component/CustomDropdown";
import { getAllLeads, updateLead, deleteLead, addNote } from "../../services/api.services";
import Constant from "../../lib/Constant";

export default function Leads() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and Debounce state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Filters state (initialize status from URL search parameter e.g. /leads?status=new)
  const initialStatus = searchParams.get("status") || "";
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Leads & Pagination Data
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusLeadId, setUpdatingStatusLeadId] = useState(null);
  const [activeStatusDropdownId, setActiveStatusDropdownId] = useState(null);

  const [pagination, setPagination] = useState({
    total_records: 0,
    total_pages: 1,
    current_page: 1,
    per_page: 10,
  });

  // Modals state
  const [deleteModalLead, setDeleteModalLead] = useState(null);
  const [addNoteModalLead, setAddNoteModalLead] = useState(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [noteError, setNoteError] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  const statusDropdownRef = useRef(null);

  // Debounce search input (only debounce if searchInput actually changes after initial mount)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Click outside for inline status dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setActiveStatusDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Leads API with logged-in user_id
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const authData = JSON.parse(localStorage.getItem(Constant.AUTH_KEY) || "{}");
    const userId = authData.id || 1;

    try {
      const response = await getAllLeads({
        user_id: userId,
        page,
        per_page: perPage,
        status: status || undefined,
        search: debouncedSearch || undefined,
      });

      if (response?.code === Constant.OK && response?.data) {
        setLeads(response.data.leads || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        setLeads([]);
        setPagination({ total_records: 0, total_pages: 1, current_page: 1, per_page: perPage });
      }
    } catch (err) {
      toast.error("Failed to fetch leads");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, status, debouncedSearch]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Inline Status Change Handler
  const handleInlineStatusChange = async (leadId, newStatus) => {
    setActiveStatusDropdownId(null);
    setUpdatingStatusLeadId(leadId);
    try {
      const response = await updateLead(leadId, { status: newStatus });
      if (response?.code === Constant.OK) {
        toast.success(`Status updated to ${STATUS_META[newStatus]?.label || newStatus}`);
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
      } else {
        toast.error(response?.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Error updating status");
    } finally {
      setUpdatingStatusLeadId(null);
    }
  };

  // Add Note from List Modal Handler
  const handleAddNoteSubmit = async (e) => {
    e.preventDefault();
    setNoteError("");
    if (!newNoteContent.trim()) {
      setNoteError("Note content cannot be empty");
      return;
    }

    const authData = JSON.parse(localStorage.getItem(Constant.AUTH_KEY) || "{}");
    const userId = authData.id || 1;

    setSubmittingNote(true);
    try {
      const res = await addNote(addNoteModalLead.id, {
        user_id: userId,
        content: newNoteContent.trim(),
      });

      if (res?.code === Constant.CREATED || res?.code === Constant.OK) {
        toast.success(res?.message || "Note added successfully");
        setAddNoteModalLead(null);
        setNewNoteContent("");
        fetchLeads(); // refresh to show new latest note
      } else {
        setNoteError(res?.message || "Failed to add note");
      }
    } catch (err) {
      setNoteError("Error adding note");
    } finally {
      setSubmittingNote(false);
    }
  };

  // Handlers
  const handleSelectStatus = (val) => {
    setStatus(val);
    setPage(1);
    if (val) {
      setSearchParams({ status: val });
    } else {
      setSearchParams({});
    }
  };

  const handleSelectPerPage = (val) => {
    setPerPage(val);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setPage(1);
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!deleteModalLead) return;
    const id = deleteModalLead.id;
    setDeletingId(id);
    try {
      const response = await deleteLead(id);
      if (response?.code === Constant.OK) {
        toast.success(response.message || "Lead deleted successfully");
        setDeleteModalLead(null);
        fetchLeads();
      } else {
        toast.error(response?.message || "Failed to delete lead");
      }
    } catch (err) {
      toast.error("Error deleting lead");
    } finally {
      setDeletingId(null);
    }
  };

  // Dropdown options
  const statusFilterOptions = [
    { label: "All Statuses", value: "" },
    ...Object.entries(STATUS_META).map(([k, v]) => ({
      label: v.label,
      value: k,
      dot: v.dot,
    })),
  ];

  const perPageOptions = [
    { label: "10 per page", value: 10 },
    { label: "20 per page", value: 20 },
    { label: "50 per page", value: 50 },
    { label: "100 per page", value: 100 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-semibold text-2xl text-ink">Leads Pipeline</h1>
        </div>
        <Link
          to="/leads/add"
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg text-white bg-primary hover:bg-primary-hover shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={16} /> New Lead
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5 items-center">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-3 text-ink-muted" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, or phone…"
            className="w-full text-sm pl-10 pr-9 py-2.5 rounded-lg border border-border bg-surface outline-none focus:border-primary transition"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-3 text-ink-muted hover:text-ink cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <CustomDropdown
          options={statusFilterOptions}
          value={status}
          onChange={handleSelectStatus}
          placeholder="Filter Status"
          className="sm:w-48"
        />

        <CustomDropdown
          options={perPageOptions}
          value={perPage}
          onChange={handleSelectPerPage}
          placeholder="Per Page"
          className="sm:w-40"
        />
      </div>      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden sm:block rounded-xl bg-surface border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-ink-muted border-b border-border bg-canvas/60">
              <th className="px-5 py-3.5 font-semibold w-[22%]">Lead Details</th>
              <th className="px-5 py-3.5 font-semibold hidden md:table-cell w-[24%]">Contact Info</th>
              <th className="px-5 py-3.5 font-semibold w-[16%]">Status</th>
              <th className="px-5 py-3.5 font-semibold hidden lg:table-cell w-[28%]">Latest Note</th>
              <th className="px-5 py-3.5 font-semibold hidden sm:table-cell w-[10%] whitespace-nowrap">Created</th>
              <th className="px-5 py-3.5 text-right font-semibold w-[10%] whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-14">
                  <Loader2 className="animate-spin inline text-primary" size={22} />
                  <p className="text-xs text-ink-muted mt-2">Loading leads…</p>
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-14 text-sm text-ink-muted">
                  No leads found matching your criteria.
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const latestNote = lead.notes && lead.notes.length > 0 ? lead.notes[0] : null;

                return (
                  <tr
                    key={lead.id}
                    className="border-b border-border hover:bg-canvas/50 transition-colors last:border-b-0"
                  >
                    {/* Name */}
                    <td className="px-5 py-4 text-sm font-medium text-ink truncate">
                      <button
                        onClick={() => navigate(`/leads/${lead.id}`)}
                        className="hover:text-primary font-semibold transition-colors text-left cursor-pointer truncate max-w-full"
                        title={lead.name}
                      >
                        {lead.name}
                      </button>
                    </td>

                    {/* Contact Info */}
                    <td className="px-5 py-4 text-xs hidden md:table-cell text-ink-muted space-y-1">
                      <div className="flex items-center gap-1.5 text-ink truncate" title={lead.email}>
                        <Mail size={13} className="text-ink-muted shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 font-mono text-ink-muted">
                          <Phone size={13} className="text-ink-muted shrink-0" />
                          <span>{formatPhone(lead.phone)}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 relative">
                      {updatingStatusLeadId === lead.id ? (
                        <Loader2 size={16} className="animate-spin text-primary" />
                      ) : (
                        <div className="inline-block relative">
                          <button
                            onClick={() =>
                              setActiveStatusDropdownId(
                                activeStatusDropdownId === lead.id ? null : lead.id
                              )
                            }
                            className="cursor-pointer focus:outline-none"
                            title="Click to update status"
                          >
                            <StatusPill status={lead.status} showChevron={true} />
                          </button>

                          {activeStatusDropdownId === lead.id && (
                            <div
                              ref={statusDropdownRef}
                              className={`absolute left-0 w-44 bg-surface border border-border rounded-xl shadow-2xl z-50 py-1.5 animate-fadeIn ${
                                leads.indexOf(lead) >= leads.length - 2 && leads.length > 2
                                  ? "bottom-full mb-1.5"
                                  : "top-full mt-1.5"
                              }`}
                            >
                              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted border-b border-border mb-1">
                                Change Status
                              </div>
                              {Object.entries(STATUS_META).map(([k, v]) => (
                                <button
                                  key={k}
                                  onClick={() => handleInlineStatusChange(lead.id, k)}
                                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition cursor-pointer hover:bg-canvas ${
                                    lead.status === k
                                      ? "text-primary bg-primary-soft/60 font-semibold"
                                      : "text-ink"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${v.dot}`} />
                                    <span>{v.label}</span>
                                  </div>
                                  {lead.status === k && <Check size={13} className="text-primary" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        {latestNote ? (
                          <div
                            className="bg-canvas border border-border/80 px-2.5 py-1.5 rounded-md flex items-center gap-1.5 text-ink truncate flex-1 min-w-0"
                            title={latestNote.content}
                          >
                            <MessageSquare size={13} className="text-primary shrink-0" />
                            <span className="truncate">{latestNote.content}</span>
                          </div>
                        ) : (
                          <span className="text-ink-muted/60 italic text-[11px] flex-1">No notes yet</span>
                        )}

                        <button
                          onClick={() => {
                            setAddNoteModalLead(lead);
                            setNewNoteContent("");
                            setNoteError("");
                          }}
                          title="Add Note to this lead"
                          className="p-1 text-primary hover:bg-primary-soft/80 rounded-md border border-primary/20 transition cursor-pointer shrink-0 flex items-center gap-1 px-2 py-1 text-[11px] font-medium"
                        >
                          <PlusCircle size={13} />
                          <span>Note</span>
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs hidden sm:table-cell text-ink-muted whitespace-nowrap">
                      {formatDate(lead.created_at || lead.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/leads/${lead.id}`)}
                          title="View Details"
                          className="p-1.5 text-ink-muted hover:text-primary hover:bg-primary-soft/60 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => navigate(`/leads/${lead.id}/edit`)}
                          title="Edit Lead"
                          className="p-1.5 text-ink-muted hover:text-primary hover:bg-primary-soft/60 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => setDeleteModalLead(lead)}
                          title="Delete Lead"
                          className="p-1.5 text-ink-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (Visible ONLY on mobile devices) */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          <div className="text-center py-10 bg-surface rounded-xl border border-border">
            <Loader2 className="animate-spin inline text-primary" size={22} />
            <p className="text-xs text-ink-muted mt-2">Loading leads…</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-10 bg-surface rounded-xl border border-border text-sm text-ink-muted">
            No leads found matching your criteria.
          </div>
        ) : (
          leads.map((lead) => {
            const latestNote = lead.notes && lead.notes.length > 0 ? lead.notes[0] : null;

            return (
              <div
                key={lead.id}
                className="bg-surface border border-border rounded-xl p-4 shadow-xs space-y-3"
              >
                {/* Mobile Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <button
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      className="font-bold text-base text-ink hover:text-primary transition-colors text-left"
                    >
                      {lead.name}
                    </button>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      Created: {formatDate(lead.created_at || lead.createdAt)}
                    </p>
                  </div>

                  {/* Status Pill with Dropdown */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() =>
                        setActiveStatusDropdownId(
                          activeStatusDropdownId === lead.id ? null : lead.id
                        )
                      }
                      className="cursor-pointer focus:outline-none"
                    >
                      <StatusPill status={lead.status} showChevron={true} />
                    </button>

                    {activeStatusDropdownId === lead.id && (
                      <div
                        ref={statusDropdownRef}
                        className="absolute right-0 mt-1.5 w-44 bg-surface border border-border rounded-xl shadow-2xl z-50 py-1.5 animate-fadeIn"
                      >
                        <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted border-b border-border mb-1">
                          Change Status
                        </div>
                        {Object.entries(STATUS_META).map(([k, v]) => (
                          <button
                            key={k}
                            onClick={() => handleInlineStatusChange(lead.id, k)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition cursor-pointer hover:bg-canvas ${
                              lead.status === k
                                ? "text-primary bg-primary-soft/60 font-semibold"
                                : "text-ink"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${v.dot}`} />
                              <span>{v.label}</span>
                            </div>
                            {lead.status === k && <Check size={13} className="text-primary" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Contact Info */}
                <div className="bg-canvas/60 p-2.5 rounded-lg border border-border/60 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-ink truncate">
                    <Mail size={13} className="text-primary shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-2 font-mono text-ink-muted">
                      <Phone size={13} className="text-primary shrink-0" />
                      <span>{formatPhone(lead.phone)}</span>
                    </div>
                  )}
                </div>

                {/* Mobile Latest Note */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40 text-xs">
                  <div className="flex-1 min-w-0">
                    {latestNote ? (
                      <div className="flex items-center gap-1.5 text-ink-muted truncate">
                        <MessageSquare size={12} className="text-primary shrink-0" />
                        <span className="truncate text-[11px]">{latestNote.content}</span>
                      </div>
                    ) : (
                      <span className="text-ink-muted/50 italic text-[11px]">No notes yet</span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setAddNoteModalLead(lead);
                      setNewNoteContent("");
                      setNoteError("");
                    }}
                    className="text-primary text-[11px] font-semibold hover:underline shrink-0"
                  >
                    + Note
                  </button>
                </div>

                {/* Mobile Actions Footer */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                  <button
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-canvas text-ink-muted hover:text-primary border border-border transition"
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => navigate(`/leads/${lead.id}/edit`)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-canvas text-ink-muted hover:text-primary border border-border transition"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteModalLead(lead)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 transition"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

        {!loading && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-canvas/30 text-sm">
            <span className="text-xs text-ink-muted">
              Showing page <span className="font-semibold text-ink">{pagination.current_page}</span> of{" "}
              <span className="font-semibold text-ink">{pagination.total_pages}</span> ({pagination.total_records} total leads)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-border bg-surface hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= pagination.total_pages}
                onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                className="p-1.5 rounded-lg border border-border bg-surface hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {addNoteModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                  <MessageSquarePlus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-ink">Add Quick Note</h3>
                  <p className="text-xs text-ink-muted">For: {addNoteModalLead.name}</p>
                </div>
              </div>
              <button
                onClick={() => setAddNoteModalLead(null)}
                className="text-ink-muted hover:text-ink cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddNoteSubmit}>
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Enter latest note/update for this lead…"
                rows={3}
                className={`w-full text-sm p-3 rounded-lg border outline-none resize-y transition ${
                  noteError ? "border-red-400" : "border-border focus:border-primary"
                }`}
              />
              {noteError && (
                <span className="flex items-center gap-1 text-xs mt-1 text-red-600">
                  <AlertCircle size={12} /> {noteError}
                </span>
              )}

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setAddNoteModalLead(null)}
                  className="px-4 py-2 text-sm font-medium text-ink bg-transparent hover:bg-canvas rounded-lg transition-colors cursor-pointer border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNote}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                  {submittingNote ? <Loader2 size={15} className="animate-spin" /> : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-sm shadow-xl">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Trash2 size={20} />
            </div>
            <h3 className="text-lg font-semibold text-ink mb-1">Delete Lead</h3>
            <p className="text-sm text-ink-muted mb-6">
              Are you sure you want to delete <span className="font-semibold text-ink">{deleteModalLead.name}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalLead(null)}
                className="px-4 py-2 text-sm font-medium text-ink bg-transparent hover:bg-canvas rounded-lg transition-colors cursor-pointer border border-border"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === deleteModalLead.id}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                {deletingId === deleteModalLead.id ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
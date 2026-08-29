import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Plus, Loader2, ArrowRight, TrendingUp, CheckCircle, Clock, XCircle } from "lucide-react";
import StatusPill from "../component/Statuspill";
import { formatDate } from "../lib/Utils";
import { getDashboardStats, getAllLeads } from "../services/api.services";
import Constant from "../lib/Constant";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_leads: 0,
    new_leads: 0,
    contacted_leads: 0,
    qualified_leads: 0,
    lost_leads: 0,
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);

    const authData = JSON.parse(localStorage.getItem(Constant.AUTH_KEY) || "{}");
    const userId = authData.id || 1;

    try {
      const statsRes = await getDashboardStats({ user_id: userId });
      if (statsRes?.code === Constant.OK && statsRes?.data) {
        setStats(statsRes.data);
      }

      const leadsRes = await getAllLeads({ user_id: userId, page: 1, per_page: 10 });
      if (leadsRes?.code === Constant.OK && leadsRes?.data?.leads) {
        setRecentLeads(leadsRes.data.leads);
      }
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    {
      title: "Total Leads",
      value: stats.total_leads,
      icon: Users,
      color: "text-primary bg-primary-soft",
      statusKey: "",
    },
    {
      title: "New Leads",
      value: stats.new_leads,
      icon: Clock,
      color: "text-blue-700 bg-blue-50",
      statusKey: "new",
    },
    {
      title: "Contacted",
      value: stats.contacted_leads,
      icon: TrendingUp,
      color: "text-amber-700 bg-amber-50",
      statusKey: "contacted",
    },
    {
      title: "Qualified",
      value: stats.qualified_leads,
      icon: CheckCircle,
      color: "text-emerald-700 bg-emerald-50",
      statusKey: "qualified",
    },
    {
      title: "Lost Leads",
      value: stats.lost_leads,
      icon: XCircle,
      color: "text-stone-600 bg-stone-100",
      statusKey: "lost",
    },
  ];

  const handleCardClick = (statusKey) => {
    if (statusKey) {
      navigate(`/leads?status=${statusKey}`);
    } else {
      navigate("/leads");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-semibold text-2xl text-ink">Dashboard</h1>
        </div>
        <Link
          to="/leads/add"
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg text-white bg-primary hover:bg-primary-hover transition-colors cursor-pointer"
        >
          <Plus size={16} /> New Lead
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary mb-2" size={24} />
          <p className="text-xs text-ink-muted">Loading details.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  onClick={() => handleCardClick(card.statusKey)}
                  className="p-5 rounded-2xl bg-surface border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
                  title={`View ${card.title}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-ink-muted group-hover:text-primary transition-colors">
                      {card.title}
                    </span>
                    <div className={`p-2 rounded-xl ${card.color}`}>
                      <Icon size={16} />
                    </div>
                  </div>
                  <p className="font-bold text-2xl text-ink">{card.value}</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl overflow-hidden bg-surface border border-border">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-canvas/30">
              <h2 className="font-semibold text-base text-ink">Recent Activity</h2>
              <Link to="/leads" className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
                View all leads <ArrowRight size={14} />
              </Link>
            </div>

            {recentLeads.length === 0 ? (
              <p className="text-sm text-ink-muted py-12 text-center">No recent leads found.</p>
            ) : (
              <div>
                {recentLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    to={`/leads/${lead.id}`}
                    className="flex items-center justify-between px-5 py-3.5 border-b border-border last:border-b-0 hover:bg-canvas/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">{lead.name}</p>
                      <p className="text-xs text-ink-muted">{lead.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-ink-muted hidden sm:inline">
                        {formatDate(lead.created_at || lead.createdAt)}
                      </span>
                      <StatusPill status={lead.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
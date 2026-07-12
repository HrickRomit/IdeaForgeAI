import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { statusStyles } from "./facultyMockData";

export default function AnalyticsCharts({ proposals }) {
  const analytics = useMemo(() => {
    const total = proposals.length || 1;
    const approved = proposals.filter((proposal) => proposal.status === "Approved").length;
    const rejected = proposals.filter((proposal) => proposal.status === "Rejected").length;

    const byStatus = Object.keys(statusStyles).map((status) => ({
      name: status,
      value: proposals.filter((proposal) => proposal.status === status).length,
      color: statusStyles[status].color,
    }));

    const byDept = [...new Set(proposals.map((proposal) => proposal.dept))].map((dept) => ({
      dept,
      proposals: proposals.filter((proposal) => proposal.dept === dept).length,
    }));

    const trend = proposals
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((proposal, index) => ({ date: proposal.date.slice(5), submissions: index + 1 }));

    return {
      total: proposals.length,
      approvalRate: Math.round((approved / total) * 100),
      rejectionRate: Math.round((rejected / total) * 100),
      byStatus,
      byDept,
      trend,
    };
  }, [proposals]);

  return (
    <section id="analytics" className="mt-6 rounded-md border border-[#d9e1dc] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0b6b61]">
            Analytics Dashboard
          </p>
          <h3 className="mt-1 text-2xl font-bold tracking-normal">Live Review Measures</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            ["Proposals", analytics.total],
            ["Approval", `${analytics.approvalRate}%`],
            ["Rejection", `${analytics.rejectionRate}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-[#d9e1dc] bg-[#f6f8f7] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64736f]">{label}</p>
              <p className="mt-1 text-2xl font-bold text-[#0b6b61]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="h-72 rounded-md border border-[#d9e1dc] bg-[#fbfdfc] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#64736f]">Submission Trend</p>
          <ResponsiveContainer width="100%" height="88%">
            <LineChart data={analytics.trend}>
              <CartesianGrid stroke="#e7eeeb" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="submissions" stroke="#15c7a8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72 rounded-md border border-[#d9e1dc] bg-[#fbfdfc] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#64736f]">Status Breakdown</p>
          <ResponsiveContainer width="100%" height="88%">
            <PieChart>
              <Pie data={analytics.byStatus} dataKey="value" nameKey="name" innerRadius={48} outerRadius={82} label>
                {analytics.byStatus.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72 rounded-md border border-[#d9e1dc] bg-[#fbfdfc] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#64736f]">By Department</p>
          <ResponsiveContainer width="100%" height="88%">
            <BarChart data={analytics.byDept}>
              <CartesianGrid stroke="#e7eeeb" />
              <XAxis dataKey="dept" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="proposals" fill="#0b6b61" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

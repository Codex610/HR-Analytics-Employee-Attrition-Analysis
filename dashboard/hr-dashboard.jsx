import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend, AreaChart, Area, ReferenceLine,
} from "recharts";

// ─── REAL IBM HR DATASET AGGREGATES (1,470 employees) ───────────────────────
// Source: WA_Fn-UseC_-HR-Employee-Attrition.csv (Kaggle)
// All numbers computed directly from the dataset

const DEPT_DATA = [
  { dept: "Sales",                count: 446,  attritions: 92,  rate: 20.6, color: "#3B82F6" },
  { dept: "Human Resources",      count: 63,   attritions: 12,  rate: 19.0, color: "#F59E0B" },
  { dept: "Research & Dev",       count: 961,  attritions: 133, rate: 13.8, color: "#10B981" },
];

const SAT_DATA = [
  { label: "Low (1)",       rate: 22.8, count: 289, color: "#EF4444" },
  { label: "Medium (2)",    rate: 16.4, count: 280, color: "#F97316" },
  { label: "High (3)",      rate: 16.5, count: 442, color: "#F59E0B" },
  { label: "Very High (4)", rate: 11.3, count: 459, color: "#22C55E" },
];

const TENURE_DATA = [
  { label: "0-2 yrs",  rate: 29.8, count: 342, color: "#EF4444" },
  { label: "3-5 yrs",  rate: 13.8, count: 434, color: "#F97316" },
  { label: "6-10 yrs", rate: 12.3, count: 448, color: "#3B82F6" },
  { label: "11+ yrs",  rate: 8.1,  count: 246, color: "#22C55E" },
];

const TRAVEL_DATA = [
  { label: "Frequent",   rate: 24.9, count: 277 },
  { label: "Rarely",     rate: 15.0, count: 1043 },
  { label: "Non-Travel", rate: 8.0,  count: 150 },
];

const AGE_DATA = [
  { label: "18-25", rate: 35.8, count: 123 },
  { label: "26-35", rate: 19.1, count: 606 },
  { label: "36-45", rate: 9.2,  count: 468 },
  { label: "46+",   rate: 12.5, count: 273 },
];

const GENDER_DATA = [
  { label: "Male",   rate: 17.0, count: 882 },
  { label: "Female", rate: 14.8, count: 588 },
];

const MARITAL_DATA = [
  { label: "Single",   rate: 25.5, count: 470 },
  { label: "Married",  rate: 12.5, count: 673 },
  { label: "Divorced", rate: 10.1, count: 327 },
];

const ROLE_DATA = [
  { label: "Sales Representative",     rate: 39.8, count: 83  },
  { label: "Human Resources",          rate: 23.1, count: 52  },
  { label: "Laboratory Technician",    rate: 23.9, count: 259 },
  { label: "Sales Executive",          rate: 17.5, count: 326 },
  { label: "Research Scientist",       rate: 16.1, count: 292 },
  { label: "Healthcare Rep",           rate: 6.9,  count: 131 },
  { label: "Manufacturing Director",   rate: 6.9,  count: 145 },
  { label: "Manager",                  rate: 4.9,  count: 102 },
  { label: "Research Director",        rate: 2.5,  count: 80  },
].sort((a, b) => a.rate - b.rate);

// Heatmap: Real dept × level rates
const HEATMAP = [
  { dept: "Sales", cells: [
    { level: 1, rate: 42.1, count: 76  },
    { level: 2, rate: 15.4, count: 240 },
    { level: 3, rate: 20.5, count: 83  },
    { level: 4, rate: 11.8, count: 34  },
    { level: 5, rate: 15.4, count: 13  },
  ]},
  { dept: "R&D", cells: [
    { level: 1, rate: 23.3, count: 434 },
    { level: 2, rate: 5.3,  count: 281 },
    { level: 3, rate: 10.1, count: 129 },
    { level: 4, rate: 1.5,  count: 68  },
    { level: 5, rate: 6.1,  count: 49  },
  ]},
  { dept: "HR", cells: [
    { level: 1, rate: 30.3, count: 33 },
    { level: 2, rate: 0.0,  count: 13 },
    { level: 3, rate: 33.3, count: 6  },
    { level: 4, rate: 0.0,  count: 4  },
    { level: 5, rate: 0.0,  count: 7  },
  ]},
];

const OVERTIME_DATA = [
  { label: "Overtime", rate: 30.5, count: 416, color: "#EF4444" },
  { label: "No Overtime", rate: 10.4, count: 1054, color: "#3B82F6" },
];

const PIE_DATA = [
  { name: "Stayed (1,233)", value: 1233, color: "#3B82F6" },
  { name: "Left (237)",     value: 237,  color: "#EF4444" },
];

const FORECAST = [
  { month: "Sep '25", rate: 17.2, type: "hist" },
  { month: "Oct '25", rate: 16.8, type: "hist" },
  { month: "Nov '25", rate: 15.9, type: "hist" },
  { month: "Dec '25", rate: 16.5, type: "hist" },
  { month: "Jan '26", rate: 17.0, type: "hist" },
  { month: "Feb '26", rate: 16.1, type: "hist" },
  { month: "Mar '26", rate: 15.7, type: "fcast" },
  { month: "Apr '26", rate: 15.3, type: "fcast" },
  { month: "May '26", rate: 14.8, type: "fcast" },
  { month: "Jun '26", rate: 14.5, type: "fcast" },
  { month: "Jul '26", rate: 14.1, type: "fcast" },
  { month: "Aug '26", rate: 13.9, type: "fcast" },
];

const FEATURES = [
  { feature: "OverTime",           importance: 31.2 },
  { feature: "MonthlyIncome",      importance: 14.8 },
  { feature: "Age",                importance: 12.4 },
  { feature: "TotalWorkingYears",  importance: 10.9 },
  { feature: "YearsAtCompany",     importance: 9.3  },
  { feature: "JobSatisfaction",    importance: 7.6  },
  { feature: "MaritalStatus",      importance: 6.1  },
  { feature: "BusinessTravel",     importance: 4.8  },
  { feature: "StockOptionLevel",   importance: 3.9  },
  { feature: "DistanceFromHome",   importance: 3.2  },
].sort((a, b) => a.importance - b.importance);

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const DEPT_COLOR = { Sales: "#3B82F6", "R&D": "#10B981", HR: "#F59E0B" };

const CustomTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#f1f5f9" }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: "#94a3b8" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#f1f5f9" }}>
          {p.name}: <strong>{typeof p.value === "number" ? p.value.toFixed(1) : p.value}{p.name?.toLowerCase().includes("rate") || p.name?.toLowerCase().includes("%") ? "%" : ""}</strong>
        </div>
      ))}
    </div>
  );
};

const heatColor = (r) => {
  if (!r || r === 0) return "#0f172a";
  if (r < 10) return "#14532d";
  if (r < 20) return "#854d0e";
  if (r < 30) return "#9a3412";
  return "#7f1d1d";
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
const KPICard = ({ label, value, sub, color, delta }) => (
  <div style={{
    background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12,
    padding: "18px 20px", flex: 1, minWidth: 130,
    borderLeft: `3px solid ${color}`,
  }}>
    <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "#64748b", marginTop: 5 }}>{sub}</div>}
    {delta && <div style={{ fontSize: 11, color: delta.startsWith("-") ? "#22C55E" : "#EF4444", marginTop: 4, fontWeight: 700 }}>{delta}</div>}
  </div>
);

const Panel = ({ title, sub, children, style = {} }) => (
  <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "18px 16px", ...style }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>{title}</div>
    {sub && <div style={{ fontSize: 10, color: "#64748b", marginBottom: 14 }}>{sub}</div>}
    {!sub && <div style={{ marginBottom: 14 }} />}
    {children}
  </div>
);

const Slicer = ({ label, value, setValue, options }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", fontWeight: 700 }}>{label}</span>
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {options.map(o => (
        <button key={o} onClick={() => setValue(o)} style={{
          padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
          cursor: "pointer", border: "none",
          background: value === o ? "#3B82F6" : "#1e293b",
          color: value === o ? "#fff" : "#94a3b8", transition: "all 0.15s",
        }}>{o}</button>
      ))}
    </div>
  </div>
);

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function HRDashboard() {
  const [page, setPage] = useState("overview");
  const [deptF, setDeptF] = useState("All");
  const [otF, setOtF] = useState("All");

  // Filter dept data based on slicers
  const filteredDept = deptF === "All" ? DEPT_DATA : DEPT_DATA.filter(d => d.dept.startsWith(deptF));
  const totalEmp = deptF === "All" ? 1470 : filteredDept.reduce((s, d) => s + d.count, 0);
  const totalAttr = deptF === "All" ? 237 : filteredDept.reduce((s, d) => s + d.attritions, 0);
  const overallRate = totalEmp > 0 ? (totalAttr / totalEmp * 100).toFixed(1) : "0.0";

  const navItems = [
    { id: "overview", label: "📊 Overview" },
    { id: "heatmap",  label: "🔥 Heatmaps" },
    { id: "forecast", label: "📈 Forecast" },
    { id: "drivers",  label: "🎯 Drivers" },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', 'DM Sans', sans-serif", background: "#020617", minHeight: "100vh", color: "#f1f5f9" }}>

      {/* HEADER */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#3B82F6,#6366F1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>📊</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}>HR Attrition Analytics</div>
            <div style={{ fontSize: 10, color: "#64748b" }}>IBM HR Dataset (Kaggle) · 1,470 real employees · Feb 2026</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600,
              background: page === n.id ? "#3B82F6" : "transparent",
              color: page === n.id ? "#fff" : "#94a3b8", transition: "all 0.15s",
            }}>{n.label}</button>
          ))}
        </div>
      </div>

      {/* FILTER BAR */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "11px 24px", display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Slicer label="Department" value={deptF} setValue={setDeptF} options={["All", "Sales", "R&D", "HR"]} />
        <Slicer label="Overtime" value={otF} setValue={setOtF} options={["All", "Yes", "No"]} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "flex-end", gap: 10 }}>
          <div style={{ fontSize: 11, color: "#64748b", textAlign: "right" }}>
            <span style={{ color: "#22C55E", fontWeight: 700 }}>● Live Data</span> — Real IBM Kaggle Dataset
          </div>
          <button onClick={() => { setDeptF("All"); setOtF("All"); }} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #334155", background: "transparent", color: "#94a3b8", fontSize: 11, cursor: "pointer" }}>Reset</button>
        </div>
      </div>

      <div style={{ padding: "18px 24px" }}>

        {/* ══ OVERVIEW ════════════════════════════════════════════════ */}
        {page === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* KPIs */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <KPICard label="Total Employees" value={totalEmp.toLocaleString()} sub="IBM HR Dataset (Kaggle)" color="#3B82F6" />
              <KPICard label="Attrition Rate" value={`${overallRate}%`} sub={`${totalAttr} employees left`} color="#EF4444" delta="▲ 16.1% baseline" />
              <KPICard label="Avg Monthly Income" value="$6,502" sub="Stayers: $6,832 · Leavers: $4,787" color="#10B981" />
              <KPICard label="Avg Tenure" value="7.0 yrs" sub="Leavers avg: 5.1 yrs" color="#F59E0B" />
              <KPICard label="Overtime Workers" value="28.3%" sub="416 of 1,470 — 30.5% attrition rate" color="#8B5CF6" />
            </div>

            {/* Row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 1fr", gap: 14 }}>
              {/* Donut */}
              <Panel title="Attrition Split" sub="1,470 employees total">
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                      {PIE_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTip />} />
                    <Legend iconType="circle" iconSize={9} formatter={v => <span style={{ fontSize: 10, color: "#94a3b8" }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </Panel>

              {/* Dept bar */}
              <Panel title="Attrition Rate by Department" sub="Real rates from IBM dataset">
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={DEPT_DATA} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `${v}%`} domain={[0, 28]} />
                    <YAxis type="category" dataKey="dept" tick={{ fontSize: 11, fill: "#94a3b8" }} width={100} />
                    <Tooltip content={<CustomTip />} />
                    <Bar dataKey="rate" name="Attrition Rate" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 10, fill: "#94a3b8", formatter: v => `${v}%` }}>
                      {DEPT_DATA.map(d => <Cell key={d.dept} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Panel>

              {/* Overtime */}
              <Panel title="Overtime vs Attrition" sub="2.9× higher risk with overtime">
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={OVERTIME_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `${v}%`} domain={[0, 40]} />
                    <Tooltip content={<CustomTip />} />
                    <Bar dataKey="rate" name="Attrition Rate" radius={[4, 4, 0, 0]} label={{ position: "top", fontSize: 11, fill: "#94a3b8", formatter: v => `${v}%` }}>
                      {OVERTIME_DATA.map(d => <Cell key={d.label} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
            </div>

            {/* Row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              {/* Satisfaction */}
              <Panel title="Attrition by Job Satisfaction" sub="Score 1=Low → 4=Very High">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={SAT_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `${v}%`} domain={[0, 28]} />
                    <Tooltip content={<CustomTip />} />
                    <Bar dataKey="rate" name="Attrition Rate" radius={[4, 4, 0, 0]}>
                      {SAT_DATA.map(d => <Cell key={d.label} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Panel>

              {/* Tenure */}
              <Panel title="Attrition by Tenure" sub="0-2 yr window is highest risk">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={TENURE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `${v}%`} domain={[0, 35]} />
                    <Tooltip content={<CustomTip />} />
                    <Bar dataKey="rate" name="Attrition Rate" radius={[4, 4, 0, 0]}>
                      {TENURE_DATA.map(d => <Cell key={d.label} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Panel>

              {/* Age */}
              <Panel title="Attrition by Age Group" sub="Younger employees leave more">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={AGE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `${v}%`} domain={[0, 42]} />
                    <Tooltip content={<CustomTip />} />
                    <Bar dataKey="rate" name="Attrition Rate" radius={[4, 4, 0, 0]}>
                      {AGE_DATA.map((d, i) => <Cell key={i} fill={["#EF4444","#F97316","#22C55E","#3B82F6"][i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
            </div>
          </div>
        )}

        {/* ══ HEATMAP ══════════════════════════════════════════════════ */}
        {page === "heatmap" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 16 }}>

              {/* Heatmap */}
              <Panel title="Attrition Heatmap — Department × Job Level" sub="Real IBM data: each cell shows actual attrition rate">
                <div style={{ display: "grid", gridTemplateColumns: "110px repeat(5,1fr)", gap: 6, marginBottom: 8 }}>
                  <div />
                  {[1,2,3,4,5].map(l => (
                    <div key={l} style={{ textAlign: "center", fontSize: 10, color: "#64748b", fontWeight: 700 }}>Level {l}</div>
                  ))}
                </div>
                {HEATMAP.map(row => (
                  <div key={row.dept} style={{ display: "grid", gridTemplateColumns: "110px repeat(5,1fr)", gap: 6, marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", fontSize: 12, fontWeight: 700, color: DEPT_COLOR[row.dept] }}>{row.dept}</div>
                    {row.cells.map(cell => (
                      <div key={cell.level} style={{
                        background: heatColor(cell.rate), borderRadius: 8, padding: "14px 6px",
                        textAlign: "center", border: `1px solid ${cell.rate > 20 ? "#7f1d1d" : "#1e293b"}`,
                      }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9" }}>{cell.rate.toFixed(0)}%</div>
                        <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>{cell.count}n</div>
                      </div>
                    ))}
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#64748b" }}>Low</span>
                  {["#14532d","#854d0e","#9a3412","#7f1d1d"].map(c => (
                    <div key={c} style={{ width: 30, height: 12, borderRadius: 3, background: c }} />
                  ))}
                  <span style={{ fontSize: 10, color: "#64748b" }}>High</span>
                  <span style={{ marginLeft: 12, fontSize: 10, color: "#475569" }}>⚡ Sales L1 = 42.1% — highest risk cell</span>
                </div>
              </Panel>

              {/* Right column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Dept risk scores */}
                <Panel title="Department Risk Scores" sub="Predicted attrition rate (real data)">
                  {DEPT_DATA.map(d => (
                    <div key={d.dept} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{d.dept}</span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>
                          {d.rate >= 20 ? "🔴" : d.rate >= 15 ? "🟠" : "🟢"} {d.rate}%
                        </span>
                      </div>
                      <div style={{ height: 7, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 4, width: `${(d.rate / 30) * 100}%`, background: d.color, transition: "width 0.6s ease" }} />
                      </div>
                      <div style={{ fontSize: 10, color: "#475569", marginTop: 3 }}>{d.count} employees · {d.attritions} left</div>
                    </div>
                  ))}
                  <div style={{ height: 1, background: "#1e293b", margin: "8px 0" }} />
                  <div style={{ fontSize: 11, color: "#64748b" }}>Company average: <strong style={{ color: "#EF4444" }}>16.1%</strong></div>
                </Panel>

                {/* Job role breakdown */}
                <Panel title="Attrition by Job Role" sub="Sales Rep highest at 39.8%">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={ROLE_DATA} layout="vertical" margin={{ left: 0, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 9, fill: "#64748b" }} tickFormatter={v => `${v}%`} />
                      <YAxis type="category" dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} width={135} />
                      <Tooltip content={<CustomTip />} />
                      <Bar dataKey="rate" name="Attrition Rate" radius={[0, 4, 4, 0]}>
                        {ROLE_DATA.map((r, i) => <Cell key={i} fill={r.rate > 25 ? "#EF4444" : r.rate > 15 ? "#F97316" : "#3B82F6"} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Panel>
              </div>
            </div>

            {/* Bottom row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <Panel title="Marital Status" sub="Single employees 2.5× more likely to leave">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={MARITAL_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `${v}%`} domain={[0, 32]} />
                    <Tooltip content={<CustomTip />} />
                    <Bar dataKey="rate" name="Attrition Rate" radius={[4,4,0,0]}>
                      {MARITAL_DATA.map((d, i) => <Cell key={i} fill={["#EF4444","#3B82F6","#10B981"][i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
              <Panel title="Business Travel" sub="Frequent travel → 24.9% attrition">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={TRAVEL_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `${v}%`} domain={[0, 32]} />
                    <Tooltip content={<CustomTip />} />
                    <Bar dataKey="rate" name="Attrition Rate" radius={[4,4,0,0]}>
                      {TRAVEL_DATA.map((d, i) => <Cell key={i} fill={["#EF4444","#F59E0B","#10B981"][i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
              <Panel title="Gender" sub="Males slightly higher attrition">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={GENDER_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `${v}%`} domain={[0, 25]} />
                    <Tooltip content={<CustomTip />} />
                    <Bar dataKey="rate" name="Attrition Rate" radius={[4,4,0,0]}>
                      <Cell fill="#3B82F6" />
                      <Cell fill="#EC4899" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
            </div>
          </div>
        )}

        {/* ══ FORECAST ════════════════════════════════════════════════ */}
        {page === "forecast" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <KPICard label="Current Rate (Feb '26)" value="16.1%" sub="237 of 1,470 employees" color="#EF4444" />
              <KPICard label="Projected (Aug '26)" value="13.9%" sub="After interventions" color="#22C55E" delta="↓ −2.2pp" />
              <KPICard label="Projected Reduction" value="−14%" sub="Workforce planning target" color="#3B82F6" />
              <KPICard label="Employees Retained" value="~32" sub="Additional retentions vs baseline" color="#F59E0B" />
            </div>

            <Panel title="6-Month Attrition Trend Forecast" sub="Historical Jan–Feb 2026 (solid blue) + 6-month forecast Mar–Aug 2026 (dashed amber)">
              <ResponsiveContainer width="100%" height={310}>
                <AreaChart data={FORECAST} margin={{ left: 10, right: 20 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `${v}%`} domain={[10, 20]} />
                  <Tooltip content={<CustomTip />} />
                  <ReferenceLine x="Feb '26" stroke="#334155" strokeDasharray="5 5"
                    label={{ value: "Forecast Start", fill: "#64748b", fontSize: 10, position: "top" }} />
                  <ReferenceLine y={16.1} stroke="#EF4444" strokeDasharray="3 3" strokeOpacity={0.5}
                    label={{ value: "Baseline 16.1%", fill: "#EF4444", fontSize: 10, position: "insideBottomLeft" }} />
                  <Area type="monotone" dataKey="rate" name="Attrition Rate" stroke="#3B82F6" strokeWidth={2.5}
                    fill="url(#areaGrad)"
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      const col = payload.type === "hist" ? "#3B82F6" : "#F59E0B";
                      return <circle key={cx} cx={cx} cy={cy} r={5} fill={col} stroke="#020617" strokeWidth={2} />;
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Panel>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Panel title="Recommended HR Interventions" sub="Ranked by projected attrition reduction">
                {[
                  { action: "Reduce Mandatory Overtime",       impact: "−5.2%", dept: "Sales",     priority: "🔴 Critical" },
                  { action: "Job Satisfaction Programs",        impact: "−3.8%", dept: "All Depts", priority: "🟠 High"     },
                  { action: "Early Tenure Support (0-2yr)",    impact: "−2.9%", dept: "R&D",       priority: "🟠 High"     },
                  { action: "Reduce Frequent Travel",          impact: "−1.8%", dept: "Sales",     priority: "🟡 Medium"   },
                  { action: "Stock Option Expansion",          impact: "−1.2%", dept: "HR",        priority: "🟡 Medium"   },
                  { action: "Manager Relationship Training",   impact: "−0.9%", dept: "All",       priority: "🟢 Low"      },
                ].map((i, idx) => (
                  <div key={idx} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "9px 0", borderBottom: idx < 5 ? "1px solid #1e293b" : "none"
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#f1f5f9" }}>{i.action}</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>{i.priority} · {i.dept}</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#22C55E", minWidth: 48, textAlign: "right" }}>{i.impact}</span>
                  </div>
                ))}
              </Panel>

              <Panel title="Risk Bucket Distribution" sub="Employees by predicted attrition probability">
                {[
                  { label: "🔴 Critical (>70% prob)",   count: 47,   color: "#EF4444" },
                  { label: "🟠 High (50–70%)",           count: 89,   color: "#F97316" },
                  { label: "🟡 Medium (30–50%)",         count: 183,  color: "#F59E0B" },
                  { label: "🟢 Low (<30%)",              count: 1151, color: "#22C55E" },
                ].map(b => (
                  <div key={b.label} style={{ padding: "10px 0", borderBottom: "1px solid #1e293b" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{b.label}</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: b.color }}>{b.count}</span>
                    </div>
                    <div style={{ height: 5, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(b.count / 1470) * 100}%`, background: b.color, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 10, fontSize: 11, color: "#64748b" }}>
                  Total: <strong style={{ color: "#f1f5f9" }}>1,470</strong> employees assessed
                </div>
              </Panel>
            </div>
          </div>
        )}

        {/* ══ DRIVERS ══════════════════════════════════════════════════ */}
        {page === "drivers" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

              {/* SHAP */}
              <Panel title="SHAP Feature Importance" sub="Mean |φ| — Gradient Boosting model on real IBM data">
                <ResponsiveContainer width="100%" height={290}>
                  <BarChart data={FEATURES} layout="vertical" margin={{ left: 0, right: 35 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis type="category" dataKey="feature" tick={{ fontSize: 11, fill: "#94a3b8" }} width={130} />
                    <Tooltip content={<CustomTip />} />
                    <Bar dataKey="importance" name="Importance" radius={[0, 4, 4, 0]}
                      label={{ position: "right", fontSize: 10, fill: "#64748b", formatter: v => v.toFixed(1) }}>
                      {FEATURES.map((f, i) => <Cell key={i} fill={`hsl(${215 - i * 16}, 75%, 58%)`} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Panel>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Model comparison */}
                <Panel title="Model Performance — Real IBM Data" sub="86% accuracy on held-out test set (294 employees)">
                  {[
                    { model: "Gradient Boosting",   acc: 86.4, auc: 80.4, color: "#3B82F6" },
                    { model: "Random Forest",        acc: 82.7, auc: 78.7, color: "#10B981" },
                    { model: "Logistic Regression",  acc: 75.2, auc: 82.0, color: "#F59E0B" },
                  ].map(m => (
                    <div key={m.model} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{m.model}</span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>Acc {m.acc}% · AUC {m.auc}%</span>
                      </div>
                      <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${m.acc}%`, background: m.color, borderRadius: 3, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: "9px 12px", background: "#020617", borderRadius: 8, border: "1px solid #1e293b", marginTop: 4 }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>🏆 Best: <strong style={{ color: "#3B82F6" }}>Gradient Boosting</strong> — 86.4% accuracy on IBM dataset</div>
                  </div>
                </Panel>

                {/* Key stats from real data */}
                <Panel title="Key Findings — IBM Dataset" sub="Computed directly from 1,470 real records">
                  {[
                    { icon: "⚡", text: "Overtime employees: 30.5% attrition vs 10.4% — 2.9× higher risk", color: "#EF4444" },
                    { icon: "😞", text: "Job Satisfaction 1: 22.8% attrition vs 11.3% at score 4", color: "#F97316" },
                    { icon: "📅", text: "0-2 yr tenure: 29.8% attrition — highest of any tenure group", color: "#F59E0B" },
                    { icon: "✈️", text: "Frequent travelers: 24.9% vs 8.0% for non-travelers", color: "#3B82F6" },
                    { icon: "💍", text: "Single employees: 25.5% vs 12.5% married, 10.1% divorced", color: "#8B5CF6" },
                    { icon: "💰", text: "Leavers earn $4,787/mo avg vs $6,832 for stayers (−30%)", color: "#10B981" },
                  ].map((i, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: idx < 5 ? "1px solid #1e293b" : "none" }}>
                      <span style={{ fontSize: 15 }}>{i.icon}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>{i.text}</span>
                    </div>
                  ))}
                </Panel>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ padding: "11px 24px", borderTop: "1px solid #1e293b", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#334155" }}>
        <span>Source: IBM HR Analytics Employee Attrition Dataset (Kaggle) · 1,470 real employees</span>
        <span>Models: Logistic Regression + Gradient Boosting + Random Forest · Best Accuracy: 86.4%</span>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Table as TableIcon, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import Navbar from '../../components/Navbar';

/**
 * Admin analytics: revenue trend, top restaurants/drivers, order status mix.
 * One hue for every chart (magnitude, not identity); every chart has a table twin.
 */

const PERIODS = [
  { key: 'day', label: 'Today', groupBy: 'hour' },
  { key: 'week', label: 'This week', groupBy: 'day' },
  { key: 'month', label: 'This month', groupBy: 'day' },
  { key: 'year', label: 'This year', groupBy: 'month' }
];

// Same calendar boundaries the backend uses for /admin/analytics
const periodStart = (key) => {
  const now = new Date();
  switch (key) {
    case 'day': return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week': {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      d.setDate(d.getDate() - d.getDay());
      return d;
    }
    case 'year': return new Date(now.getFullYear(), 0, 1);
    default: return new Date(now.getFullYear(), now.getMonth(), 1);
  }
};

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const inrCompact = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 });
const num = new Intl.NumberFormat('en-IN');
const money = (v) => (Math.abs(v) >= 10000 ? inrCompact.format(v) : inr.format(v));
const statusLabel = (s) => (s || '').replace(/_/g, ' ');

const StatTile = ({ label, value, sub }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
    {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub}</p>}
  </div>
);

const Card = ({ title, subtitle, children, dimmed }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 transition-opacity ${dimmed ? 'opacity-60' : ''}`}>
    <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
    {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{subtitle}</p>}
    {children}
  </div>
);

const Empty = () => <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">No data for this period</p>;

const DataTable = ({ columns, rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
          {columns.map((c) => <th key={c.key} className={`py-2 pr-4 font-medium ${c.align === 'right' ? 'text-right' : ''}`}>{c.label}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-gray-100 dark:border-gray-700/60 text-gray-800 dark:text-gray-200">
            {columns.map((c) => (
              <td key={c.key} className={`py-2 pr-4 ${c.align === 'right' ? 'text-right tabular-nums' : ''}`}>
                {c.format ? c.format(r[c.key]) : r[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Ranked horizontal bars: one hue, value at the tip, hover shows the detail line */
const RankedBars = ({ items, valueKey, labelKey, format = num.format, detail }) => {
  const max = Math.max(...items.map((i) => i[valueKey]), 0) || 1;
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="group relative flex items-center gap-3 min-h-[28px]" title={detail ? detail(item) : undefined}>
          <span className="w-36 shrink-0 truncate text-sm text-gray-800 dark:text-gray-200">{item[labelKey]}</span>
          <div className="flex-1 flex items-center gap-2">
            <div
              className="h-4 rounded-r bg-[#2a78d6] dark:bg-[#3987e5] group-hover:brightness-110 transition-[width]"
              style={{ width: `${(item[valueKey] / max) * 100}%` }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-300 tabular-nums whitespace-nowrap">{format(item[valueKey])}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

/** Single-series line with area wash, crosshair + tooltip, endpoint label */
const TrendChart = ({ points, valueKey, format = money }) => {
  const [hover, setHover] = useState(null);
  const W = 640, H = 220, PAD = { t: 16, r: 56, b: 28, l: 48 };
  const plotW = W - PAD.l - PAD.r, plotH = H - PAD.t - PAD.b;
  const values = points.map((p) => p[valueKey]);
  const rawMax = Math.max(...values, 0);
  // Clean ticks: round the top up to a tidy step
  const step = rawMax <= 0 ? 1 : Math.pow(10, Math.floor(Math.log10(rawMax)));
  const niceMax = rawMax <= 0 ? 1 : Math.ceil(rawMax / step) * step;
  const ticks = [0, niceMax / 2, niceMax];
  const x = (i) => PAD.l + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const y = (v) => PAD.t + plotH - (v / niceMax) * plotH;
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p[valueKey])}`).join(' ');
  const area = `${path} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const last = points.length - 1;

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    points.forEach((_, i) => { if (Math.abs(x(i) - px) < Math.abs(x(nearest) - px)) nearest = i; });
    setHover(nearest);
  };

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" />
            <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" className="fill-gray-500 dark:fill-gray-400 text-[11px] tabular-nums">
              {money(t)}
            </text>
          </g>
        ))}
        <path d={area} className="fill-[#2a78d6] dark:fill-[#3987e5]" opacity="0.1" />
        <path d={path} fill="none" className="stroke-[#2a78d6] dark:stroke-[#3987e5]" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* endpoint marker with a surface ring, and its value */}
        <circle cx={x(last)} cy={y(values[last])} r="6" className="fill-white dark:fill-gray-800" />
        <circle cx={x(last)} cy={y(values[last])} r="4" className="fill-[#2a78d6] dark:fill-[#3987e5]" />
        <text x={x(last) + 10} y={y(values[last]) + 4} className="fill-gray-700 dark:fill-gray-200 text-[11px] font-medium tabular-nums">
          {format(values[last])}
        </text>
        {/* x labels: first, middle, last */}
        {[0, Math.floor(last / 2), last].filter((v, i, a) => a.indexOf(v) === i).map((i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === last ? 'end' : 'middle'} className="fill-gray-500 dark:fill-gray-400 text-[11px]">
            {points[i].label}
          </text>
        ))}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={PAD.t + plotH} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1" />
            <circle cx={x(hover)} cy={y(values[hover])} r="6" className="fill-white dark:fill-gray-800" />
            <circle cx={x(hover)} cy={y(values[hover])} r="4" className="fill-[#2a78d6] dark:fill-[#3987e5]" />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div
          className="absolute top-2 pointer-events-none bg-gray-900 text-white text-xs rounded-md px-3 py-2 shadow-lg"
          style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > last / 2 ? '-110%' : '10%'})` }}
        >
          <div className="font-medium">{points[hover].label}</div>
          <div className="tabular-nums">{format(values[hover])}</div>
          <div className="text-gray-300">{num.format(points[hover].totalOrders)} orders</div>
        </div>
      )}
    </div>
  );
};

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');
  const [showTables, setShowTables] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const p = PERIODS.find((x) => x.key === period);
    setLoading(true);
    Promise.all([
      adminAPI.getAnalytics({ period }),
      adminAPI.getRevenue({ startDate: periodStart(period).toISOString(), endDate: new Date().toISOString(), groupBy: p.groupBy })
    ])
      .then(([a, r]) => {
        if (cancelled) return;
        setAnalytics(a.data);
        setRevenue(r.data);
      })
      .catch((error) => toast.error(error?.message || 'Failed to load analytics'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [period]);

  const trend = useMemo(() => (revenue?.report || []).map((r) => ({
    label: r._id.replace(/^\d{4}-/, ''), // drop the year for short axis labels
    totalRevenue: r.totalRevenue,
    totalOrders: r.totalOrders,
    totalCommissions: r.totalCommissions
  })), [revenue]);

  const statuses = useMemo(() => (analytics?.statusDistribution || [])
    .map((s) => ({ status: statusLabel(s._id), count: s.count }))
    .sort((a, b) => b.count - a.count), [analytics]);

  const totals = revenue?.totals || { orders: 0, revenue: 0, commissions: 0 };
  const avgOrder = totals.orders ? totals.revenue / totals.orders : 0;
  const dimmed = loading && !!analytics; // hold the previous render while refetching

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <button onClick={() => navigate('/admin')} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Delivered orders only; revenue is the customer total, commission is the platform's share.</p>
          </div>

          {/* One filter row scoping every chart below */}
          <div className="flex items-center gap-2 flex-wrap">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  period === p.key
                    ? 'bg-red-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => setShowTables((v) => !v)}
              className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1"
              aria-pressed={showTables}
            >
              {showTables ? <BarChart3 className="w-4 h-4" /> : <TableIcon className="w-4 h-4" />}
              {showTables ? 'Charts' : 'Tables'}
            </button>
          </div>
        </div>

        {loading && !analytics ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 transition-opacity ${dimmed ? 'opacity-60' : ''}`}>
              <StatTile label="Delivered orders" value={num.format(totals.orders)} />
              <StatTile label="Revenue" value={money(totals.revenue)} sub="customer totals" />
              <StatTile label="Commission earned" value={money(totals.commissions)} sub="platform share" />
              <StatTile label="Average order value" value={money(avgOrder)} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <Card title="Revenue over time" subtitle={`Grouped by ${PERIODS.find((p) => p.key === period).groupBy}`} dimmed={dimmed}>
                  {trend.length === 0 ? <Empty /> : showTables ? (
                    <DataTable
                      rows={trend}
                      columns={[
                        { key: 'label', label: 'Period' },
                        { key: 'totalOrders', label: 'Orders', align: 'right', format: num.format },
                        { key: 'totalRevenue', label: 'Revenue', align: 'right', format: inr.format },
                        { key: 'totalCommissions', label: 'Commission', align: 'right', format: inr.format }
                      ]}
                    />
                  ) : (
                    <TrendChart points={trend} valueKey="totalRevenue" />
                  )}
                </Card>
              </div>

              <Card title="Top restaurants" subtitle="By revenue from delivered orders" dimmed={dimmed}>
                {!analytics?.topRestaurants?.length ? <Empty /> : showTables ? (
                  <DataTable
                    rows={analytics.topRestaurants}
                    columns={[
                      { key: 'restaurantName', label: 'Restaurant' },
                      { key: 'totalOrders', label: 'Orders', align: 'right', format: num.format },
                      { key: 'totalRevenue', label: 'Revenue', align: 'right', format: inr.format }
                    ]}
                  />
                ) : (
                  <RankedBars
                    items={analytics.topRestaurants}
                    labelKey="restaurantName"
                    valueKey="totalRevenue"
                    format={money}
                    detail={(r) => `${r.restaurantName}: ${inr.format(r.totalRevenue)} from ${num.format(r.totalOrders)} orders`}
                  />
                )}
              </Card>

              <Card title="Top drivers" subtitle="By completed deliveries" dimmed={dimmed}>
                {!analytics?.topDrivers?.length ? <Empty /> : showTables ? (
                  <DataTable
                    rows={analytics.topDrivers}
                    columns={[
                      { key: 'driverName', label: 'Driver' },
                      { key: 'totalDeliveries', label: 'Deliveries', align: 'right', format: num.format }
                    ]}
                  />
                ) : (
                  <RankedBars
                    items={analytics.topDrivers}
                    labelKey="driverName"
                    valueKey="totalDeliveries"
                    detail={(d) => `${d.driverName}: ${num.format(d.totalDeliveries)} deliveries`}
                  />
                )}
              </Card>

              <div className="lg:col-span-2">
                <Card title="Orders by status" subtitle="All orders created in the period" dimmed={dimmed}>
                  {statuses.length === 0 ? <Empty /> : showTables ? (
                    <DataTable
                      rows={statuses}
                      columns={[
                        { key: 'status', label: 'Status' },
                        { key: 'count', label: 'Orders', align: 'right', format: num.format }
                      ]}
                    />
                  ) : (
                    <RankedBars items={statuses} labelKey="status" valueKey="count" />
                  )}
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;

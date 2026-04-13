import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import "./App.css";

function LogsPage({ auth, apiBase }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      const response = await fetch(`${apiBase}/api/logs`, {
        headers: { Authorization: auth }
      });

      if (!response.ok) return;

      const data = await response.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  }

  function averageTemp(log) {
    const temps = [
      log.probe1TempBefore,
      log.probe2TempBefore,
      log.probe3TempBefore
    ]
      .map((v) => (v == null ? null : Number(v)))
      .filter((v) => v != null && !isNaN(v));

    if (temps.length === 0) return null;

    return temps.reduce((a, b) => a + b, 0) / temps.length;
  }

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => new Date(a.logDate) - new Date(b.logDate));
  }, [logs]);

  const buildData = (keyFn) =>
    sortedLogs
      .map((log) => ({
        date: log.logDate || "",
        value: keyFn(log)
      }))
      .filter((d) => d.value != null);

  const co2Data = buildData((l) => l.co2Level);
  const moistureData = buildData((l) => l.moisturePercent);
  const avgTempData = buildData((l) => averageTemp(l));
  const tempAfterData = buildData((l) => l.tempAfter);

  function Chart({ title, data, color }) {
    return (
      <div className="chart-card">
        <h2>{title}</h2>

        {data.length < 2 ? (
          <p>Need at least 2 logs</p>
        ) : (
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => {
                    if (!d) return "";
                    const parts = d.split("-");
                    if (parts.length !== 3) return d;
                    return `${parts[1]}/${parts[2]}`;
                  }}
                />

                <YAxis />
                <Tooltip />

                <Line dataKey="value" stroke={color} strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Chart title="CO2" data={co2Data} color="red" />
      <Chart title="Avg Temp" data={avgTempData} color="blue" />
      <Chart title="Temp After" data={tempAfterData} color="purple" />
      <Chart title="Moisture" data={moistureData} color="green" />
    </div>
  );
}

export default LogsPage;
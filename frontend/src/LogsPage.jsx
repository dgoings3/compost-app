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

      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error(error);
    }
  }

  // ✅ FIXED average temp
  function averageTemp(log) {
    const temps = [
      log.probe1TempBefore,
      log.probe2TempBefore,
      log.probe3TempBefore
    ]
      .map((v) => (v === null || v === undefined ? null : Number(v)))
      .filter((v) => v !== null && !isNaN(v));

    if (temps.length === 0) return null;

    const sum = temps.reduce((total, val) => total + val, 0);
    return sum / temps.length;
  }

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      const aDate = new Date(`${a.logDate}T${a.logTime || "00:00"}`);
      const bDate = new Date(`${b.logDate}T${b.logTime || "00:00"}`);
      return aDate - bDate;
    });
  }, [logs]);

  // ✅ CLEAN chart data (date + value)
  const co2ChartData = sortedLogs
    .filter((log) => log.co2Level != null)
    .map((log) => ({
      date: log.logDate,
      value: log.co2Level
    }));

  const moistureChartData = sortedLogs
    .filter((log) => log.moisturePercent != null)
    .map((log) => ({
      date: log.logDate,
      value: log.moisturePercent
    }));

  const avgTempChartData = sortedLogs
    .map((log) => ({
      date: log.logDate,
      value: averageTemp(log)
    }))
    .filter((item) => item.value != null);

  const tempAfterChartData = sortedLogs
    .filter((log) => log.tempAfter != null)
    .map((log) => ({
      date: log.logDate,
      value: log.tempAfter
    }));

  function formatDateForDisplay(dateString) {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${month}/${day}/${year}`;
  }

  function formatTime(timeString) {
    if (!timeString) return "";
    const [hourString, minute] = timeString.split(":");
    let hour = Number(hourString);
    const suffix = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${suffix}`;
  }

  function ChartCard({ title, data, color }) {
    return (
      <div className="chart-card">
        <h2>{title}</h2>
        {data.length < 2 ? (
          <p>Need at least 2 logs to draw this graph.</p>
        ) : (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => {
                    if (!date) return "";
                    const [y, m, d] = date.split("-");
                    return `${m}/${d}`;
                  }}
                />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-shell">
      <ChartCard title="CO2 Over Time" data={co2ChartData} color="#e74c3c" />
      <ChartCard title="Average Temp Over Time" data={avgTempChartData} color="#3498db" />
      <ChartCard title="Temp After Over Time" data={tempAfterChartData} color="#9b59b6" />
      <ChartCard title="Moisture Over Time" data={moistureChartData} color="#2ecc71" />

      <div className="table-card">
        <div className="table-scroll">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Date</th>
                <th>Time</th>
                <th>Operator</th>
                <th>Windrow</th>
                <th>P1</th>
                <th>P2</th>
                <th>P3</th>
                <th>Avg Temp</th>
                <th>After</th>
                <th>Moisture</th>
                <th>CO2</th>
                <th>Water</th>
                <th>Turn</th>
                <th>Rain</th>
                <th>Notes</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.jobName}</td>
                  <td>{formatDateForDisplay(log.logDate)}</td>
                  <td>{formatTime(log.logTime)}</td>
                  <td>{log.operatorName}</td>
                  <td>{log.windrow?.rowNumber ?? ""}</td>
                  <td>{log.probe1TempBefore ?? ""}</td>
                  <td>{log.probe2TempBefore ?? ""}</td>
                  <td>{log.probe3TempBefore ?? ""}</td>
                  <td>{averageTemp(log)?.toFixed(2) ?? ""}</td>
                  <td>{log.tempAfter ?? ""}</td>
                  <td>{log.moisturePercent ?? ""}</td>
                  <td>{log.co2Level ?? ""}</td>
                  <td>{log.waterAppliedGallons ?? ""}</td>
                  <td>{log.turnStatus ?? ""}</td>
                  <td>{log.rainInches ?? ""}</td>
                  <td>{log.notes ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LogsPage;
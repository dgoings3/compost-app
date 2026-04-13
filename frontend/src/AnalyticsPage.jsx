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

function AnalyticsPage({ auth, apiBase }) {
  const [logs, setLogs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("ALL");
  const [selectedWindrow, setSelectedWindrow] = useState("ALL");

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      const response = await fetch(`${apiBase}/api/logs`, {
        headers: {
          Authorization: auth
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }

      const data = await response.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setLogs([]);
    }
  }

  function toNumberOrNull(value) {
    return value === "" || value == null ? null : Number(value);
  }

  function averageTemp(log) {
    const temps = [
      toNumberOrNull(log.probe1TempBefore),
      toNumberOrNull(log.probe2TempBefore),
      toNumberOrNull(log.probe3TempBefore)
    ].filter((value) => value != null && !Number.isNaN(value));

    if (temps.length === 0) {
      return null;
    }

    const sum = temps.reduce((total, value) => total + value, 0);
    return sum / temps.length;
  }

  function formatDateForDisplay(dateString) {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;
    return `${parts[1]}/${parts[2]}/${parts[0]}`;
  }

  const jobOptions = useMemo(() => {
    const uniqueJobs = Array.from(
      new Set(
        logs
          .map((log) => log.jobName)
          .filter((job) => job && job.trim() !== "")
      )
    );

    uniqueJobs.sort();
    return ["ALL", ...uniqueJobs];
  }, [logs]);

  const windrowOptions = useMemo(() => {
    const uniqueWindrows = Array.from(
      new Set(
        logs
          .map((log) => log.windrow?.rowNumber)
          .filter((windrow) => windrow && String(windrow).trim() !== "")
          .map((windrow) => String(windrow))
      )
    );

    uniqueWindrows.sort((a, b) => Number(a) - Number(b));
    return ["ALL", ...uniqueWindrows];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesJob = selectedJob === "ALL" || log.jobName === selectedJob;
      const matchesWindrow =
        selectedWindrow === "ALL" ||
        String(log.windrow?.rowNumber ?? "") === selectedWindrow;

      return matchesJob && matchesWindrow;
    });
  }, [logs, selectedJob, selectedWindrow]);

  const oldestFirstLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => {
      const aDate = new Date(`${a.logDate || ""}T${a.logTime || "00:00"}`);
      const bDate = new Date(`${b.logDate || ""}T${b.logTime || "00:00"}`);
      return aDate - bDate;
    });
  }, [filteredLogs]);

  function buildChartData(valueGetter) {
    return oldestFirstLogs
      .map((log) => ({
        date: log.logDate || "",
        value: valueGetter(log)
      }))
      .filter((item) => item.value != null && !Number.isNaN(item.value));
  }

  const co2Data = buildChartData((log) => toNumberOrNull(log.co2Level));
  const avgTempData = buildChartData((log) => averageTemp(log));
  const tempAfterData = buildChartData((log) => toNumberOrNull(log.tempAfter));
  const moistureData = buildChartData((log) => toNumberOrNull(log.moisturePercent));

  function ChartCard({ title, data, color }) {
    return (
      <div className="chart-card">
        <h2>{title}</h2>

        {data.length < 2 ? (
          <p>Need at least 2 logs to draw this graph.</p>
        ) : (
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart
                data={data}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => {
                    if (!date || typeof date !== "string") return "";
                    const parts = date.split("-");
                    if (parts.length !== 3) return date;
                    return `${parts[1]}/${parts[2]}`;
                  }}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [value, "Value"]}
                  labelFormatter={(label) => formatDateForDisplay(label)}
                />
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
      <h1 className="page-title">Analytics</h1>

      <div
        className="form-card"
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          alignItems: "end"
        }}
      >
        <div className="form-group" style={{ minWidth: "220px", marginBottom: 0 }}>
          <label>Filter by Job</label>
          <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
            {jobOptions.map((job) => (
              <option key={job} value={job}>
                {job === "ALL" ? "All Jobs" : job}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ minWidth: "220px", marginBottom: 0 }}>
          <label>Filter by Windrow</label>
          <select
            value={selectedWindrow}
            onChange={(e) => setSelectedWindrow(e.target.value)}
          >
            {windrowOptions.map((windrow) => (
              <option key={windrow} value={windrow}>
                {windrow === "ALL" ? "All Windrows" : `Windrow ${windrow}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ChartCard title="CO2" data={co2Data} color="#e74c3c" />
      <ChartCard title="Average Temp" data={avgTempData} color="#3498db" />
      <ChartCard title="Temp After" data={tempAfterData} color="#8e44ad" />
      <ChartCard title="Moisture" data={moistureData} color="#2e8b57" />
    </div>
  );
}

export default AnalyticsPage;
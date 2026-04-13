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
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    jobName: "Job 1",
    logDate: "",
    logTime: "",
    operatorName: "",
    windrowRowNumber: "",
    probe1TempBefore: "",
    probe2TempBefore: "",
    probe3TempBefore: "",
    tempAfter: "",
    moisturePercent: "",
    waterAppliedGallons: "",
    co2Level: "",
    turnStatus: "",
    rainInches: "",
    notes: ""
  });

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
      setLogs(data);
    } catch (error) {
      console.error(error);
    }
  }

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

  // ✅ FIXED average temp
  function averageTemp(log) {
    const temps = [
      log.probe1TempBefore,
      log.probe2TempBefore,
      log.probe3TempBefore
    ].filter((value) => value !== null && value !== undefined);

    if (temps.length === 0) return null;

    const sum = temps.reduce((total, val) => total + val, 0);
    return sum / temps.length;
  }

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      const aDateTime = new Date(`${a.logDate}T${a.logTime || "00:00"}`);
      const bDateTime = new Date(`${b.logDate}T${b.logTime || "00:00"}`);
      return aDateTime - bDateTime;
    });
  }, [logs]);

  // ✅ CLEAN DATE ONLY (no time clutter)
  const moistureChartData = sortedLogs
    .filter((log) => log.moisturePercent != null)
    .map((log) => ({
      label: formatDateForDisplay(log.logDate),
      value: log.moisturePercent
    }));

  const co2ChartData = sortedLogs
    .filter((log) => log.co2Level != null)
    .map((log) => ({
      label: formatDateForDisplay(log.logDate),
      value: log.co2Level
    }));

  const avgTempChartData = sortedLogs
    .map((log) => ({
      label: formatDateForDisplay(log.logDate),
      value: averageTemp(log)
    }))
    .filter((item) => item.value !== null);

  const tempAfterChartData = sortedLogs
    .filter((log) => log.tempAfter != null)
    .map((log) => ({
      label: formatDateForDisplay(log.logDate),
      value: log.tempAfter
    }));

  function startEdit(log) {
    setEditingId(log.id);
    setEditForm({
      jobName: log.jobName ?? "Job 1",
      logDate: log.logDate ?? "",
      logTime: log.logTime ?? "",
      operatorName: log.operatorName ?? "",
      windrowRowNumber: log.windrow?.rowNumber ?? "",
      probe1TempBefore: log.probe1TempBefore ?? "",
      probe2TempBefore: log.probe2TempBefore ?? "",
      probe3TempBefore: log.probe3TempBefore ?? "",
      tempAfter: log.tempAfter ?? "",
      moisturePercent: log.moisturePercent ?? "",
      waterAppliedGallons: log.waterAppliedGallons ?? "",
      co2Level: log.co2Level ?? "",
      turnStatus: log.turnStatus ?? "",
      rainInches: log.rainInches ?? "",
      notes: log.notes ?? ""
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function handleEditChange(event) {
    const { name, value } = event.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  function toNumberOrNull(value) {
    return value === "" ? null : Number(value);
  }

  async function saveEdit(id) {
    const payload = {
      jobName: editForm.jobName,
      logDate: editForm.logDate,
      logTime: editForm.logTime,
      operatorName: editForm.operatorName,
      windrow: {
        rowNumber: editForm.windrowRowNumber
      },
      probe1TempBefore: toNumberOrNull(editForm.probe1TempBefore),
      probe2TempBefore: toNumberOrNull(editForm.probe2TempBefore),
      probe3TempBefore: toNumberOrNull(editForm.probe3TempBefore),
      tempAfter: toNumberOrNull(editForm.tempAfter),
      moisturePercent: toNumberOrNull(editForm.moisturePercent),
      waterAppliedGallons: toNumberOrNull(editForm.waterAppliedGallons),
      co2Level: toNumberOrNull(editForm.co2Level),
      turnStatus: editForm.turnStatus,
      rainInches: toNumberOrNull(editForm.rainInches),
      notes: editForm.notes
    };

    try {
      const response = await fetch(`${apiBase}/api/logs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to update log");
      }

      setEditingId(null);
      fetchLogs();
    } catch (error) {
      console.error(error);
      alert("Failed to update log");
    }
  }

  async function deleteLog(id) {
    const confirmed = window.confirm("Delete this log?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${apiBase}/api/logs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: auth
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete log");
      }

      fetchLogs();
    } catch (error) {
      console.error(error);
      alert("Failed to delete log");
    }
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
              <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="label"
                  interval="preserveStartEnd"
                  tick={{ fontSize: 12 }}
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
      <ChartCard title="Moisture Over Time" data={moistureChartData} color="#2ecc71" />
      <ChartCard title="CO2 Over Time" data={co2ChartData} color="#e74c3c" />
      <ChartCard title="Average Temp Over Time" data={avgTempChartData} color="#3498db" />
      <ChartCard title="Temp After Over Time" data={tempAfterChartData} color="#9b59b6" />

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
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => {
                const isEditing = editingId === log.id;

                return (
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
                    <td>
                      <button onClick={() => startEdit(log)}>Edit</button>
                      <button onClick={() => deleteLog(log.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LogsPage;
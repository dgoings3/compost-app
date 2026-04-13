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

  function formatChartLabel(log) {
    return `${formatDateForDisplay(log.logDate)} ${formatTime(log.logTime)}`;
  }

  function averageTemp(log) {
    const temps = [
      Number(log.probe1TempBefore),
      Number(log.probe2TempBefore),
      Number(log.probe3TempBefore)
    ].filter((value) => !Number.isNaN(value));

    if (temps.length === 0) return null;

    return temps.reduce((sum, value) => sum + value, 0) / temps.length;
  }

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      const aDateTime = new Date(`${a.logDate}T${a.logTime || "00:00"}`);
      const bDateTime = new Date(`${b.logDate}T${b.logTime || "00:00"}`);
      return aDateTime - bDateTime;
    });
  }, [logs]);

  const moistureChartData = sortedLogs
    .filter((log) => log.moisturePercent !== null && log.moisturePercent !== undefined)
    .map((log) => ({
      label: formatChartLabel(log),
      value: log.moisturePercent
    }));

  const co2ChartData = sortedLogs
    .filter((log) => log.co2Level !== null && log.co2Level !== undefined)
    .map((log) => ({
      label: formatChartLabel(log),
      value: log.co2Level
    }));

  const avgTempChartData = sortedLogs
    .map((log) => ({
      label: formatChartLabel(log),
      value: averageTemp(log)
    }))
    .filter((item) => item.value !== null);

  const tempAfterChartData = sortedLogs
    .filter((log) => log.tempAfter !== null && log.tempAfter !== undefined)
    .map((log) => ({
      label: formatChartLabel(log),
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

  function ChartCard({ title, data }) {
    return (
      <div className="chart-card">
        <h2>{title}</h2>
        {data.length < 2 ? (
          <p>Need at least 2 logs to draw this graph.</p>
        ) : (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" angle={-30} textAnchor="end" height={80} interval={0} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-shell">
      <ChartCard title="Moisture Over Time" data={moistureChartData} />
      <ChartCard title="CO2 Over Time" data={co2ChartData} />
      <ChartCard title="Average Temp Over Time" data={avgTempChartData} />
      <ChartCard title="Temp After Over Time" data={tempAfterChartData} />

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

                if (isEditing) {
                  return (
                    <tr key={log.id}>
                      <td>
                        <select name="jobName" value={editForm.jobName} onChange={handleEditChange}>
                          <option value="Job 1">Job 1</option>
                          <option value="Job 2">Job 2</option>
                          <option value="Job 3">Job 3</option>
                        </select>
                      </td>
                      <td>
                        <input type="date" name="logDate" value={editForm.logDate} onChange={handleEditChange} />
                      </td>
                      <td>
                        <input type="time" name="logTime" value={editForm.logTime} onChange={handleEditChange} />
                      </td>
                      <td>
                        <input name="operatorName" value={editForm.operatorName} onChange={handleEditChange} />
                      </td>
                      <td>
                        <input name="windrowRowNumber" value={editForm.windrowRowNumber} onChange={handleEditChange} />
                      </td>
                      <td>
                        <input name="probe1TempBefore" value={editForm.probe1TempBefore} onChange={handleEditChange} />
                      </td>
                      <td>
                        <input name="probe2TempBefore" value={editForm.probe2TempBefore} onChange={handleEditChange} />
                      </td>
                      <td>
                        <input name="probe3TempBefore" value={editForm.probe3TempBefore} onChange={handleEditChange} />
                      </td>
                      <td>{averageTemp(editForm)?.toFixed?.(2) ?? ""}</td>
                      <td>
                        <input name="tempAfter" value={editForm.tempAfter} onChange={handleEditChange} />
                      </td>
                      <td>
                        <input name="moisturePercent" value={editForm.moisturePercent} onChange={handleEditChange} />
                      </td>
                      <td>
                        <input name="co2Level" value={editForm.co2Level} onChange={handleEditChange} />
                      </td>
                      <td>
                        <input
                          name="waterAppliedGallons"
                          value={editForm.waterAppliedGallons}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td>
                        <select name="turnStatus" value={editForm.turnStatus} onChange={handleEditChange}>
                          <option value="">Select Status</option>
                          <option value="TURNED">Turned</option>
                          <option value="NOT TURNED">Not Turned</option>
                        </select>
                      </td>
                      <td>
                        <input name="rainInches" value={editForm.rainInches} onChange={handleEditChange} />
                      </td>
                      <td>
                        <input name="notes" value={editForm.notes} onChange={handleEditChange} />
                      </td>
                      <td>
                        <button onClick={() => saveEdit(log.id)}>Save</button>
                        <button onClick={cancelEdit}>Cancel</button>
                      </td>
                    </tr>
                  );
                }

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
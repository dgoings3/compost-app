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
  const [selectedJob, setSelectedJob] = useState("ALL");
  const [selectedWindrow, setSelectedWindrow] = useState("ALL");

  const [editForm, setEditForm] = useState({
    jobName: "Job 1",
    logDate: "",
    logTime: "",
    operatorName: "",
    windrowRowNumber: "1",
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

  function formatTimeForDisplay(timeString) {
    if (!timeString) return "";

    const parts = timeString.split(":");
    if (parts.length < 2) return timeString;

    let hours = Number(parts[0]);
    const minutes = parts[1];
    const suffix = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `${hours}:${minutes} ${suffix}`;
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
      const matchesJob =
        selectedJob === "ALL" || log.jobName === selectedJob;

      const matchesWindrow =
        selectedWindrow === "ALL" ||
        String(log.windrow?.rowNumber ?? "") === selectedWindrow;

      return matchesJob && matchesWindrow;
    });
  }, [logs, selectedJob, selectedWindrow]);

  const newestFirstLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => {
      const aDate = new Date(`${a.logDate || ""}T${a.logTime || "00:00"}`);
      const bDate = new Date(`${b.logDate || ""}T${b.logTime || "00:00"}`);
      return bDate - aDate;
    });
  }, [filteredLogs]);

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
  const moistureData = buildChartData((log) =>
    toNumberOrNull(log.moisturePercent)
  );

  function startEdit(log) {
    setEditingId(log.id);
    setEditForm({
      jobName: log.jobName ?? "Job 1",
      logDate: log.logDate ?? "",
      logTime: log.logTime ?? "",
      operatorName: log.operatorName ?? "",
      windrowRowNumber: log.windrow?.rowNumber?.toString() ?? "1",
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
      alert("Failed to update log.");
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
      alert("Failed to delete log.");
    }
  }

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
      <h1 className="page-title">Saved Logs</h1>

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "24px"
        }}
      >
        <div className="form-group" style={{ minWidth: "220px", marginBottom: 0 }}>
          <label>Filter by Job</label>
          <select
            value={selectedJob}
            onChange={(event) => setSelectedJob(event.target.value)}
          >
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
            onChange={(event) => setSelectedWindrow(event.target.value)}
          >
            {windrowOptions.map((windrow) => (
              <option key={windrow} value={windrow}>
                {windrow === "ALL" ? "All Windrows" : `Windrow ${windrow}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {newestFirstLogs.length === 0 ? (
        <div className="logs-card">
          <p>No saved logs found for the selected filters.</p>
        </div>
      ) : (
        newestFirstLogs.map((log) => {
          const isEditing = editingId === log.id;

          return (
            <div
              key={log.id}
              className={isEditing ? "edit-card" : "logs-card"}
            >
              {!isEditing ? (
                <>
                  <div className="card-header">
                    <div>
                      <h2 style={{ marginBottom: "6px" }}>
                        {log.jobName || "Log Entry"}
                      </h2>
                      <p style={{ margin: 0 }}>
                        <strong>Date:</strong> {formatDateForDisplay(log.logDate)}
                        <span style={{ marginLeft: "16px" }}>
                          <strong>Time:</strong> {formatTimeForDisplay(log.logTime)}
                        </span>
                      </p>
                    </div>

                    <div className="action-buttons">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => startEdit(log)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => deleteLog(log.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "12px",
                      marginTop: "18px"
                    }}
                  >
                    <div className="compact-stat">
                      <strong>Operator:</strong>
                      <br />
                      {log.operatorName ?? ""}
                    </div>

                    <div className="compact-stat">
                      <strong>Windrow:</strong>
                      <br />
                      {log.windrow?.rowNumber ?? ""}
                    </div>

                    <div className="compact-stat">
                      <strong>P1:</strong>
                      <br />
                      {log.probe1TempBefore ?? ""}
                    </div>

                    <div className="compact-stat">
                      <strong>P2:</strong>
                      <br />
                      {log.probe2TempBefore ?? ""}
                    </div>

                    <div className="compact-stat">
                      <strong>P3:</strong>
                      <br />
                      {log.probe3TempBefore ?? ""}
                    </div>

                    <div className="compact-stat">
                      <strong>Avg Temp:</strong>
                      <br />
                      {averageTemp(log)?.toFixed(2) ?? ""}
                    </div>

                    <div className="compact-stat">
                      <strong>After:</strong>
                      <br />
                      {log.tempAfter ?? ""}
                    </div>

                    <div className="compact-stat">
                      <strong>Moisture:</strong>
                      <br />
                      {log.moisturePercent ?? ""}
                    </div>

                    <div className="compact-stat">
                      <strong>Water:</strong>
                      <br />
                      {log.waterAppliedGallons ?? ""}
                    </div>

                    <div className="compact-stat">
                      <strong>CO2:</strong>
                      <br />
                      {log.co2Level ?? ""}
                    </div>

                    <div className="compact-stat">
                      <strong>Turn:</strong>
                      <br />
                      {log.turnStatus ?? ""}
                    </div>

                    <div className="compact-stat">
                      <strong>Rain:</strong>
                      <br />
                      {log.rainInches ?? ""}
                    </div>
                  </div>

                  {log.notes && (
                    <div style={{ marginTop: "16px" }}>
                      <strong>Notes:</strong>
                      <p style={{ marginTop: "6px", marginBottom: 0 }}>{log.notes}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="card-header">
                    <h2>Edit Log</h2>

                    <div className="action-buttons">
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => saveEdit(log.id)}
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Job</label>
                      <select
                        name="jobName"
                        value={editForm.jobName}
                        onChange={handleEditChange}
                      >
                        <option value="Job 1">Job 1</option>
                        <option value="Job 2">Job 2</option>
                        <option value="Job 3">Job 3</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        name="logDate"
                        value={editForm.logDate}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Time</label>
                      <input
                        type="time"
                        name="logTime"
                        value={editForm.logTime}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Operator Name</label>
                      <input
                        type="text"
                        name="operatorName"
                        value={editForm.operatorName}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Windrow ID</label>
                      <input
                        type="text"
                        name="windrowRowNumber"
                        value={editForm.windrowRowNumber}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Probe 1 Temp</label>
                      <input
                        type="number"
                        step="any"
                        name="probe1TempBefore"
                        value={editForm.probe1TempBefore}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Probe 2 Temp</label>
                      <input
                        type="number"
                        step="any"
                        name="probe2TempBefore"
                        value={editForm.probe2TempBefore}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Probe 3 Temp</label>
                      <input
                        type="number"
                        step="any"
                        name="probe3TempBefore"
                        value={editForm.probe3TempBefore}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Temp After</label>
                      <input
                        type="number"
                        step="any"
                        name="tempAfter"
                        value={editForm.tempAfter}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Moisture %</label>
                      <input
                        type="number"
                        step="any"
                        name="moisturePercent"
                        value={editForm.moisturePercent}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Water Applied Gallons</label>
                      <input
                        type="number"
                        step="any"
                        name="waterAppliedGallons"
                        value={editForm.waterAppliedGallons}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>CO2</label>
                      <input
                        type="number"
                        step="any"
                        name="co2Level"
                        value={editForm.co2Level}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Turn Status</label>
                      <select
                        name="turnStatus"
                        value={editForm.turnStatus}
                        onChange={handleEditChange}
                      >
                        <option value="">Select Status</option>
                        <option value="TURNED">Turned</option>
                        <option value="NOT TURNED">Not Turned</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Rain Inches</label>
                      <input
                        type="number"
                        step="any"
                        name="rainInches"
                        value={editForm.rainInches}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Additional Notes</label>
                      <textarea
                        name="notes"
                        rows="4"
                        value={editForm.notes}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })
      )}

      <ChartCard title="CO2" data={co2Data} color="#e74c3c" />
      <ChartCard title="Average Temp" data={avgTempData} color="#3498db" />
      <ChartCard title="Temp After" data={tempAfterData} color="#8e44ad" />
      <ChartCard title="Moisture" data={moistureData} color="#2e8b57" />
    </div>
  );
}

export default LogsPage;
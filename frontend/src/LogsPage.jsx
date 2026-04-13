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
      setLogs(data);
    } catch (error) {
      console.error(error);
    }
  }

  function toNumberOrNull(value) {
    return value === "" ? null : Number(value);
  }

  function averageTemp(log) {
    const temps = [
      log.probe1TempBefore,
      log.probe2TempBefore,
      log.probe3TempBefore
    ]
      .map((value) => (value == null ? null : Number(value)))
      .filter((value) => value != null && !isNaN(value));

    if (temps.length === 0) return null;

    const sum = temps.reduce((total, value) => total + value, 0);
    return sum / temps.length;
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

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      const aDate = new Date(`${a.logDate || ""}T${a.logTime || "00:00"}`);
      const bDate = new Date(`${b.logDate || ""}T${b.logTime || "00:00"}`);
      return aDate - bDate;
    });
  }, [logs]);

  const buildChartData = (valueGetter) =>
    sortedLogs
      .map((log) => ({
        date: log.logDate || "",
        value: valueGetter(log)
      }))
      .filter((item) => item.value != null);

  const co2Data = buildChartData((log) => log.co2Level);
  const avgTempData = buildChartData((log) => averageTemp(log));
  const tempAfterData = buildChartData((log) => log.tempAfter);
  const moistureData = buildChartData((log) => log.moisturePercent);

  function startEdit(log) {
    setEditingId(log.id);
    setEditForm({
      jobName: log.jobName ?? "Job 1",
      logDate: log.logDate ?? "",
      logTime: log.logTime ?? "",
      operatorName: log.operatorName ?? "",
      windrowRowNumber: log.windrow?.rowNumber ?? "1",
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
        rowNumber: editForm.windrowRowNumber || "1"
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
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
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
      <ChartCard title="CO2" data={co2Data} color="#e74c3c" />
      <ChartCard title="Average Temp" data={avgTempData} color="#3498db" />
      <ChartCard title="Temp After" data={tempAfterData} color="#8e44ad" />
      <ChartCard title="Moisture" data={moistureData} color="#2e8b57" />

      <div className="logs-card-list">
        {logs
          .slice()
          .sort((a, b) => {
            const aDate = new Date(`${a.logDate || ""}T${a.logTime || "00:00"}`);
            const bDate = new Date(`${b.logDate || ""}T${b.logTime || "00:00"}`);
            return bDate - aDate;
          })
          .map((log) => {
            const isEditing = editingId === log.id;

            return (
              <div key={log.id} className="table-card" style={{ marginBottom: "20px" }}>
                {!isEditing ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginBottom: "16px"
                      }}
                    >
                      <div>
                        <h2 style={{ marginBottom: "6px" }}>{log.jobName || "Log Entry"}</h2>
                        <p style={{ margin: 0 }}>
                          <strong>Date:</strong> {formatDateForDisplay(log.logDate)}{" "}
                          <strong style={{ marginLeft: "12px" }}>Time:</strong> {formatTime(log.logTime)}
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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

                    <div className="form-grid">
                      <div className="form-group">
                        <label>Operator Name</label>
                        <input value={log.operatorName ?? ""} readOnly />
                      </div>

                      <div className="form-group">
                        <label>Windrow ID</label>
                        <input value={log.windrow?.rowNumber ?? ""} readOnly />
                      </div>

                      <div className="form-group">
                        <label>Probe 1 Temp</label>
                        <input value={log.probe1TempBefore ?? ""} readOnly />
                      </div>

                      <div className="form-group">
                        <label>Probe 2 Temp</label>
                        <input value={log.probe2TempBefore ?? ""} readOnly />
                      </div>

                      <div className="form-group">
                        <label>Probe 3 Temp</label>
                        <input value={log.probe3TempBefore ?? ""} readOnly />
                      </div>

                      <div className="form-group">
                        <label>Average Temp</label>
                        <input value={averageTemp(log)?.toFixed(2) ?? ""} readOnly />
                      </div>

                      <div className="form-group">
                        <label>Temp After</label>
                        <input value={log.tempAfter ?? ""} readOnly />
                      </div>

                      <div className="form-group">
                        <label>Moisture %</label>
                        <input value={log.moisturePercent ?? ""} readOnly />
                      </div>

                      <div className="form-group">
                        <label>Water Applied Gallons</label>
                        <input value={log.waterAppliedGallons ?? ""} readOnly />
                      </div>

                      <div className="form-group">
                        <label>CO2</label>
                        <input value={log.co2Level ?? ""} readOnly />
                      </div>

                      <div className="form-group">
                        <label>Turn Status</label>
                        <input value={log.turnStatus ?? ""} readOnly />
                      </div>

                      <div className="form-group">
                        <label>Rain Inches</label>
                        <input value={log.rainInches ?? ""} readOnly />
                      </div>

                      <div className="form-group full-width">
                        <label>Additional Notes</label>
                        <textarea value={log.notes ?? ""} readOnly rows="4" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginBottom: "16px"
                      }}
                    >
                      <h2 style={{ marginBottom: 0 }}>Edit Log</h2>

                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
                        <select name="jobName" value={editForm.jobName} onChange={handleEditChange}>
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
          })}
      </div>
    </div>
  );
}

export default LogsPage;
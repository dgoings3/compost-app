import { useEffect, useMemo, useState } from "react";
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
      const matchesJob = selectedJob === "ALL" || log.jobName === selectedJob;
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

  return (
    <div className="page-shell">
      <h1 className="page-title">Saved Logs</h1>

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

      {newestFirstLogs.length === 0 ? (
        <div className="form-card">
          <p>No logs found.</p>
        </div>
      ) : (
        newestFirstLogs.map((log) => {
          const isEditing = editingId === log.id;

          return (
            <div key={log.id} className="form-card" style={{ marginBottom: "20px" }}>
              {!isEditing ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                      flexWrap: "wrap",
                      marginBottom: "16px"
                    }}
                  >
                    <div>
                      <h2 style={{ marginBottom: "8px" }}>{log.jobName || "Job"}</h2>
                      <div style={{ fontWeight: 600 }}>
                        Date: {formatDateForDisplay(log.logDate)}{" "}
                        <span style={{ marginLeft: "16px" }}>
                          Time: {formatTimeForDisplay(log.logTime)}
                        </span>
                      </div>
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

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "12px"
                    }}
                  >
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Operator</label>
                      <input value={log.operatorName ?? ""} readOnly />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Windrow</label>
                      <input value={log.windrow?.rowNumber ?? ""} readOnly />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>P1</label>
                      <input value={log.probe1TempBefore ?? ""} readOnly />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>P2</label>
                      <input value={log.probe2TempBefore ?? ""} readOnly />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>P3</label>
                      <input value={log.probe3TempBefore ?? ""} readOnly />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Avg Temp</label>
                      <input value={averageTemp(log)?.toFixed(2) ?? ""} readOnly />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>After</label>
                      <input value={log.tempAfter ?? ""} readOnly />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Moisture</label>
                      <input value={log.moisturePercent ?? ""} readOnly />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Water</label>
                      <input value={log.waterAppliedGallons ?? ""} readOnly />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>CO2</label>
                      <input value={log.co2Level ?? ""} readOnly />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Turn</label>
                      <input value={log.turnStatus ?? ""} readOnly />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Rain</label>
                      <input value={log.rainInches ?? ""} readOnly />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: "16px", marginBottom: 0 }}>
                    <label>Notes</label>
                    <textarea value={log.notes ?? ""} readOnly rows="3" />
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
        })
      )}
    </div>
  );
}

export default LogsPage;
import { useEffect, useMemo, useState } from "react";
import "./App.css";

function SimpleLineChart({ title, data, dataKey }) {
  const chartData = data
    .filter((item) => item[dataKey] !== null && item[dataKey] !== undefined && item[dataKey] !== "")
    .map((item) => ({
      label: `${formatDateForDisplay(item.logDate)} ${formatTime(item.logTime)}`,
      value: Number(item[dataKey])
    }));

  if (chartData.length < 2) {
    return (
      <div className="edit-card" style={{ marginBottom: "20px" }}>
        <h3>{title}</h3>
        <p>Need at least 2 logs to draw this graph.</p>
      </div>
    );
  }

  const width = 700;
  const height = 220;
  const padding = 30;

  const values = chartData.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = chartData.map((item, index) => {
    const x = padding + (index * (width - padding * 2)) / (chartData.length - 1);
    const y = height - padding - ((item.value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  return (
    <div className="edit-card" style={{ marginBottom: "20px" }}>
      <h3>{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "220px" }}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#999" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#999" />
        <polyline
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          points={points.join(" ")}
        />
        {chartData.map((item, index) => {
          const x = padding + (index * (width - padding * 2)) / (chartData.length - 1);
          const y = height - padding - ((item.value - min) / range) * (height - padding * 2);

          return <circle key={index} cx={x} cy={y} r="4" fill="#2563eb" />;
        })}
      </svg>
    </div>
  );
}

function formatDateForBackend(dateString) {
  const parts = dateString.split("/");

  if (parts.length !== 3) {
    return dateString;
  }

  let month = parts[0].trim();
  let day = parts[1].trim();
  let year = parts[2].trim();

  if (year.length === 2) {
    year = "20" + year;
  }

  month = month.padStart(2, "0");
  day = day.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateForInput(dateString) {
  if (!dateString) return "";

  const parts = dateString.split("-");

  if (parts.length !== 3) {
    return dateString;
  }

  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

function formatDateForDisplay(dateString) {
  if (!dateString) return "";

  const parts = dateString.split("-");

  if (parts.length !== 3) {
    return dateString;
  }

  return `${parts[1]}/${parts[2]}/${parts[0]}`;
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

function autoFormatDate(value) {
  const numbersOnly = value.replace(/\D/g, "").slice(0, 8);

  if (numbersOnly.length <= 2) return numbersOnly;
  if (numbersOnly.length <= 4) return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2)}`;
  return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2, 4)}/${numbersOnly.slice(4)}`;
}

function LogsPage({ auth, apiBase }) {
  const emptyForm = {
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
  };

  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [jobFilter, setJobFilter] = useState("");
  const [windrowFilter, setWindrowFilter] = useState("");

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${apiBase}/api/logs`, {
        headers: {
          Authorization: `Basic ${auth}`
        }
      });

      if (!res.ok) {
        alert("Failed to load logs");
        return;
      }

      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
      alert("Failed to load logs");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "logDate" ? autoFormatDate(value) : value
    });
  };

  const handleDelete = async (id) => {
    const res = await fetch(`${apiBase}/api/logs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${auth}`
      }
    });

    if (!res.ok) {
      alert("Failed to delete log");
      return;
    }

    if (editingId === id) {
      setForm(emptyForm);
      setEditingId(null);
    }

    fetchLogs();
  };

  const handleEdit = (log) => {
    setForm({
      jobName: log.jobName ?? "Job 1",
      logDate: formatDateForInput(log.logDate),
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

    setEditingId(log.id);
  };

  const handleCancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const payload = {
      jobName: form.jobName,
      logDate: formatDateForBackend(form.logDate),
      logTime: form.logTime,
      operatorName: form.operatorName,
      probe1TempBefore: Number(form.probe1TempBefore),
      probe2TempBefore: Number(form.probe2TempBefore),
      probe3TempBefore: Number(form.probe3TempBefore),
      tempAfter: Number(form.tempAfter),
      moisturePercent: Number(form.moisturePercent),
      waterAppliedGallons: form.waterAppliedGallons === "" ? null : Number(form.waterAppliedGallons),
      co2Level: form.co2Level === "" ? null : Number(form.co2Level),
      turnStatus: form.turnStatus,
      rainInches: form.rainInches === "" ? null : Number(form.rainInches),
      notes: form.notes,
      windrow: {
        rowNumber: form.windrowRowNumber
      }
    };

    try {
      const res = await fetch(`${apiBase}/api/logs/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        alert("Failed to update log");
        return;
      }

      alert("Log updated!");
      setForm(emptyForm);
      setEditingId(null);
      fetchLogs();
    } catch (error) {
      console.error("Error updating log:", error);
      alert("Failed to update log");
    }
  };

  const filteredAndSortedLogs = useMemo(() => {
    return [...logs]
      .filter((log) => {
        if (jobFilter && log.jobName !== jobFilter) {
          return false;
        }

        if (windrowFilter && String(log.windrow?.rowNumber ?? "") !== windrowFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aDateTime = new Date(`${a.logDate}T${a.logTime || "00:00"}`);
        const bDateTime = new Date(`${b.logDate}T${b.logTime || "00:00"}`);
        return aDateTime - bDateTime;
      });
  }, [logs, jobFilter, windrowFilter]);

  return (
    <div className="page-container">
      <div className="logs-card">
        <h1 className="page-title">Saved Logs</h1>

        <div className="form-grid" style={{ marginBottom: "20px" }}>
          <div className="form-group">
            <label>Filter by Job</label>
            <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
              <option value="">All Jobs</option>
              <option value="Job 1">Job 1</option>
              <option value="Job 2">Job 2</option>
              <option value="Job 3">Job 3</option>
            </select>
          </div>

          <div className="form-group">
            <label>Filter by Windrow ID</label>
            <input
              value={windrowFilter}
              onChange={(e) => setWindrowFilter(e.target.value)}
              placeholder="Windrow ID"
            />
          </div>
        </div>

        <SimpleLineChart title="CO2 Over Time" data={filteredAndSortedLogs} dataKey="co2Level" />
        <SimpleLineChart title="Average Temp Over Time" data={filteredAndSortedLogs} dataKey="avgTempBefore" />
        <SimpleLineChart title="Temp After Over Time" data={filteredAndSortedLogs} dataKey="tempAfter" />
        <SimpleLineChart title="Moisture Over Time" data={filteredAndSortedLogs} dataKey="moisturePercent" />

        {editingId !== null && (
          <div className="edit-card">
            <h2>Edit Log</h2>

            <form onSubmit={handleUpdate} className="log-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Job</label>
                  <select name="jobName" value={form.jobName} onChange={handleChange} required>
                    <option value="Job 1">Job 1</option>
                    <option value="Job 2">Job 2</option>
                    <option value="Job 3">Job 3</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    name="logDate"
                    required
                    placeholder="MM/DD/YYYY"
                    value={form.logDate}
                    onChange={handleChange}
                    maxLength="10"
                  />
                </div>

                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    name="logTime"
                    required
                    value={form.logTime}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Operator Name</label>
                  <input
                    name="operatorName"
                    required
                    placeholder="Operator Name"
                    value={form.operatorName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Windrow ID</label>
                  <input
                    name="windrowRowNumber"
                    required
                    placeholder="Windrow ID"
                    value={form.windrowRowNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Probe 1 Temp</label>
                  <input
                    name="probe1TempBefore"
                    required
                    placeholder="Probe 1 Temp"
                    value={form.probe1TempBefore}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Probe 2 Temp</label>
                  <input
                    name="probe2TempBefore"
                    required
                    placeholder="Probe 2 Temp"
                    value={form.probe2TempBefore}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Probe 3 Temp</label>
                  <input
                    name="probe3TempBefore"
                    required
                    placeholder="Probe 3 Temp"
                    value={form.probe3TempBefore}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Temp After</label>
                  <input
                    name="tempAfter"
                    required
                    placeholder="Temp After"
                    value={form.tempAfter}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Moisture %</label>
                  <input
                    name="moisturePercent"
                    required
                    placeholder="Moisture %"
                    value={form.moisturePercent}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>CO2</label>
                  <input
                    name="co2Level"
                    placeholder="CO2"
                    value={form.co2Level}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Water Applied Gallons</label>
                  <input
                    name="waterAppliedGallons"
                    placeholder="Water Gallons"
                    value={form.waterAppliedGallons}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Turn Status</label>
                  <select
                    name="turnStatus"
                    required
                    value={form.turnStatus}
                    onChange={handleChange}
                  >
                    <option value="">Select Turn Status</option>
                    <option value="TURNED">Turned</option>
                    <option value="NOT TURNED">Not Turned</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Rain Inches</label>
                  <input
                    name="rainInches"
                    placeholder="Rain Inches"
                    value={form.rainInches}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  name="notes"
                  placeholder="Additional Notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              <div className="button-row">
                <button type="submit" className="primary-button">
                  Update Log
                </button>
                <button type="button" className="secondary-button" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {filteredAndSortedLogs.length === 0 ? (
          <p>No logs found.</p>
        ) : (
          <div className="table-wrapper">
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
                {[...filteredAndSortedLogs].reverse().map((log) => (
                  <tr key={log.id}>
                    <td>{log.jobName}</td>
                    <td>{formatDateForDisplay(log.logDate)}</td>
                    <td>{formatTime(log.logTime)}</td>
                    <td>{log.operatorName}</td>
                    <td>{log.windrow?.rowNumber}</td>
                    <td>{log.probe1TempBefore}</td>
                    <td>{log.probe2TempBefore}</td>
                    <td>{log.probe3TempBefore}</td>
                    <td>{log.avgTempBefore}</td>
                    <td>{log.tempAfter}</td>
                    <td>{log.moisturePercent}</td>
                    <td>{log.co2Level}</td>
                    <td>{log.waterAppliedGallons}</td>
                    <td>{log.turnStatus}</td>
                    <td>{log.rainInches}</td>
                    <td className="notes-cell">{log.notes}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(log)}
                          className="primary-button small-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="danger-button small-button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default LogsPage;
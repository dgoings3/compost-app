import { useState, useEffect } from "react";
import "./App.css";

const API_BASE = "https://compost-app.onrender.com";

function LogsPage({ auth }) {
  const emptyForm = {
    logDate: "",
    logTime: "",
    operatorName: "",
    probe1TempBefore: "",
    probe2TempBefore: "",
    probe3TempBefore: "",
    tempAfter: "",
    moisturePercent: "",
    waterAppliedGallons: "",
    turnStatus: "",
    rainInches: "",
    notes: "",
    windrowId: ""
  };

  function formatTime(timeString) {
    if (!timeString) return "";

    const [hourStr, minute] = timeString.split(":");
    let hour = parseInt(hourStr);

    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minute} ${ampm}`;
  }

  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [windrowFilter, setWindrowFilter] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/logs`, {
        headers: {
          Authorization: `Basic ${auth}`
        }
      });

      if (!res.ok) {
        console.error("Failed to fetch logs");
        return;
      }

      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

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

    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    return `${month}/${day}/${year}`;
  }

  function formatDateForDisplay(dateString) {
    if (!dateString) return "";

    const parts = dateString.split("-");

    if (parts.length !== 3) {
      return dateString;
    }

    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    return `${month}/${day}/${year}`;
  }

  const handleDelete = async (id) => {
    const res = await fetch(`${API_BASE}/api/logs/${id}`, {
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
      logDate: formatDateForInput(log.logDate),
      logTime: log.logTime ?? "",
      operatorName: log.operatorName ?? "",
      probe1TempBefore: log.probe1TempBefore ?? "",
      probe2TempBefore: log.probe2TempBefore ?? "",
      probe3TempBefore: log.probe3TempBefore ?? "",
      tempAfter: log.tempAfter ?? "",
      moisturePercent: log.moisturePercent ?? "",
      waterAppliedGallons: log.waterAppliedGallons ?? "",
      turnStatus: log.turnStatus ?? "",
      rainInches: log.rainInches ?? "",
      notes: log.notes ?? "",
      windrowId: log.windrow?.rowNumber ?? ""
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
      logDate: formatDateForBackend(form.logDate),
      logTime: form.logTime,
      operatorName: form.operatorName,
      probe1TempBefore: Number(form.probe1TempBefore),
      probe2TempBefore: Number(form.probe2TempBefore),
      probe3TempBefore: Number(form.probe3TempBefore),
      tempAfter: Number(form.tempAfter),
      moisturePercent: Number(form.moisturePercent),
      waterAppliedGallons:
        form.waterAppliedGallons === "" ? null : Number(form.waterAppliedGallons),
      turnStatus: form.turnStatus,
      rainInches:
        form.rainInches === "" ? null : Number(form.rainInches),
      notes: form.notes,
      windrow: {
        rowNumber: form.windrowId
      }
    };

    try {
      const res = await fetch(`${API_BASE}/api/logs/${editingId}`, {
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

  const filteredAndSortedLogs = logs
    .filter((log) => {
      if (windrowFilter === "") {
        return true;
      }

      return String(log.windrow?.rowNumber ?? "") === windrowFilter;
    })
    .sort((a, b) => new Date(b.logDate) - new Date(a.logDate));

  return (
    <div className="page-container">
      <div className="logs-card">
        <h1 className="page-title">Saved Logs</h1>

        {editingId !== null && (
          <div className="edit-card">
            <h2>Edit Log</h2>

            <form onSubmit={handleUpdate} className="log-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    name="logDate"
                    required
                    placeholder="MM/DD/YYYY or MM/DD/YY"
                    value={form.logDate}
                    onChange={handleChange}
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
                    name="windrowId"
                    required
                    placeholder="Windrow ID"
                    value={form.windrowId}
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
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="secondary-button"
                >
                  Cancel Edit
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="filter-row">
          <label>Filter by Windrow ID:</label>
          <input
            type="text"
            placeholder="Enter windrow ID"
            value={windrowFilter}
            onChange={(e) => setWindrowFilter(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setWindrowFilter("")}
            className="secondary-button"
          >
            Clear Filter
          </button>
        </div>

        {filteredAndSortedLogs.length === 0 ? (
          <p>No logs found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Operator</th>
                  <th>Windrow</th>
                  <th>P1</th>
                  <th>P2</th>
                  <th>P3</th>
                  <th>After</th>
                  <th>Moisture</th>
                  <th>Water</th>
                  <th>Turn</th>
                  <th>Rain</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAndSortedLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDateForDisplay(log.logDate)}</td>
                    <td>{formatTime(log.logTime)}</td>
                    <td>{log.operatorName}</td>
                    <td>{log.windrow?.rowNumber}</td>
                    <td>{log.probe1TempBefore}</td>
                    <td>{log.probe2TempBefore}</td>
                    <td>{log.probe3TempBefore}</td>
                    <td>{log.tempAfter}</td>
                    <td>{log.moisturePercent}</td>
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
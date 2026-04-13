import { useState } from "react";
import "./App.css";

function LogForm({ auth, apiBase }) {
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

  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  function toNumberOrNull(value) {
    return value === "" ? null : Number(value);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const payload = {
      jobName: form.jobName,
      logDate: form.logDate,
      logTime: form.logTime,
      operatorName: form.operatorName,
      windrow: {
        rowNumber: form.windrowRowNumber
      },
      probe1TempBefore: toNumberOrNull(form.probe1TempBefore),
      probe2TempBefore: toNumberOrNull(form.probe2TempBefore),
      probe3TempBefore: toNumberOrNull(form.probe3TempBefore),
      tempAfter: toNumberOrNull(form.tempAfter),
      moisturePercent: toNumberOrNull(form.moisturePercent),
      waterAppliedGallons: toNumberOrNull(form.waterAppliedGallons),
      co2Level: toNumberOrNull(form.co2Level),
      turnStatus: form.turnStatus,
      rainInches: toNumberOrNull(form.rainInches),
      notes: form.notes
    };

    try {
      const response = await fetch(`${apiBase}/api/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to save log");
      }

      setForm(emptyForm);
      setMessage("Log saved successfully.");
    } catch (error) {
      setMessage("Failed to save log.");
    }
  }

  return (
    <div className="page-shell">
      <div className="form-card">
        <h1 className="page-title">Compost Log Entry</h1>

        <form onSubmit={handleSubmit} className="log-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Job</label>
              <select name="jobName" value={form.jobName} onChange={handleChange}>
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
                required
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
                type="text"
                name="operatorName"
                placeholder="Operator Name"
                value={form.operatorName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Windrow ID</label>
              <input
                type="text"
                name="windrowRowNumber"
                placeholder="Windrow ID"
                value={form.windrowRowNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Probe 1 Temp</label>
              <input
                type="number"
                step="any"
                name="probe1TempBefore"
                placeholder="Probe 1 Temp"
                value={form.probe1TempBefore}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Probe 2 Temp</label>
              <input
                type="number"
                step="any"
                name="probe2TempBefore"
                placeholder="Probe 2 Temp"
                value={form.probe2TempBefore}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Probe 3 Temp</label>
              <input
                type="number"
                step="any"
                name="probe3TempBefore"
                placeholder="Probe 3 Temp"
                value={form.probe3TempBefore}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Temp After</label>
              <input
                type="number"
                step="any"
                name="tempAfter"
                placeholder="Temp After"
                value={form.tempAfter}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Moisture %</label>
              <input
                type="number"
                step="any"
                name="moisturePercent"
                placeholder="Moisture %"
                value={form.moisturePercent}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Water Applied Gallons</label>
              <input
                type="number"
                step="any"
                name="waterAppliedGallons"
                placeholder="Water Applied Gallons"
                value={form.waterAppliedGallons}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>CO2</label>
              <input
                type="number"
                step="any"
                name="co2Level"
                placeholder="CO2"
                value={form.co2Level}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Turn Status</label>
              <select name="turnStatus" value={form.turnStatus} onChange={handleChange}>
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
                placeholder="Rain Inches"
                value={form.rainInches}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Additional Notes</label>
              <textarea
                name="notes"
                placeholder="Additional Notes"
                rows="4"
                value={form.notes}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="primary-button">
            Save Log
          </button>

          {message && <p className="status-message">{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default LogForm;
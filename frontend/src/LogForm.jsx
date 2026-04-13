import { useState } from "react";
import "./App.css";

function LogForm({ auth, apiBase }) {
  const emptyForm = {
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
        rowNumber: form.windrowRowNumber || "1"
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
              <label htmlFor="jobName">Job</label>
              <select
                id="jobName"
                name="jobName"
                value={form.jobName}
                onChange={handleChange}
              >
                <option value="Job 1">Job 1</option>
                <option value="Job 2">Job 2</option>
                <option value="Job 3">Job 3</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="logDate">Date</label>
              <input
                id="logDate"
                type="date"
                name="logDate"
                required
                value={form.logDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="logTime">Time</label>
              <input
                id="logTime"
                type="time"
                name="logTime"
                required
                value={form.logTime}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="operatorName">Operator Name</label>
              <input
                id="operatorName"
                type="text"
                name="operatorName"
                placeholder="Operator Name"
                value={form.operatorName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="windrowRowNumber">Windrow ID</label>
              <input
                id="windrowRowNumber"
                type="text"
                name="windrowRowNumber"
                placeholder="Windrow ID"
                value={form.windrowRowNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="probe1TempBefore">Probe 1 Temp</label>
              <input
                id="probe1TempBefore"
                type="number"
                step="any"
                name="probe1TempBefore"
                placeholder="Probe 1 Temp"
                value={form.probe1TempBefore}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="probe2TempBefore">Probe 2 Temp</label>
              <input
                id="probe2TempBefore"
                type="number"
                step="any"
                name="probe2TempBefore"
                placeholder="Probe 2 Temp"
                value={form.probe2TempBefore}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="probe3TempBefore">Probe 3 Temp</label>
              <input
                id="probe3TempBefore"
                type="number"
                step="any"
                name="probe3TempBefore"
                placeholder="Probe 3 Temp"
                value={form.probe3TempBefore}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tempAfter">Temp After</label>
              <input
                id="tempAfter"
                type="number"
                step="any"
                name="tempAfter"
                placeholder="Temp After"
                value={form.tempAfter}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="moisturePercent">Moisture %</label>
              <input
                id="moisturePercent"
                type="number"
                step="any"
                name="moisturePercent"
                placeholder="Moisture %"
                value={form.moisturePercent}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="waterAppliedGallons">Water Applied Gallons</label>
              <input
                id="waterAppliedGallons"
                type="number"
                step="any"
                name="waterAppliedGallons"
                placeholder="Water Applied Gallons"
                value={form.waterAppliedGallons}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="co2Level">CO2</label>
              <input
                id="co2Level"
                type="number"
                step="any"
                name="co2Level"
                placeholder="CO2"
                value={form.co2Level}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="turnStatus">Turn Status</label>
              <select
                id="turnStatus"
                name="turnStatus"
                value={form.turnStatus}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="TURNED">Turned</option>
                <option value="NOT TURNED">Not Turned</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="rainInches">Rain Inches</label>
              <input
                id="rainInches"
                type="number"
                step="any"
                name="rainInches"
                placeholder="Rain Inches"
                value={form.rainInches}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
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
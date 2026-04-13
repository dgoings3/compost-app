import { useState } from "react";
import "./App.css";

function LogForm({ auth, apiBase }) {
  const emptyForm = {
    jobName: "Job 1",
    logDate: "",
    logTime: "",
    operatorName: "",
    windrowRowNumber: "1", // ✅ default so backend doesn’t crash
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

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
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
      const res = await fetch(`${apiBase}/api/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error();

      setForm(emptyForm);
      setMessage("Log saved successfully.");
    } catch {
      setMessage("Failed to save log.");
    }
  }

  return (
    <div className="page-shell">
      <div className="form-card">
        <h1 className="page-title">Compost Log Entry</h1>

        <form onSubmit={handleSubmit} className="log-form">
          <input type="date" name="logDate" value={form.logDate} onChange={handleChange} required />
          <input type="time" name="logTime" value={form.logTime} onChange={handleChange} required />

          <input name="operatorName" placeholder="Operator" value={form.operatorName} onChange={handleChange} />

          <input
            name="windrowRowNumber"
            placeholder="Windrow ID"
            value={form.windrowRowNumber}
            onChange={handleChange}
            required
          />

          <input name="probe1TempBefore" placeholder="Probe 1" value={form.probe1TempBefore} onChange={handleChange} />
          <input name="probe2TempBefore" placeholder="Probe 2" value={form.probe2TempBefore} onChange={handleChange} />
          <input name="probe3TempBefore" placeholder="Probe 3" value={form.probe3TempBefore} onChange={handleChange} />

          <input name="tempAfter" placeholder="Temp After" value={form.tempAfter} onChange={handleChange} />
          <input name="moisturePercent" placeholder="Moisture %" value={form.moisturePercent} onChange={handleChange} />
          <input name="waterAppliedGallons" placeholder="Water" value={form.waterAppliedGallons} onChange={handleChange} />
          <input name="co2Level" placeholder="CO2" value={form.co2Level} onChange={handleChange} />

          <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />

          <button type="submit">Save Log</button>

          {message && <p>{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default LogForm;
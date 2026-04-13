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
    notes: "",
  };

  const [form, setForm] = useState(emptyForm);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      jobName: form.jobName,
      logDate: form.logDate,
      logTime: form.logTime,
      operatorName: form.operatorName,
      probe1TempBefore:
        form.probe1TempBefore === "" ? null : Number(form.probe1TempBefore),
      probe2TempBefore:
        form.probe2TempBefore === "" ? null : Number(form.probe2TempBefore),
      probe3TempBefore:
        form.probe3TempBefore === "" ? null : Number(form.probe3TempBefore),
      tempAfter: form.tempAfter === "" ? null : Number(form.tempAfter),
      moisturePercent:
        form.moisturePercent === "" ? null : Number(form.moisturePercent),
      waterAppliedGallons:
        form.waterAppliedGallons === "" ? null : Number(form.waterAppliedGallons),
      co2Level: form.co2Level === "" ? null : Number(form.co2Level),
      turnStatus: form.turnStatus,
      rainInches: form.rainInches === "" ? null : Number(form.rainInches),
      notes: form.notes,
      windrow: {
        rowNumber: form.windrowRowNumber,
      },
    };

    try {
      const response = await fetch(`${apiBase}/api/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save log");
      }

      alert("Log saved successfully");
      setForm(emptyForm);
    } catch (error) {
      console.error(error);
      alert("Failed to save log");
    }
  }

  return (
    <div className="page-shell">
      <div className="form-card">
        <h1 className="page-title">Compost Log Entry</h1>

        <form onSubmit={handleSubmit} className="form-grid">
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
                required
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
              <label>CO2 Level</label>
              <input
                type="number"
                step="any"
                name="co2Level"
                placeholder="CO2 Level"
                value={form.co2Level}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Turn Status</label>
              <select name="turnStatus" value={form.turnStatus} onChange={handleChange}>
                <option value="">Select Turn Status</option>
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

            <div className="form-group form-group-full">
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

          <button type="submit" className="save-btn">
            Save Log
          </button>
        </form>
      </div>
    </div>
  );
}

export default LogForm;
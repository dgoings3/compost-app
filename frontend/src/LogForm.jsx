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

  function autoFormatDate(value) {
    const numbersOnly = value.replace(/\D/g, "").slice(0, 8);

    if (numbersOnly.length <= 2) return numbersOnly;
    if (numbersOnly.length <= 4) return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2)}`;
    return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2, 4)}/${numbersOnly.slice(4)}`;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "logDate" ? autoFormatDate(value) : value
    }));
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

  const handleSubmit = async (e) => {
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
      const res = await fetch(`${apiBase}/api/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        alert("Failed to save log");
        return;
      }

      alert("Log saved!");
      setForm(emptyForm);
    } catch (error) {
      console.error("Error saving log:", error);
      alert("Failed to save log");
    }
  };

  return (
    <div className="page-container">
      <div className="form-card">
        <h1 className="page-title">Compost Log Entry</h1>

        <form onSubmit={handleSubmit} className="log-form">
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

          <button type="submit" className="primary-button">
            Save Log
          </button>
        </form>
      </div>
    </div>
  );
}

export default LogForm;
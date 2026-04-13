package com.compostapp.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "daily_logs")
public class DailyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String jobName;

    private LocalDate logDate;

    private LocalTime logTime;

    private String operatorName;

    @ManyToOne
    @JoinColumn(name = "windrow_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Windrow windrow;

    private Double probe1TempBefore;

    private Double probe2TempBefore;

    private Double probe3TempBefore;

    private Double tempAfter;

    private Double moisturePercent;

    private Double waterAppliedGallons;

    private Double co2Level;

    private String turnStatus;

    private Double rainInches;

    @Column(length = 2000)
    private String notes;

    public DailyLog() {
    }

    public Long getId() {
        return id;
    }

    public String getJobName() {
        return jobName;
    }

    public LocalDate getLogDate() {
        return logDate;
    }

    public LocalTime getLogTime() {
        return logTime;
    }

    public String getOperatorName() {
        return operatorName;
    }

    public Windrow getWindrow() {
        return windrow;
    }

    public Double getProbe1TempBefore() {
        return probe1TempBefore;
    }

    public Double getProbe2TempBefore() {
        return probe2TempBefore;
    }

    public Double getProbe3TempBefore() {
        return probe3TempBefore;
    }

    public Double getTempAfter() {
        return tempAfter;
    }

    public Double getMoisturePercent() {
        return moisturePercent;
    }

    public Double getWaterAppliedGallons() {
        return waterAppliedGallons;
    }

    public Double getCo2Level() {
        return co2Level;
    }

    public String getTurnStatus() {
        return turnStatus;
    }

    public Double getRainInches() {
        return rainInches;
    }

    public String getNotes() {
        return notes;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setJobName(String jobName) {
        this.jobName = jobName;
    }

    public void setLogDate(LocalDate logDate) {
        this.logDate = logDate;
    }

    public void setLogTime(LocalTime logTime) {
        this.logTime = logTime;
    }

    public void setOperatorName(String operatorName) {
        this.operatorName = operatorName;
    }

    public void setWindrow(Windrow windrow) {
        this.windrow = windrow;
    }

    public void setProbe1TempBefore(Double probe1TempBefore) {
        this.probe1TempBefore = probe1TempBefore;
    }

    public void setProbe2TempBefore(Double probe2TempBefore) {
        this.probe2TempBefore = probe2TempBefore;
    }

    public void setProbe3TempBefore(Double probe3TempBefore) {
        this.probe3TempBefore = probe3TempBefore;
    }

    public void setTempAfter(Double tempAfter) {
        this.tempAfter = tempAfter;
    }

    public void setMoisturePercent(Double moisturePercent) {
        this.moisturePercent = moisturePercent;
    }

    public void setWaterAppliedGallons(Double waterAppliedGallons) {
        this.waterAppliedGallons = waterAppliedGallons;
    }

    public void setCo2Level(Double co2Level) {
        this.co2Level = co2Level;
    }

    public void setTurnStatus(String turnStatus) {
        this.turnStatus = turnStatus;
    }

    public void setRainInches(Double rainInches) {
        this.rainInches = rainInches;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
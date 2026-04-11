package com.compostapp.backend.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "daily_logs")
public class DailyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String operatorName;

    private String logTime;

    @Column(length = 1000)
    private String notes;

    private LocalDate logDate;

    private BigDecimal probe1TempBefore;
    private BigDecimal probe2TempBefore;
    private BigDecimal probe3TempBefore;

    private BigDecimal avgTempBefore;
    private BigDecimal tempAfter;

    private BigDecimal moisturePercent;
    private BigDecimal waterAppliedGallons;

    private String turnStatus;

    private BigDecimal rainInches;

    @ManyToOne
    @JoinColumn(name = "windrow_id", nullable = false)
    private Windrow windrow;

    public DailyLog() {}

    // getters and setters

    public Long getId() {
        return id;
    }

    public LocalDate getLogDate() {
        return logDate;
    }

    public BigDecimal getProbe1TempBefore() {
        return probe1TempBefore;
    }

    public BigDecimal getProbe2TempBefore() {
        return probe2TempBefore;
    }

    public BigDecimal getProbe3TempBefore() {
        return probe3TempBefore;
    }

    public BigDecimal getAvgTempBefore() {
        return avgTempBefore;
    }

    public BigDecimal getTempAfter() {
        return tempAfter;
    }

    public BigDecimal getMoisturePercent() {
        return moisturePercent;
    }

    public BigDecimal getWaterAppliedGallons() {
        return waterAppliedGallons;
    }

    public String getTurnStatus() {
        return turnStatus;
    }

    public BigDecimal getRainInches() {
        return rainInches;
    }

    public Windrow getWindrow() {
        return windrow;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setLogDate(LocalDate logDate) {
        this.logDate = logDate;
    }

    public void setProbe1TempBefore(BigDecimal probe1TempBefore) {
        this.probe1TempBefore = probe1TempBefore;
    }

    public void setProbe2TempBefore(BigDecimal probe2TempBefore) {
        this.probe2TempBefore = probe2TempBefore;
    }

    public void setProbe3TempBefore(BigDecimal probe3TempBefore) {
        this.probe3TempBefore = probe3TempBefore;
    }

    public void setAvgTempBefore(BigDecimal avgTempBefore) {
        this.avgTempBefore = avgTempBefore;
    }

    public void setTempAfter(BigDecimal tempAfter) {
        this.tempAfter = tempAfter;
    }

    public void setMoisturePercent(BigDecimal moisturePercent) {
        this.moisturePercent = moisturePercent;
    }

    public void setWaterAppliedGallons(BigDecimal waterAppliedGallons) {
        this.waterAppliedGallons = waterAppliedGallons;
    }

    public void setTurnStatus(String turnStatus) {
        this.turnStatus = turnStatus;
    }

    public void setRainInches(BigDecimal rainInches) {
        this.rainInches = rainInches;
    }

    public void setWindrow(Windrow windrow) {
        this.windrow = windrow;
    }

    public String getOperatorName() {
        return operatorName;
    }

    public String getLogTime() {
        return logTime;
    }

    public String getNotes() {
        return notes;
    }

    public void setOperatorName(String operatorName) {
    this.operatorName = operatorName;
}

public void setLogTime(String logTime) {
    this.logTime = logTime;
}

public void setNotes(String notes) {
    this.notes = notes;
}
}
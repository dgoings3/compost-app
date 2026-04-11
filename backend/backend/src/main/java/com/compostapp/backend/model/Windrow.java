package com.compostapp.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "windrows")
public class Windrow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String rowNumber;
    private String batchName;
    private String status;

    @ManyToOne
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    public Windrow() {
    }

    public Long getId() {
        return id;
    }

    public String getRowNumber() {
        return rowNumber;
    }

    public String getBatchName() {
        return batchName;
    }

    public String getStatus() {
        return status;
    }

    public Site getSite() {
        return site;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setRowNumber(String rowNumber) {
        this.rowNumber = rowNumber;
    }

    public void setBatchName(String batchName) {
        this.batchName = batchName;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setSite(Site site) {
        this.site = site;
    }
}
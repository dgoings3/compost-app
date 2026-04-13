package com.compostapp.backend.repository;

import com.compostapp.backend.model.DailyLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DailyLogRepository extends JpaRepository<DailyLog, Long> {
    List<DailyLog> findByWindrowId(Long windrowId);
    List<DailyLog> findByJobName(String jobName);
}
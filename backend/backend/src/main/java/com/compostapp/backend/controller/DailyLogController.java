package com.compostapp.backend.controller;

import com.compostapp.backend.model.DailyLog;
import com.compostapp.backend.model.Windrow;
import com.compostapp.backend.repository.DailyLogRepository;
import com.compostapp.backend.repository.WindrowRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://windrowpro.com",
        "https://www.windrowpro.com",
        "https://compost-app-1.onrender.com"
})
public class DailyLogController {

    private final DailyLogRepository dailyLogRepository;
    private final WindrowRepository windrowRepository;

    public DailyLogController(DailyLogRepository dailyLogRepository, WindrowRepository windrowRepository) {
        this.dailyLogRepository = dailyLogRepository;
        this.windrowRepository = windrowRepository;
    }

    @GetMapping
    public List<DailyLog> getAllLogs() {
        return dailyLogRepository.findAll();
    }

    @GetMapping("/windrow/{windrowId}")
    public List<DailyLog> getLogsByWindrow(@PathVariable Long windrowId) {
        return dailyLogRepository.findByWindrowId(windrowId);
    }

    @PostMapping
    public DailyLog createLog(@RequestBody DailyLog log) {
        normalizeLog(log);
        log.setWindrow(resolveWindrow(log));
        return dailyLogRepository.save(log);
    }

    @DeleteMapping("/{id}")
    public void deleteLog(@PathVariable Long id) {
        dailyLogRepository.deleteById(id);
    }

    @PutMapping("/{id}")
    public DailyLog updateLog(@PathVariable Long id, @RequestBody DailyLog updatedLog) {
        normalizeLog(updatedLog);
        updatedLog.setId(id);
        updatedLog.setWindrow(resolveWindrow(updatedLog));
        return dailyLogRepository.save(updatedLog);
    }

    private void normalizeLog(DailyLog log) {

        if (log.getTurnStatus() != null) {
            log.setTurnStatus(log.getTurnStatus().toUpperCase());
        }

        if (log.getJobName() != null) {
            log.setJobName(log.getJobName().trim());
        }

        if (log.getOperatorName() != null) {
            log.setOperatorName(log.getOperatorName().trim());
        }

        if (log.getNotes() != null) {
            log.setNotes(log.getNotes().trim());
        }

        // ✅ FIXED: removed BigDecimal + avgTempBefore logic (was breaking build)
        // You are already calculating average temp on the frontend
    }

    private Windrow resolveWindrow(DailyLog log) {
        if (log.getWindrow() == null ||
            log.getWindrow().getRowNumber() == null ||
            log.getWindrow().getRowNumber().isBlank()) {

            throw new IllegalArgumentException("Windrow row number is required");
        }

        String rowNumber = log.getWindrow().getRowNumber().trim();

        return windrowRepository.findByRowNumber(rowNumber)
                .orElseGet(() -> {
                    Windrow newWindrow = new Windrow();
                    newWindrow.setRowNumber(rowNumber);
                    newWindrow.setStatus("ACTIVE");
                    return windrowRepository.save(newWindrow);
                });
    }
}
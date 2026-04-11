package com.compostapp.backend.controller;

import com.compostapp.backend.model.DailyLog;
import com.compostapp.backend.model.Windrow;
import com.compostapp.backend.repository.DailyLogRepository;
import com.compostapp.backend.repository.WindrowRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
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
        if (log.getTurnStatus() != null) {
            log.setTurnStatus(log.getTurnStatus().toUpperCase());
        }

        log.setWindrow(resolveWindrow(log));
        return dailyLogRepository.save(log);
    }

    @DeleteMapping("/{id}")
    public void deleteLog(@PathVariable Long id) {
        dailyLogRepository.deleteById(id);
    }

    @PutMapping("/{id}")
    public DailyLog updateLog(@PathVariable Long id, @RequestBody DailyLog updatedLog) {
        if (updatedLog.getTurnStatus() != null) {
            updatedLog.setTurnStatus(updatedLog.getTurnStatus().toUpperCase());
        }

        updatedLog.setId(id);
        updatedLog.setWindrow(resolveWindrow(updatedLog));
        return dailyLogRepository.save(updatedLog);
    }

    private Windrow resolveWindrow(DailyLog log) {
        if (log.getWindrow() == null || log.getWindrow().getRowNumber() == null || log.getWindrow().getRowNumber().isBlank()) {
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

package com.compostapp.backend.controller;

import com.compostapp.backend.model.DailyLog;
import com.compostapp.backend.repository.DailyLogRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "http://localhost:5173")
public class DailyLogController {

    private final DailyLogRepository dailyLogRepository;

    public DailyLogController(DailyLogRepository dailyLogRepository) {
        this.dailyLogRepository = dailyLogRepository;
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
    return dailyLogRepository.save(updatedLog);
}
    }

package com.compostapp.backend.controller;

import com.compostapp.backend.model.Windrow;
import com.compostapp.backend.repository.WindrowRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/windrows")
public class WindrowController {

    private final WindrowRepository windrowRepository;

    public WindrowController(WindrowRepository windrowRepository) {
        this.windrowRepository = windrowRepository;
    }

    @GetMapping
    public List<Windrow> getAllWindrows() {
        return windrowRepository.findAll();
    }

    @GetMapping("/site/{siteId}")
    public List<Windrow> getWindrowsBySite(@PathVariable Long siteId) {
        return windrowRepository.findBySiteId(siteId);
    }

    @PostMapping
    public Windrow createWindrow(@RequestBody Windrow windrow) {
        return windrowRepository.save(windrow);
    }
}
package com.compostapp.backend.controller;

import com.compostapp.backend.model.Site;
import com.compostapp.backend.repository.SiteRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
public class SiteController {

    private final SiteRepository siteRepository;

    public SiteController(SiteRepository siteRepository) {
        this.siteRepository = siteRepository;
    }

    @GetMapping
    public List<Site> getAllSites() {
        return siteRepository.findAll();
    }

    @PostMapping
    public Site createSite(@RequestBody Site site) {
        return siteRepository.save(site);
    }
}
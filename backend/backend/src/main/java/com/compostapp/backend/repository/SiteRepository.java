package com.compostapp.backend.repository;

import com.compostapp.backend.model.Site;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SiteRepository extends JpaRepository<Site, Long> {
}
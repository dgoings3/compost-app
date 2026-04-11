package com.compostapp.backend.repository;

import com.compostapp.backend.model.Windrow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WindrowRepository extends JpaRepository<Windrow, Long> {
    List<Windrow> findBySiteId(Long siteId);
}
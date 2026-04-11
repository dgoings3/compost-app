package com.compostapp.backend.repository;

import com.compostapp.backend.model.Windrow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WindrowRepository extends JpaRepository<Windrow, Long> {
    List<Windrow> findBySiteId(Long siteId);
    Optional<Windrow> findByRowNumber(String rowNumber);
}
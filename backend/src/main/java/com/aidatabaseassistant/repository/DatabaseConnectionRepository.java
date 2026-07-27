package com.aidatabaseassistant.repository;

import com.aidatabaseassistant.entity.DatabaseConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DatabaseConnectionRepository extends JpaRepository<DatabaseConnection, Long> {

    List<DatabaseConnection> findByUserId(Long userId);

    Optional<DatabaseConnection> findByIdAndUserId(Long id, Long userId);

    boolean existsByConnectionNameAndUserId(String connectionName, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}

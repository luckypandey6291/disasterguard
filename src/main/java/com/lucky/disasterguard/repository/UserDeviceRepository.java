package com.lucky.disasterguard.repository;

import com.lucky.disasterguard.entity.UserDevice;
import com.lucky.disasterguard.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDeviceRepository extends JpaRepository<UserDevice, Long> {

    Optional<UserDevice> findByFcmToken(String fcmToken);

    List<UserDevice> findByUserIdAndActiveTrue(Long userId);

    @Query("SELECT d FROM UserDevice d JOIN d.user u WHERE u.role = :role AND d.active = true")
    List<UserDevice> findActiveDevicesByRole(@Param("role") Role role);

    @Query("SELECT d FROM UserDevice d WHERE d.active = true")
    List<UserDevice> findAllActiveDevices();
}

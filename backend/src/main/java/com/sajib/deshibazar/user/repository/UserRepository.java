package com.sajib.deshibazar.user.repository;

import com.sajib.deshibazar.user.entity.User;
import com.sajib.deshibazar.user.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    long countByRole(UserRole role);
}

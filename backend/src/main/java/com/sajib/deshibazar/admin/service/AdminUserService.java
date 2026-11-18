
package com.sajib.deshibazar.admin.service;

import com.sajib.deshibazar.admin.dto.AdminUserResponse;
import com.sajib.deshibazar.user.entity.User;
import com.sajib.deshibazar.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminUserService {

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers() {

        List<User> users = userRepository.findAll();

        return users.stream()
                .map(user -> new AdminUserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole(),
                        user.getCreatedAt()
                ))
                .toList();
    }
}


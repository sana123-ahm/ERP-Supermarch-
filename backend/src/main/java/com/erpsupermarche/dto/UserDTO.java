package com.erpsupermarche.dto;

import com.erpsupermarche.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private String id;
    private String email;
    private String name;
    private UserRole role;
    private String phoneNumber;
    private String avatarUrl;
    private Boolean active;
}

@Data
class LoginRequestDTO {
    private String email;
    private String password;
}

@Data
class LoginResponseDTO {
    private String token;
    private UserDTO user;

    public LoginResponseDTO(String token, UserDTO user) {
        this.token = token;
        this.user = user;
    }
}

@Data
class CreateUserRequestDTO {
    private String email;
    private String password;
    private String name;
    private UserRole role;
    private String phoneNumber;
}

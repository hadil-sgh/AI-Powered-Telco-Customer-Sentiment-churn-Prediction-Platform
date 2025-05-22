package tn.ooredoo.backendspringboot.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RegisterRequest {

    @NotEmpty(message = "Firstname is required")
    @NotBlank(message = "Firstname is required")
    private String firstname;
    @NotEmpty(message = "lastname is required")
    @NotBlank(message = "lastname is required")
    private String lastname;
    @Email(message = "email not well formed")
    @NotEmpty(message = "email is required")
    @NotBlank(message = "email is required")
    private String email;
    @NotEmpty(message = "password is required")
    @NotBlank(message = "password is required")
    @Size(min = 8, message = "password must be at least 8 characters")
    private String password;
}


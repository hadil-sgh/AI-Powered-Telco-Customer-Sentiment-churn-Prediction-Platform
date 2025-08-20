package tn.ooredoo.backendspringboot.auth;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ChangePasswordRequest {
        public String email;
        public String oldPassword;
        public String newPassword;

    }


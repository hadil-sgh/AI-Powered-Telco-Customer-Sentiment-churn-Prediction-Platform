package tn.ooredoo.backendspringboot.handler;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import static org.springframework.http.HttpStatus.NOT_IMPLEMENTED;

public enum businessErrorCode {

    NO_CODE(0, "No code provided", NOT_IMPLEMENTED),

    INCORRECT_CURRENT_PASSWORD(300, "Incorrect current password", HttpStatus.BAD_REQUEST),

    NEW_PASSWORD_DOES_NOT_MATCH(301, "new password does not match", HttpStatus.BAD_REQUEST),

    ACCOUNT_LOCKED(302, "Account not found", HttpStatus.NOT_FOUND),

    ACCOUNT_DISABLED(303, "Account Disabled", HttpStatus.NOT_FOUND),

    BAD_CREDENTIALS(304, "Incorrect Credentials", HttpStatus.NOT_FOUND),

    ;

    @Getter
    private int code;
    @Getter
    private String description;
    @Getter
    private HttpStatus httpStatus;


    businessErrorCode(int code, String description, HttpStatus httpStatus) {
        this.code = code;
        this.description = description;
        this.httpStatus = httpStatus;
    }

}

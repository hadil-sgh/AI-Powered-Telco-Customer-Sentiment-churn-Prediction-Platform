package tn.ooredoo.backendspringboot.auth;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
@Tag(name = "Authentification")
public class AuthentificationController {

    private final AuthentificationService authentificationService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseEntity<?> register(
            @RequestBody @Valid RegisterRequest request) throws MessagingException {
        authentificationService.register(request);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthentificationResponce> authenticate(
            @RequestBody @Valid AuthentificationRequest request) {

        AuthentificationResponce response = authentificationService.authenticate(request);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/activate-account")
    public void confirmAccount(
            @RequestParam String token) throws MessagingException {
        authentificationService.activateAccount(token);
    }



}
package tn.ooredoo.backendspringboot.auth;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
@Tag(name = "Authentification")
public class AuthentificationController {

    private final AuthentificationService authentificationService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseEntity <?> register(
            @RequestBody @Valid RegisterRequest request) {
        authentificationService.register(request);
        return ResponseEntity.accepted().build();
    }
}
package tn.ooredoo.backendspringboot.auth;


import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.ooredoo.backendspringboot.email.EmailService;
import tn.ooredoo.backendspringboot.email.EmailTemplateName;
import tn.ooredoo.backendspringboot.role.RoleRepository;
import tn.ooredoo.backendspringboot.security.JwtService;
import tn.ooredoo.backendspringboot.user.Token;
import tn.ooredoo.backendspringboot.user.TokenRepository;
import tn.ooredoo.backendspringboot.user.User;
import tn.ooredoo.backendspringboot.user.UserRepository;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthentificationService {

    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final EmailService emailService;
    private final AuthenticationManager authentificationManager;
    private final JwtService jwtService;
    @Value("${spring.application.mailing.frontend.activation-url}")
    private String activationUrl;

    public void register(RegisterRequest request) throws MessagingException {


        Optional<User> existingUserOpt = userRepository.findByEmail(request.getEmail());

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();

            // Allow registration only if password is null/empty and not enabled
            if (existingUser.getPassword() != null && !existingUser.getPassword().isBlank()) {
                throw new IllegalStateException("User already registered.");
            }

            if (existingUser.isEnabled()) {
                throw new IllegalStateException("Account already active.");
            }

            // Update the existing user with password and role
            existingUser.setPassword(passwordEncoder.encode(request.getPassword()));

            userRepository.save(existingUser);

            sendValidationEmail(existingUser);
            return;
        }

        // Else: reject registration because user must already exist
        throw new IllegalStateException("User not pre-created. Contact admin.");
    }


    private void sendValidationEmail(User user) throws MessagingException {
        var newToken = generateAndSendActivationToken(user);
        emailService.sendEmail(
                user.getEmail(),
                user.getFullName(),
                EmailTemplateName.ACTIVATE_ACCOUNT,
                activationUrl,
                newToken,
                "Activate your account"

        );
    }

    private String generateAndSendActivationToken(User user) {
        String generatedToken = generateActivationCode();
        var token = Token.builder()
                .token(generatedToken)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .user(user)
                .build();
        tokenRepository.save(token);
        return generatedToken;
    }

    private String generateActivationCode() {
        String characters = "0123456789";
        StringBuilder codeBuilder = new StringBuilder();
        SecureRandom random = new SecureRandom();
        for (int i = 0; i < 6; i++) {
            int randomIndex = random.nextInt(characters.length());
            codeBuilder.append(characters.charAt(randomIndex));
        }
        return codeBuilder.toString();
    }

    public AuthentificationResponce authenticate(AuthentificationRequest request) {
        var auth = authentificationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail()
                        , request.getPassword()
                )
        );
        var claims = new HashMap<String, Object>();
        var user = ((User) auth.getPrincipal());
        claims.put("fullName", user.getFullName());
        var jwtToken = jwtService.generateToken(claims, user);
        return AuthentificationResponce.builder().token(jwtToken).build();
    }

    // ? Marking a method as @Transactional ensures that the data is not compromised in case of an error
    //@Transactional
    public void activateAccount(String token) throws MessagingException {
        Token savedToken = tokenRepository.findByToken(token)
                // TODO: better exception handling
                .orElseThrow(() -> new RuntimeException("Invalid token"));
        if (LocalDateTime.now().isAfter(savedToken.getExpiresAt())) {
            sendValidationEmail(savedToken.getUser());
            throw new RuntimeException("Activation Token has expired. A 😄 new one has been sent to your email.");
        }
        var user = userRepository.findById(savedToken.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(true);
        userRepository.save(user);
        savedToken.setValidatedAt(LocalDateTime.now());
        tokenRepository.save(savedToken);


    }
}


package tn.ooredoo.backendspringboot.user;

import jakarta.mail.MessagingException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.ooredoo.backendspringboot.email.EmailService;
import tn.ooredoo.backendspringboot.email.EmailTemplateName;
import tn.ooredoo.backendspringboot.role.Role;
import tn.ooredoo.backendspringboot.role.RoleRepository;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final RoleRepository roleRepository;

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Override
    public void addEmployeeToDB(String mail, String firstName, String lastName, Integer id) {
        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(mail);
        if (existingUser.isPresent()) {
            throw new RuntimeException("User with email " + mail + " already exists.");
        }

        // Find the role
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + id));

        // Create user
        User user = User.builder()
                .email(mail)
                .firstname(firstName)
                .lastname(lastName)
                .roles(List.of(role))
                .enabled(true)
                .accountLocked(false)
                .build();

        // Save user
        userRepository.save(user);

        // Send invitation email
        try {
            sendInvitation(user);
        } catch (MessagingException e) {
            e.printStackTrace(); // or use proper logging
            throw new RuntimeException("Failed to send invitation email to " + mail, e);
        }
    }


    private void sendInvitation(User user) throws MessagingException {

        emailService.sendEmailManager(
                user.getEmail(),
                user.getFullName(),
                EmailTemplateName.INVITATION_EMAIL,
                "Complete Your Ooredoo Call Center Registration"

        );
    }

    @Override
    public User update(User user) {
        return userRepository.save(user);
    }

    @Override
    public void deleteById(Long id) {
        userRepository.deleteById(id);

    }

    @Override
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }
}

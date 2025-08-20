package tn.ooredoo.backendspringboot.user;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController

@RequestMapping("/user")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Operations related to user management")
public class UserController {
    private final UserService userService;

    @GetMapping("/getAll")
    public List<User> getAllUsers() {
        return userService.findAll();
    }

    @GetMapping("/getById")
    public User getUserById(Long id) {
        return userService.findById(id);
    }

    @GetMapping("/getByEmail")
    public User getUserByEmail(String email) {
        return userService.findByEmail(email);
    }

    @PostMapping("/save")
    public void addEmployee(@RequestParam String email, @RequestParam String firstName, @RequestParam String lastName, @RequestParam Integer role) {
        userService.addEmployeeToDB(email, firstName, lastName, role);
    }

    @PutMapping("/update")
    public User updateUser(@RequestParam User user) {
        return userService.update(user);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteUserById(@PathVariable Long id) {
        userService.deleteById(id);
    }
    @GetMapping("/getOnlineAgents")
    public List<User> getOnlineAgents() {

        return userService.findOnlineAgents();
    }
    @GetMapping("/agentIsOnline")
    public void agentIsOnline(@RequestParam String email) {
        User user = getUserByEmail(email);
         userService.agentIsOnline(user);
    }@GetMapping("/agentIsOffline")
    public void agentIsOffline(@RequestParam String email) {
        User user = getUserByEmail(email);
        userService.agentIsOffLine(user);
    }
    @PutMapping("/assign-team")
    public ResponseEntity<User> assignTeamToUser(
            @RequestParam Long userId,
            @RequestParam Long teamId) {

        User updatedUser = userService.assignTeamToUser(userId, teamId);
        return ResponseEntity.ok(updatedUser);
    }

}

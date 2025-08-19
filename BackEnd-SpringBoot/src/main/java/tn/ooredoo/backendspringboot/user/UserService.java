package tn.ooredoo.backendspringboot.user;

import java.util.List;

public interface UserService {
    User findByEmail(String email);

    void addEmployeeToDB(String mail, String firstName, String lastName, Integer role);

    User update(User user);

    void deleteById(Long id);

    User findById(Long id);

    List<User> findAll();
    List<User> findOnlineAgents();
    void agentIsOnline(User user);
    void agentIsOffLine(User user);
    User assignTeamToUser(Long userId, Long teamId);
}

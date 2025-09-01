package tn.ooredoo.backendspringboot.team;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.ooredoo.backendspringboot.user.User;
import tn.ooredoo.backendspringboot.user.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    @Override
    public Team createTeam(Team team) {
        User manager = team.getManager();
        manager.setTeam(team);
        userRepository.save(manager);
        return teamRepository.save(team);
    }

    @Override
    public Team updateTeam(Long id, Team updatedTeam) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found with id " + id));

        team.setType(updatedTeam.getType());
        team.setManager(updatedTeam.getManager());
        team.setAgents(updatedTeam.getAgents());

        return teamRepository.save(team);
    }

    @Override
    public void deleteTeam(Long id) {
        teamRepository.deleteById(id);
    }

    @Override
    public Team getTeamById(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found with id " + id));
    }

    @Override
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }
}

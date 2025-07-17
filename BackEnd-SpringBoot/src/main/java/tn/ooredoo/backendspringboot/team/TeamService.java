package tn.ooredoo.backendspringboot.team;

import java.util.List;

public interface TeamService {
    Team createTeam(Team team);
    Team updateTeam(Long id, Team team);
    void deleteTeam(Long id);
    Team getTeamById(Long id);
    List<Team> getAllTeams();
}

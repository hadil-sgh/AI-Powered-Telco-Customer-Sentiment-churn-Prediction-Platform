import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import { UserService } from '../../services/user.service';
import { TokenService } from '../../services/token.service';
import { Team, TeamType } from '../../models/team';
import { User } from '../../models/user';

@Component({
  selector: 'app-team-management',
  templateUrl: './team-management.component.html',
  styleUrls: ['./team-management.component.scss'],
})
export class TeamManagementComponent implements OnInit {
  teams: Team[] = [];
  users: User[] = [];
  availableUsers: User[] = [];
  currentManagerEmail: string = '';

  // Form Groups
  teamForm: FormGroup;
  userForm: FormGroup;

  // UI State
  showTeamForm = false;
  showUserForm = false;
  showAssignForm = false;
  selectedTeam: Team | null = null;
  selectedUsers: User[] = [];
  selectedUser: User | null = null;

  // Alert state
  alertMessage = '';
  alertType = '';
  showAlert = false;

  // Team Types
  teamTypes = Object.values(TeamType);

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private userService: UserService,
    private tokenService: TokenService
  ) {
    this.teamForm = this.fb.group({
      type: ['', Validators.required],
      manager: ['', Validators.required],
    });

    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      role: [2, Validators.required], // Default role for agent
    });
  }

  ngOnInit(): void {
    this.currentManagerEmail = this.tokenService.getEmailFromToken();
    this.loadTeams();
  }

  loadTeams(): void {
    this.teamService.getAllTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
        // Load users after teams are loaded so we can properly filter them
        this.loadUsers();
      },
      error: (error) => {
        this.showAlertMessage('Error loading teams', 'danger');
        console.error('Error loading teams:', error);
      },
    });
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Users received from API:', users);
        this.users = users;
        // Filter users that don't have a team using the helper method
        this.availableUsers = users.filter((user) => !this.getUserTeam(user));
        console.log('Available users (no team):', this.availableUsers);
      },
      error: (error) => {
        this.showAlertMessage('Error loading users', 'danger');
        console.error('Error loading users:', error);
      },
    });
  }

  toggleTeamForm(): void {
    this.showTeamForm = !this.showTeamForm;
    this.showUserForm = false;
    this.showAssignForm = false;
    if (this.showTeamForm) {
      this.teamForm.reset();
    }
  }

  toggleUserForm(): void {
    this.showUserForm = !this.showUserForm;
    this.showTeamForm = false;
    this.showAssignForm = false;
    if (this.showUserForm) {
      this.userForm.reset();
      this.userForm.patchValue({ role: 2 }); // Default agent role
      this.selectedUser = null; // Reset selected user
    }
  }

  toggleAssignForm(team?: Team): void {
    this.showAssignForm = !this.showAssignForm;
    this.showTeamForm = false;
    this.showUserForm = false;
    this.selectedTeam = team || null;
    this.selectedUsers = [];
  }

  createTeam(): void {
    if (this.teamForm.valid) {
      const managerEmail = this.teamForm.get('manager')?.value;
      const manager = this.users.find((user) => user.email === managerEmail);

      if (!manager) {
        this.showAlertMessage('Manager not found', 'danger');
        return;
      }

      const newTeam: Team = {
        type: this.teamForm.get('type')?.value,
        manager: manager,
        agents: [],
      };

      this.teamService.createTeam(newTeam).subscribe({
        next: (team) => {
          this.teams.push(team);
          this.teamForm.reset();
          this.showTeamForm = false;
          this.showAlertMessage('Team created successfully!', 'success');
        },
        error: (error) => {
          this.showAlertMessage('Error creating team', 'danger');
          console.error('Error creating team:', error);
        },
      });
    }
  }

  addUser(): void {
    if (this.userForm.valid) {
      if (this.selectedUser) {
        // Update existing user
        this.updateUser();
      } else {
        // Create new user
        const formData = this.userForm.value;

        this.userService
          .addEmployee(
            formData.email,
            formData.firstname,
            formData.lastname,
            formData.role
          )
          .subscribe({
            next: () => {
              this.loadUsers();
              this.userForm.reset();
              this.userForm.patchValue({ role: 2 });
              this.showUserForm = false;
              this.showAlertMessage('User added successfully!', 'success');
            },
            error: (error) => {
              this.showAlertMessage('Error adding user', 'danger');
              console.error('Error adding user:', error);
            },
          });
      }
    }
  }

  toggleUserSelection(user: User): void {
    const index = this.selectedUsers.findIndex((u) => u.id === user.id);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(user);
    }
  }

  isUserSelected(user: User): boolean {
    return this.selectedUsers.some((u) => u.id === user.id);
  }

  assignUsersToTeam(): void {
    if (this.selectedTeam && this.selectedUsers.length > 0) {
      const assignPromises = this.selectedUsers.map((user) =>
        this.userService.assignTeamToUser(user.id!, this.selectedTeam!.id!)
      );

      Promise.all(assignPromises)
        .then(() => {
          this.loadUsers();
          this.loadTeams();
          this.selectedUsers = [];
          this.showAssignForm = false;
          this.showAlertMessage(
            'Users assigned to team successfully!',
            'success'
          );
        })
        .catch((error) => {
          this.showAlertMessage('Error assigning users to team', 'danger');
          console.error('Error assigning users:', error);
        });
    }
  }

  deleteTeam(team: Team): void {
    if (team.id && confirm('Are you sure you want to delete this team?')) {
      this.teamService.deleteTeam(team.id).subscribe({
        next: () => {
          this.teams = this.teams.filter((t) => t.id !== team.id);
          this.loadUsers(); // Reload to update user team assignments
          this.showAlertMessage('Team deleted successfully!', 'success');
        },
        error: (error) => {
          this.showAlertMessage('Error deleting team', 'danger');
          console.error('Error deleting team:', error);
        },
      });
    }
  }

  deleteUser(user: User): void {
    if (user.id && confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUserById(user.id).subscribe({
        next: () => {
          this.users = this.users.filter((u) => u.id !== user.id);
          this.availableUsers = this.availableUsers.filter(
            (u) => u.id !== user.id
          );
          this.showAlertMessage('User deleted successfully!', 'success');
        },
        error: (error) => {
          this.showAlertMessage('Error deleting user', 'danger');
          console.error('Error deleting user:', error);
        },
      });
    }
  }

  showAlertMessage(message: string, type: string): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  closeAlert(): void {
    this.showAlert = false;
  }

  getTeamTypeLabel(type: string): string {
    switch (type) {
      case 'CUSTOMER_SERVICE':
        return 'Customer Service';
      case 'RETENTION_TEAM':
        return 'Retention Team';
      default:
        return type;
    }
  }

  getUsersInTeam(team: Team): User[] {
    // Use the agents array from the team response instead of filtering users
    return team.agents || [];
  }

  getTeamMemberCount(team: Team): number {
    return team.agents ? team.agents.length : 0;
  }

  getUserTeam(user: User): Team | undefined {
    if (user.team) {
      return user.team;
    }
    if (user.teamId) {
      return this.teams.find((team) => team.id === user.teamId);
    }
    return undefined;
  }

  getUserTeamType(user: User): string {
    const team = this.getUserTeam(user);
    return team ? team.type! : '';
  }

  removeUserFromTeam(user: User, team: Team): void {
    if (user.id && team.id) {
      // Assign to null team (remove from team)
      this.userService.assignTeamToUser(user.id, 0).subscribe({
        next: () => {
          this.loadUsers();
          this.loadTeams();
          this.showAlertMessage(
            'User removed from team successfully!',
            'success'
          );
        },
        error: (error) => {
          this.showAlertMessage('Error removing user from team', 'danger');
          console.error('Error removing user:', error);
        },
      });
    }
  }

  editUser(user: User): void {
    // Pre-populate form with user data
    this.userForm.patchValue({
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.roles?.[0]?.id || 2,
    });
    this.showUserForm = true;
    this.selectedUser = user;
  }

  updateUser(): void {
    if (this.userForm.valid && this.selectedUser) {
      const formData = this.userForm.value;

      const updatedUser: User = {
        ...this.selectedUser,
        email: formData.email,
        firstname: formData.firstname,
        lastname: formData.lastname,
      };

      this.userService.updateUser(updatedUser).subscribe({
        next: () => {
          this.loadUsers();
          this.userForm.reset();
          this.userForm.patchValue({ role: 2 });
          this.showUserForm = false;
          this.selectedUser = null;
          this.showAlertMessage('User updated successfully!', 'success');
        },
        error: (error) => {
          this.showAlertMessage('Error updating user', 'danger');
          console.error('Error updating user:', error);
        },
      });
    }
  }
}

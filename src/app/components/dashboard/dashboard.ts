import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../services/user';
import { Request } from '../../services/request';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  users: any[] = [];
  requests: any[] = [];
  openedDropdownId: number | null = null;
  showEditModal = false;
  showAddModal = false;
  selectedUser: any = {};
  isSaving = false;
  roles = [
    { id: 1, name: 'Developer' },
    { id: 2, name: 'Tester' },
    { id: 3, name: 'Manager' },
    { id: 4, name: 'Automation' },
    { id: 5, name: 'HR' },
    { id: 6, name: 'Software Enginner' }
  ];
  newUser = { user_name: '', email: '', role: '', reportee: [] };

  constructor(
    private authService : Auth,
    private router : Router,
    private userService: User,
    private requestService: Request,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRequests();
  }
  loadUsers() {
    this.userService
      .getUsers()
      .subscribe({
        next: (response: any) => {
          this.users = response;
          this.cd.detectChanges();
        },
        error: (error) => {
          console.log(error);
        }
      });
  }

  onLogout(){
    this.authService.logout();
    this.router.navigate(['/login'])
  }

  loadRequests() {
    this.requestService
      .getAllRequests()
      .subscribe({
        next: (response: any) => {
          this.requests = response;
          this.cd.detectChanges();
        },
        error: (error) => {
          console.log(error);
        }
      });
  }

  toggleDropdown(id: number) {
    if (this.openedDropdownId === id) {
      this.openedDropdownId = null;
    } else {
      this.openedDropdownId = id;
    }
  }

  editUser(user: any) {
    this.selectedUser =
      JSON.parse(JSON.stringify(user));
    this.showEditModal = true;
  }

  closeModal() {
    this.showEditModal = false;
  }

  openAddModal() {
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  saveUser() {
    const newUserObject = {
      user_name: this.newUser.user_name,
      email: this.newUser.email,
      role: this.newUser.role,
      reportee: [
        {
          id: 101,
          name: 'Amit'
        },
        {
          id: 102,
          name: 'Neha'
        }
      ]
    };
    this.userService
      .addUser(newUserObject)
      .subscribe({
        next: () => {
          alert('User Added');
          this.loadUsers();
          this.closeAddModal();
          this.newUser = {
            user_name: '',
            email: '',
            role: '',
            reportee: []
          };
        },
        error: (error) => {
          console.log(error);
        }
      });
  }

  saveEditRequest() {
    if (this.isSaving) {
      return;
    }
    const alreadyPending =
      this.requests.find(
        request =>
          request.userId ==
          this.selectedUser.id &&
          request.status === 'PENDING'
      );
    if (alreadyPending) {
      alert(
        'Pending request already exists'
      );
      return;
    }
    this.isSaving = true;
    const requestObject = {
      requestType: 'EDIT',
      userId: this.selectedUser.id,
      oldData: this.users.find(
        x => x.id === this.selectedUser.id
      ),
      newData: this.selectedUser,
      status: 'PENDING',
      actionTaken: false
    };

    this.requestService
      .saveRequest(requestObject)
      .subscribe({
        next: () => {
          alert('Request Saved');
          this.showEditModal = false;
          this.isSaving = false;
          this.loadRequests();
        },
        error: (error) => {
          console.log(error);
          this.isSaving = false;
        }
      });
  }

  acceptRequest(request: any) {
    request.actionTaken = true;
    request.status = 'ACCEPTED';
    this.userService
      .updateUser(
        request.userId,
        request.newData
      )
      .subscribe({
        next: () => {
          this.requestService
            .updateRequest(
              request.id,
              request
            )
            .subscribe({
              next: () => {
                this.loadUsers();
                this.loadRequests();
                alert(
                  'Request Accepted'
                );
              },
              error: (error) => {
                console.log(error);
              }
            });
        },
        error: (error) => {
          console.log(error);
        }
      });
  }
  rejectRequest(request: any) {
    request.actionTaken = true;
    request.status = 'REJECTED';
    this.requestService
      .updateRequest(
        request.id,
        request
      )
      .subscribe({
        next: () => {
          this.loadRequests();
          alert(
            'Request Rejected'
          );
        },
        error: (error) => {
          console.log(error);
        }
      });
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          alert('User deleted');
          this.loadUsers();
        },
        error: (err) => console.error(err)
      });
    }
  }
}

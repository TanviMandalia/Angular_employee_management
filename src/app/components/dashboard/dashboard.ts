import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../services/user';
import { Request } from '../../services/request';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

interface Reportee {
  name: string;
}

interface UserData {
  id?: number;
  user_name: string;
  email: string;
  role: string;
  reportee: Reportee[] | string[];
}

interface RequestData {
  id?: number;
  requestType: string;
  userId: number;
  oldData: UserData;
  newData: UserData;
  status: string;
  actionTaken: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  users = signal<UserData[]>([]);
  requests = signal<RequestData[]>([]);
  openedDropdownId: number | null = null;
  showEditModal = false;
  showAddModal = false;
  isSaving = false;
  manualReportees = '';
  selectedReportees: string[] = [];

  selectedUser: UserData = {
    user_name: '',
    email: '',
    role: '',
    reportee: []
  };

  newUser: UserData = {
    user_name: '',
    email: '',
    role: '',
    reportee: []
  };

  roles = [
    { id: 1, name: 'Developer' },
    { id: 2, name: 'Tester' },
    { id: 3, name: 'Manager' },
    { id: 4, name: 'Automation' },
    { id: 5, name: 'HR' },
    { id: 6, name: 'Software Enginner' },
    { id: 7, name: "CEO" }
  ];

  constructor(
    private authService: Auth,
    private router: Router,
    private userService: User,
    private requestService: Request
  ) { }

  ngOnInit() {
    this.loadUsers();
    this.loadRequests();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (response: any) => {
        this.users.set(
          response.map((u: any) => ({
            ...u, // spread oprator is used for take all value from value/object & copy them here
            role: typeof u.role === 'object' ? u.role.name : u.role //check is role an object
          }))
        );
      }
    });
  }

  loadRequests() {
    this.requestService.getAllRequests().subscribe({
      next: (response: any) => {
        this.requests.set(response);
      },
      error:(err) => {
        console.log("Unable to load API", err);
      },
    });
  }

  getReporteeNames(reportees: Reportee[] | string[]) {
    let names = '';

    for (let i = 0; i < reportees.length; i++) {
      const reportee = reportees[i];

      if (typeof reportee === 'string') {
        names += reportee;
      } else {
        names += reportee.name;
      }

      if (i < reportees.length - 1) {
        names += ', ';
      }
    }

    return names;
  }

  hasPendingRequests(userId: number) {
    return this.requests().some(
      request =>
        request.userId === userId &&
        request.status === 'PENDING'
    );
  }

  selectAll() {
    this.selectedReportees = this.users().map(u => u.user_name);
  }

  clearAll() {
    this.selectedReportees = [];
  }

  toggleDropdown(id: number) {
    this.openedDropdownId = this.openedDropdownId === id ? null : id;
  }

  toggleReportee(name: string) {
    const index = this.selectedReportees.indexOf(name);

    if (index === -1) {
      this.selectedReportees.push(name);
    } else {
      this.selectedReportees.splice(index, 1);
    }
  }

  hasRequests(userId: number) {
    return this.requests().some(r => r.userId === userId);
  }

  editUser(user: UserData) {

    this.selectedUser = {
      id: user.id,
      user_name: user.user_name,
      email: user.email,
      role: user.role,
      reportee: user.reportee
    };

    this.selectedReportees = [];

    if (user.reportee instanceof Array) {
      for (let i = 0; i < user.reportee.length; i++) {
        const r = user.reportee[i];

        if (typeof r === 'string') {
          this.selectedReportees.push(r);
        } else {
          this.selectedReportees.push(r.name);
        }
      }
    }

    this.showEditModal = true;
  }

  closeModal() {
    this.showEditModal = false;
  }

  openAddModal() {
    this.showAddModal = true;
  }

  saveUser() {
    const reporteeArray: Reportee[] = [];

    for (let i = 0; i < this.selectedReportees.length; i++) {
      reporteeArray.push({ name: this.selectedReportees[i] });
    }

    const newUserObject: UserData = {
      user_name: this.newUser.user_name,
      email: this.newUser.email,
      role: this.newUser.role,
      reportee: reporteeArray
    };

    this.userService.addUser(newUserObject).subscribe({
      next: () => {
        alert('User Added');
        this.loadUsers();
        this.closeAddModal();
      }
    });
  }

  closeAddModal() {
    this.showAddModal = false;
    this.newUser = {
      user_name: '',
      email: '',
      role: '',
      reportee: []
    };

    this.selectedReportees = [];
  }

  saveEditRequest() {
    let originalUserSource: UserData | null = null;

    const allUsers = this.users();

    for (let i = 0; i < allUsers.length; i++) {
      if (allUsers[i].id === this.selectedUser.id) {
        originalUserSource = allUsers[i];
        break;
      }
    }

    if (!originalUserSource) return;
    const reporteeArray: string[] = [];

    for (let i = 0; i < this.selectedReportees.length; i++) {
      reporteeArray.push(this.selectedReportees[i]);
    }

    this.selectedUser.reportee = reporteeArray;
    this.isSaving = true;

    const requestObject: RequestData = {
      requestType: 'EDIT',
      userId: this.selectedUser.id || 0,
      oldData: originalUserSource,
      newData: this.selectedUser,
      status: 'PENDING',
      actionTaken: false
    };

    this.requestService.saveRequest(requestObject).subscribe({
      next: () => {
        alert('Request Saved');
        this.showEditModal = false;
        this.isSaving = false;
        this.loadRequests();
      }
    });
  }

  acceptRequest(request: RequestData) {
    request.actionTaken = true;
    request.status = 'ACCEPTED';

    this.userService.updateUser(request.userId, request.newData).subscribe({
      next: () => {
        this.requestService.updateRequest(request.id || 0, request).subscribe({
          next: () => {
            this.loadUsers();
            this.loadRequests();
            alert('Request Accepted');
          }
        });
      }
    });
  }

  rejectRequest(request: RequestData) {
    request.actionTaken = true;
    request.status = 'REJECTED';

    this.requestService.updateRequest(request.id || 0, request).subscribe({
      next: () => {
        this.loadRequests();
        alert('Request Rejected');
      }
    });
  }

  deleteUser(userId: number) {
    if (!confirm('Are you sure?')) return;

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        alert('User deleted');
        this.loadUsers();
      }
    });
  }

  onLogout() {
    if (!confirm('Are you sure!! You Wnat to Log-out?')) return;

    this.authService.logout();
    this.router.navigate(['/']);
  }
}
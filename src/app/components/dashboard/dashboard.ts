import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../services/user';
import { Request } from '../../services/request';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  users: any[] = [];
  requests: any[] = [];
  expandedRequestIds: any[] = []; // make to allow multiple requests


  // getReporteeNames(reporteeNames: string[]) {
  //   return reporteeNames.join(', ');
  // }

  getReporteeNames(reportees: any[]): string {
    if (!reportees || !Array.isArray(reportees)) {
      return '';
    }
    return reportees.map(r => r.name || r).join(', ');
  }

  openedDropdownId: number | null = null;
  showEditModal = false;
  showAddModal = false;
  selectedUser: any = { reportee: [] };
  isSaving = false;
  manualReportees: string = '';


  roles = [
    { id: 1, name: 'Developer' },
    { id: 2, name: 'Tester' },
    { id: 3, name: 'Manager' },
    { id: 4, name: 'Automation' },
    { id: 5, name: 'HR' },
    { id: 6, name: 'Software Enginner' }
  ];

  newUser = {
    user_name: '',
    email: '',
    role: '',
    reportee: [] as any[]
  };

  constructor(
    private authService: Auth,
    private router: Router,
    private userService: User,
    private requestService: Request,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRequests();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (response: any) => {
        this.users = response;
        this.cd.detectChanges();
      },
      error: (error) => console.log(error)
    });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  loadRequests() {
    this.requestService.getAllRequests().subscribe({
      next: (response: any) => {
        this.requests = response;
        this.cd.detectChanges();
      },
      error: (error) => console.log(error)
    });
  }

  toggleDropdown(id: number) {
    this.openedDropdownId = this.openedDropdownId === id ? null : id;
  }

toggleRequest(requestId: any) {
  const index = this.expandedRequestIds.indexOf(requestId);
  if (index > -1) {
  
    this.expandedRequestIds.splice(index, 1);
  } else {

    this.expandedRequestIds.push(requestId);
  }
}

isExpanded(requestId: any): boolean {
  return this.expandedRequestIds.includes(requestId);
}


editUser(user: any) {

  this.selectedUser = JSON.parse(JSON.stringify(user));
  
  if (this.selectedUser.reportee) {
    if (Array.isArray(this.selectedUser.reportee)) {
      this.manualReportees = this.selectedUser.reportee
        .map((r: any) => r.name || r)
        .join(', ');
    } else {
      this.manualReportees = this.selectedUser.reportee;
    }
  } else {
    this.manualReportees = '';
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
   
    const reporteeArray = this.manualReportees
      .split(',')
      .map(name => name.trim())
      .filter(name => name !== '')
      .map(name => ({ name: name })); 

   
    const roleName = typeof this.newUser.role === 'object'
      ? (this.newUser.role as any).name
      : this.newUser.role;

    const newUserObject = {
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
      },
      error: (error) => console.log(error)
    });
  }

  closeAddModal() {
    this.showAddModal = false;
    this.newUser = { user_name: '', email: '', role: '', reportee: [] };
    this.manualReportees = ''; 
  }


saveEditRequest() {
  if (this.isSaving) return;

  const originalUserSource = this.users.find(x => x.id === this.selectedUser.id);
  if (!originalUserSource) return;

  // Check for existing pending
  const alreadyPending = this.requests.find(
    r => r.userId === this.selectedUser.id && r.status === 'PENDING'
  );
  if (alreadyPending) {
    alert('Pending request already exists');
    return;
  }

  // --- SYNC MANUALLY ADDED REPORTEES ---
  // Convert the comma-separated string back into an array
  this.selectedUser.reportee = this.manualReportees
    .split(',')
    .map(name => name.trim())
    .filter(name => name !== '');

  this.isSaving = true;

  const requestObject = {
    requestType: 'EDIT',
    userId: this.selectedUser.id,
    // Deep clone original to ensure 'Old' stays 'Old'
    oldData: JSON.parse(JSON.stringify(originalUserSource)), 
    // Deep clone selected to ensure 'New' captures current edits
    newData: JSON.parse(JSON.stringify(this.selectedUser)),
    status: 'PENDING',
    actionTaken: false
  };

  this.requestService.saveRequest(requestObject).subscribe({
    next: () => {
      alert('Request Saved');
      this.showEditModal = false;
      this.isSaving = false;
      this.loadRequests();
    },
    error: (err) => {
      console.error(err);
      this.isSaving = false;
    }
  });
}




  acceptRequest(request: any) {
    request.actionTaken = true;
    request.status = 'ACCEPTED';

    this.userService.updateUser(request.userId, request.newData).subscribe({
      next: () => {
        this.requestService.updateRequest(request.id, request).subscribe({
          next: () => {
            this.loadUsers();
            this.loadRequests();
            alert('Request Accepted');
          },
          error: (error) => console.log(error)
        });
      },
      error: (error) => console.log(error)
    });
  }

  rejectRequest(request: any) {
    request.actionTaken = true;
    request.status = 'REJECTED';

    this.requestService.updateRequest(request.id, request).subscribe({
      next: () => {
        this.loadRequests();
        alert('Request Rejected');
      },
      error: (error) => console.log(error)
    });
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          alert('User deleted');
          this.loadUsers();
        },
        error: (err) => console.log(err)
      });
    }
  }
}
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username: string = '';
  password: string = '';
  email: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router
  ) { }

  loginUser() {

    if (!this.username || !this.password) {
      this.errorMessage = 'Please fill all fields';
      return;
    }

    if (this.username === 'user' && this.password === 'user123') {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Invalid Username or Password';
    }
  }
}

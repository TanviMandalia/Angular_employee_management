import { Component } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username: string = '';
  password: string = '';

  errorMessage: string = '';

  constructor(
    private authService: Auth,
    private router: Router
  ) { }

  loginUser() {

    if (!this.username || !this.password) {
      this.errorMessage = 'Please fill all fields';
      return;
    }

    const isValidUser = this.authService.login(this.username, this.password);

    if (isValidUser) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Invalid Username or Password';
    }
  }
}

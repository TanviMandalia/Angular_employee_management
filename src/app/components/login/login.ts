import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone : true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username: string = '';
  password: string = '';
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
      this.errorMessage = 'Check your Username & Password may be it is incorrect!';
    }
  }
}

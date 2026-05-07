import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  constructor() { }

  login(username: string, password: string): boolean {

    if (username === 'user' && password === 'user123') {
      localStorage.setItem('isLoggedIn', 'true');
      return true;
    }

    return false;
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

}
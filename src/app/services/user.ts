import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class User {
  apiUrl = 'http://localhost:3000/users';

  constructor(
    private http: HttpClient
  ) { }

  getUsers() {
    return this.http.get(this.apiUrl);

  }

  updateUser(id: any, data: any) {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      data
    );

  }

  addUser(data: any) {
    return this.http.post(
      this.apiUrl,
      data
    );
  }

  deleteUser(id: string | number) {
  return this.http.delete(`${this.apiUrl}/${id}`); 
}

}

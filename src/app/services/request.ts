import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Request {
  requestApi =
    'http://localhost:3000/requests';

  constructor(
    private http: HttpClient
  ) { }

  saveRequest(data: any) {

    return this.http.post(
      this.requestApi,
      data
    );

  }

  getAllRequests() {

    return this.http.get(
      this.requestApi
    );

  }

  updateRequest(id: number, data: any) {

    return this.http.put(
      `${this.requestApi}/${id}`,
      data
    );

  }

}

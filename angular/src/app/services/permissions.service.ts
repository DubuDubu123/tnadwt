import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionsRoleNavService {
  private apiUrl = 'http://localhost:3000/api/permissions_role_nav'; // Replace with your backend URL

  constructor(private http: HttpClient) {}

  getPermissions(roleId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${roleId}`);
  }
}

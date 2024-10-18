import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private baseUrl = 'http://localhost:3000/apps/rolesnew';

  constructor(private http: HttpClient) {}

  // Get all roles
  getAllRoles(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  // Add a new role
  addRole(role: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, role);
  }

  // Update a role
  updateRole(roleId: number, role: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${roleId}`, role);
  }

  // Delete a role
  deleteRole(roleId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${roleId}`);
  }

  toggleRoleStatus(roleId: number, status: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${roleId}/status`, { status });
}
}

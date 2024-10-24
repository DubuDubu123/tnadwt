import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private permissionsBaseUrl = 'http://localhost:3000/apps/permissions/';

  constructor(private http: HttpClient) {}

  // Get all permissions
  getAllPermissions(): Observable<any> {
    return this.http.get(`${this.permissionsBaseUrl}`);
  }

  // Get all roles (using permissions endpoint)
  getAllRoles(): Observable<any> {
    return this.http.get(`${this.permissionsBaseUrl}roles`);
  }

  // Add a new permission
  addPermission(permission: any): Observable<any> {
    return this.http.post(`${this.permissionsBaseUrl}`, permission);
  }

  // Update a permission
  updatePermission(permissionId: number, permission: any): Observable<any> {
    return this.http.put(`${this.permissionsBaseUrl}/${permissionId}`, permission);
  }

  // Delete a permission
  deletePermission(permissionId: number): Observable<any> {
    return this.http.delete(`${this.permissionsBaseUrl}/${permissionId}`);
  }

  // Get permissions by role ID (including has_permission status)
  getPermissionsByRoleId(roleId: number): Observable<any> {
    return this.http.get(`${this.permissionsBaseUrl}${roleId}/permissions`);
  }

  // Update a single permission for a role (toggle has_permission)
  updateRolePermission(roleId: number, permissionId: number, hasPermission: number): Observable<any> {
    return this.http.put(`${this.permissionsBaseUrl}${roleId}/permissions/${permissionId}`, { has_permission: hasPermission });
  }

  // Update multiple permissions for a role
  updateRolePermissions(roleId: number, permissions: any[]): Observable<any> {
    return this.http.put(`${this.permissionsBaseUrl}${roleId}/permissions`, { permissions });
  }
}

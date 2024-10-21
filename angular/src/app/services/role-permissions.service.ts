import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RolePermissionsService {

  private apiUrl = 'http://localhost:3000/api/rolepermissions'; // Replace with your backend API URL
  private permissionsSubject: BehaviorSubject<{ [key: string]: number }> = new BehaviorSubject<{ [key: string]: number }>({});
  public permissions$: Observable<{ [key: string]: number }> = this.permissionsSubject.asObservable(); // Public observable

  constructor(private http: HttpClient) { }

  // Load permissions from the backend
  loadPermissions(roleId: number): void {
    this.http.get<{ permissions: { [key: string]: number } }>(`${this.apiUrl}/${roleId}`).pipe(
      tap(response => {
        const permissions = response.permissions;
        this.permissionsSubject.next(permissions); // Update permissions in BehaviorSubject
        sessionStorage.setItem('permissions', JSON.stringify(permissions)); // Store in sessionStorage
      })
    ).subscribe();
  }

  // Get the current permissions
  getPermissions(): { [key: string]: number } {
    return this.permissionsSubject.getValue();
  }

  // Check if a specific permission is granted (has_permission === 1)
  hasPermission(permissionName: string): boolean {
    const permissions = this.getPermissions();
    return permissions[permissionName] === 1;
  }
}

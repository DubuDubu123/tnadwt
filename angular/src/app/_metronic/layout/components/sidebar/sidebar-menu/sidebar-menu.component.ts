import { Component, OnInit, OnDestroy } from '@angular/core';
import { RolePermissionsService } from 'src/app/services/role-permissions.service';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit, OnDestroy {

  permissions: { [key: string]: number } = {};
  permissionsSubscription: Subscription = new Subscription();
  routerSubscription: Subscription = new Subscription();
  dynamicMenuItems: string[] = []; // Array to store dynamically generated menu items

  constructor(
    public rolePermissionsService: RolePermissionsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const userData = JSON.parse(sessionStorage.getItem('user_data') || '{}');
    const roleId = userData.role;

    if (roleId) {
      // Load permissions on initial load
      this.loadPermissions(roleId);
    }

    // Subscribe to permission changes to reflect them instantly
    this.permissionsSubscription = this.rolePermissionsService.permissions$.subscribe(
      (permissions: { [key: string]: number }) => {
        this.permissions = permissions;
        this.updateDynamicMenuItems(); // Update the dynamic menu items
        this.cdr.detectChanges(); // Force change detection to update the view
      }
    );

    // Ensure permissions are loaded each time navigation happens
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (roleId) {
          this.loadPermissions(roleId);
        }
      });
  }

  // Load permissions for a given role
  loadPermissions(roleId: number) {
    this.rolePermissionsService.loadPermissions(roleId);
  }

  updateDynamicMenuItems() {
    // Explicitly define the type for normalizedPermissions
    const normalizedPermissions: { [key: string]: number } = {};

    for (const [key, value] of Object.entries(this.permissions)) {
      normalizedPermissions[key.toLowerCase().trim()] = value;
    }
    this.permissions = normalizedPermissions;

    // Filter items where permission is 1 and store them in the dynamicMenuItems array
    this.dynamicMenuItems = Object.keys(this.permissions).filter(permissionName => this.permissions[permissionName] === 1);
    //console.log('Dynamic Menu Items:', this.dynamicMenuItems); // Debug log for dynamic menu items
  }




  hasPermission(permissionName: string): boolean {
    // Normalize the permission name by trimming and converting to lowercase
    const normalizedPermissionName = permissionName.trim().toLowerCase();
    const hasPermission = this.permissions[normalizedPermissionName] === 1;

    //console.log(`Checking permission for ${permissionName}:`, hasPermission);

    return hasPermission;
  }

  hasPermissions(): boolean {
    return Object.keys(this.permissions).length > 0;
  }

  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    if (this.permissionsSubscription) {
      this.permissionsSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}

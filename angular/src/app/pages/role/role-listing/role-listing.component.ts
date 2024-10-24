import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { NgForm } from '@angular/forms';
import { RoleService } from 'src/app/services/role.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { PermissionService } from 'src/app/services/permission.service';


@Component({
  selector: 'app-role-listing',
  templateUrl: './role-listing.component.html',
  styleUrls: ['./role-listing.component.scss']
})
export class RoleListingComponent implements OnInit {
  @ViewChild('formModal') formModal: TemplateRef<any>;
  modalRef: NgbModalRef;
  isLoading = false;
  isEditing = false;

  roles: any[] = [];
  roleModel: { id: number; name: string } = { id: 0, name: '' };

  currentUser = { id: 0, role: '' }; // Current user information

  constructor(
    private modalService: NgbModal,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load user data from sessionStorage
    this.loadUserFromSession();

    if (!this.currentUser.id || !this.currentUser.role) {
      this.router.navigate(['/auth/login']);
      return; // Stop further initialization if the user is not logged in
    }

    // Load roles if the user is logged in
    this.loadRoles();
  }

  loadUserFromSession() {
    const userDataString = sessionStorage.getItem('user_data');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.currentUser.id = userData.id;
      this.currentUser.role = userData.role;
      console.log('Loaded user data:', this.currentUser); // Debug log for user data
    }
  }

  // Load all roles with user count
  loadRoles() {
    this.roleService.getAllRoles().subscribe(
      (roles) => {
        console.log('Roles loaded:', roles); // Debug: Ensure roles are being loaded
        this.roles = roles;
        this.cd.detectChanges(); // Trigger change detection to ensure UI updates
      },
      (error) => {
        Swal.fire('Error', 'Failed to load roles. Please try again later.', 'error');
      }
    );
  }

  // Open the modal for adding or editing a role
  openModal() {
    this.modalRef = this.modalService.open(this.formModal, { centered: true });
  }

  // Close the modal
  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    }
    this.resetForm();
  }

  // Reset the role form
  resetForm() {
    this.roleModel = { id: 0, name: '' };
    this.isEditing = false;
  }

  // Handle form submission
  onSubmit(myForm: NgForm) {
    if (myForm.invalid) return;

    this.isLoading = true;
    if (this.isEditing) {
      this.roleService.updateRole(this.roleModel.id, this.roleModel).subscribe(
        () => {
          this.showAlert('Role updated successfully!');
          this.loadRoles();
          this.closeModal();
        },
        (error) => {
          if (error.status === 400 && error.error.error === 'Role name already exists') {
            Swal.fire('Error', 'Role name already exists. Please choose a different name.', 'error');
          } else {
            Swal.fire('Error', 'Failed to update the role. Please try again later.', 'error');
          }
        }
      );
    } else {
      this.roleService.addRole(this.roleModel).subscribe(
        () => {
          this.showAlert('Role added successfully!');
          this.loadRoles();
          this.closeModal();
        },
        (error) => {
          if (error.status === 400 && error.error.error === 'Role name already exists') {
            Swal.fire('Error', 'Role name already exists. Please choose a different name.', 'error');
          } else {
            Swal.fire('Error', 'Failed to add the role. Please try again later.', 'error');
          }
        }
      );
    }
    this.isLoading = false;
  }


  // Edit an existing role
  editRole(role: any) {
    this.isEditing = true;
    this.roleModel = { id: role.role_id, name: role.role_name };
    this.openModal();
  }

  // Delete a role with confirmation
  deleteRole(roleId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the role!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.roleService.deleteRole(roleId).subscribe(() => {
          this.showAlert('Role deleted successfully!');
          this.loadRoles();
        });
      }
    });
  }
  toggleRoleStatus(role: any) {
    // Determine the new status and update UI instantly
    const previousStatus = role.status;
    const newStatus = role.status === '1' ? '0' : '1';
    role.status = newStatus;

    console.log('Toggling status for role ID:', role.role_id, 'Current Status:', previousStatus, 'New Status:', newStatus); // Debug log

    // Call the backend to actually update the status in the database
    this.roleService.toggleRoleStatus(role.role_id, previousStatus).subscribe(
        (response) => {
            // No need to update the status here since we already updated it in the UI
            this.showAlert(`Role status updated to ${role.status === '1' ? 'Active' : 'Inactive'}`);
        },
        (error) => {
            // Revert the status change if there's an error
            role.status = previousStatus;
            Swal.fire('Error', 'Failed to update role status. Please try again later.', 'error');
        }
    );
}








  // Show success alert message
  showAlert(message: string) {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: message,
      confirmButtonText: 'OK',
    });
  }
}

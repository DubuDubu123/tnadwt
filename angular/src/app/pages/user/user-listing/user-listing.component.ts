import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { UserService } from 'src/app/services/user.service';
import { Router, NavigationEnd } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-user-listing',
  templateUrl: './user-listing.component.html',
  styleUrls: ['./user-listing.component.scss']
})
export class UserListingComponent implements OnInit {

  @ViewChild('userModal', { static: true }) userModal: any;
  @ViewChild('successSwal') public readonly successSwal!: SwalComponent;

  modalRef: NgbModalRef | undefined;
  editIndex: number | null = null;

  users: any[] = [];
  roles: any[] = [];
  user: any = {
    role: '',
    user_role_name: '',
    district: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    updatedBy: '',
    status: '1'
  };

  currentUser: any = {};

  user_role_name: string[] = [
    'Secretary',
    'ADW&TW Dept.',
    'IG (SJ&HR)',
    'Director, ADW Dept.',
    'Director, TW Dept.',
    'The users of the office of IG (SJ&HR) Tamil Nadu Police',
    'For DSPs of the SJ&HR Wing',
    'For DADTWOs of the ADW&TW Dept., in each district'
  ];

  districts = [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
    'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Karur', 'Krishnagiri',
    'Madurai', 'Nagapattinam', 'Kanyakumari', 'Namakkal', 'Perambalur', 'Pudukkottai',
    'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur',
    'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupattur',
    'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram',
    'Virudhunagar',
    // Adding cities
    'Chennai City', 'Avadi City', 'Tambaram City', 'Salem City', 'Coimbatore City',
    'Tiruppur City', 'Trichy City', 'Madurai City', 'Tirunelveli City'
  ];

  searchText: string = '';
  page: number = 1;

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd && event.urlAfterRedirects.includes('/apps/users'))
    ).subscribe(() => {
      this.loadUsers();
    });
  }

  loadUserFromSession() {
    // Load user data from sessionStorage
    const userDataString = sessionStorage.getItem('user_data');
    if (userDataString) {
      this.user = JSON.parse(userDataString);
      //console.log('Loaded user data:', this.user); // Add console log to verify the data
    }
  }

  ngOnInit(): void {
    // Load user data from session
    this.loadUserFromSession();

    // Assign userId and userRole to currentUser if they exist
    const userId = this.user?.id;  // Adjusted to use 'id' from loaded user data
    const userRole = this.user?.role; // Adjusted to use 'role' from loaded user data

    // Debug to see if userRole is being properly fetched
    //console.log('User Role:', userRole);

    if (userId && userRole) {
      this.currentUser.id = userId;
      this.currentUser.role = userRole;
    } else {
      // Redirect to login if no session data is found
      this.router.navigate(['/auth/login']);
      return; // Stop further initialization
    }

    // Load users and roles only if the user is logged in
    this.loadUsers();
    this.loadRoles();
  }


  loadUsers() {
    this.userService.getAllUsers().subscribe(
      (results) => {
        this.users = results;
        this.cdr.detectChanges();
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load users. Please try again later.',
          confirmButtonColor: '#d33'
        });
      }
    );
  }

  loadRoles() {
    this.userService.getAllRoles().subscribe(
      (results: any) => {
        this.roles = results as any[];
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load roles. Please try again later.',
          confirmButtonColor: '#d33'
        });
      }
    );
  }

  get filteredUsers() {
    if (!this.users || !Array.isArray(this.users)) {
      return [];
    }
    return this.users.filter(user =>
      (user.name ? user.name.toLowerCase() : '').includes(this.searchText.toLowerCase()) ||
      (user.email ? user.email.toLowerCase() : '').includes(this.searchText.toLowerCase()) ||
      (user.role ? user.role.toLowerCase() : '').includes(this.searchText.toLowerCase())
    );
  }

  openModal(user?: any) {
    if (user) {
      // Edit mode: pre-fill user data and make email read-only
      this.user = { ...user, updatedBy: this.currentUser.id };
      this.editIndex = this.users.findIndex(u => u.id === user.id);
    } else {
      // Add mode: reset form
      this.user = {
        role: '',
        user_role_name: '',
        district: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        updatedBy: this.currentUser.role,
        status: '1'
      };
      this.editIndex = null;
    }

    this.modalRef = this.modalService.open(this.userModal, { centered: true });
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    }
    this.resetForm();
  }

  onSubmit(myForm: NgForm) {
    if (myForm.valid) {
      if (this.editIndex !== null) {
        // Edit user
        this.user.updated_at = new Date(); // Set the current date
        this.user.updatedBy = this.currentUser.role; // Set updatedBy to current user's ID
        console.log(this.user.updatedBy);
        this.userService.updateUser(this.user.id, this.user).subscribe(
          () => {
            this.showSuccessAlert('User updated successfully!');
            this.loadUsers(); // Refresh user list
            this.closeModal();
          },
          (error) => {
            this.handleErrorResponse(error);
          }
        );
      } else {
        // Add user
        if (this.user.password !== this.user.confirmPassword) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Passwords do not match.',
            confirmButtonColor: '#d33'
          });
          return;
        }

        // Ensure user_role_name and createdBy are included in the request
        const newUser = {
          ...this.user,
          user_role_name: this.user.user_role_name,
          createdBy: this.currentUser.role // Set createdBy to current user's ID
        };

        //console.log('Sending data to backend:', newUser); // Debug: Log the data being sent to the backend

        this.userService.createUser(newUser).subscribe(
          (response) => {
            this.showSuccessAlert('User added successfully!');
            this.loadUsers(); // Refresh user list
            this.closeModal();
          },
          (error) => {
            this.handleErrorResponse(error);
          }
        );
      }
    }
  }




  editUser(user: any) {
    this.openModal(user); // Open the modal with the user data
  }

  deleteUser(userId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this user!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(userId).subscribe(
          () => {
            this.showSuccessAlert('User deleted successfully!');
            this.loadUsers(); // Refresh user list
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete user. Please try again later.',
              confirmButtonColor: '#d33'
            });
          }
        );
      }
    });
  }

  toggleStatus(user: any) {
    const newStatus = user.status === '1' ? '0' : '1';

    // Send request to update user status
    this.userService.toggleUserStatus(user.id, { status: newStatus, updatedBy: this.currentUser.id }).subscribe(
      () => {
        this.showSuccessAlert(`User status changed to ${newStatus === '1' ? 'Active' : 'Inactive'}`);
        this.loadUsers(); // Refresh user list to show updated status
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update user status. Please try again later.',
          confirmButtonColor: '#d33'
        });
      }
    );
  }

  resetForm() {
    this.user = {
      role: '',
      user_role_name: '',
      district: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      updatedBy: '',
      status: '1'
    };
    this.editIndex = null;
  }

  showSuccessAlert(message: string) {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6',
    });
  }

  handleErrorResponse(error: any) {
    if (error.error && error.error.error === 'Email already registered') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'This email is already registered. Please use a different email.',
        confirmButtonColor: '#d33'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to process the request. Please try again later.',
        confirmButtonColor: '#d33'
      });
    }
  }
}

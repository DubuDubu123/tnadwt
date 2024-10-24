import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { NgForm } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { CityService } from 'src/app/services/city.service'; // Import the City Service

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
})
export class CityComponent implements OnInit {
  @ViewChild('formModal') formModal: any;
  modalRef: NgbModalRef | undefined;
  searchText: string = '';
  cityModel: any = { city_name: '', district_name: '', status: 1 }; // Default status set to 1 (Active)
  editIndex: number | null = null;
  districts: any[] = []; // Hold district data fetched from backend
  cities: any[] = [];
  page: number = 1;

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private cityService: CityService // Inject City Service
  ) {}

  ngOnInit(): void {
    this.loadCities();
    this.loadDistricts(); // Load districts from backend
  }

  loadCities() {
    this.cityService.getAllCities().subscribe(
      (data) => {
        this.cities = data;
        this.refreshTable();
      },
      (error) => {
        Swal.fire('Error', 'Failed to load cities. Please try again later.', 'error');
      }
    );
  }

  loadDistricts() {
    this.cityService.getAllDistricts().subscribe(
      (data) => {
        this.districts = data; // Assign the fetched districts to the dropdown
      },
      (error) => {
        Swal.fire('Error', 'Failed to load districts. Please try again later.', 'error');
      }
    );
  }

  openModal() {
    this.modalRef = this.modalService.open(this.formModal, { centered: true });
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    }
    this.resetForm();
  }

  resetForm() {
    this.cityModel = { city_name: '', district_name: '', status: 1 }; // Default status is set to 1 (Active)
    this.editIndex = null;
  }

  // Form Submission with Validation
  submitForm(myForm: NgForm) {
    if (myForm.valid) {
      if (this.editIndex !== null) {
        // Update existing city
        const id = this.cities[this.editIndex].id;
        this.cityService.updateCity(id, this.cityModel).subscribe(
          () => {
            Swal.fire('Updated!', 'City updated successfully!', 'success');
            this.loadCities();
            this.closeModal();
          },
          (error) => {
            if (error.status === 400 && error.error.error === 'City already exists in this district') {
              Swal.fire('Error', 'This city already exists in this district. Please try a different city name.', 'error');
            } else {
              Swal.fire('Error', 'Failed to update city. Please try again later.', 'error');
            }
          }
        );
      } else {
        // Add new city
        this.cityService.addCity(this.cityModel).subscribe(
          () => {
            Swal.fire('Added!', 'City added successfully!', 'success');
            this.loadCities();
            this.closeModal();
          },
          (error) => {
            if (error.status === 400 && error.error.error === 'City already exists in this district') {
              Swal.fire('Error', 'This city already exists in this district. Please try a different city name.', 'error');
            } else {
              Swal.fire('Error', 'Failed to add city. Please try again later.', 'error');
            }
          }
        );
      }
      this.resetForm();
    } else {
      Swal.fire('Error!', 'Please fill in all required fields!', 'error');
      // Mark all fields as touched to show validation errors
      Object.keys(myForm.controls).forEach((field) => {
        const control = myForm.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
    }
  }

  // Confirm Delete with SweetAlert
  confirmDelete(index: number) {
    const id = this.cities[index].id;
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the city!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cityService.deleteCity(id).subscribe(
          () => {
            Swal.fire('Deleted!', 'City has been deleted.', 'success');
            this.loadCities();
          },
          (error) => {
            Swal.fire('Error', 'Failed to delete city. Please try again later.', 'error');
          }
        );
      }
    });
  }

// Confirm Toggle Status with SweetAlert
confirmToggleStatus(city: any) {
  const newStatus = city.status === 1 ? 0 : 1; // Toggle between 1 (Active) and 0 (Inactive)
  Swal.fire({
    title: `Are you sure you want to set this city to ${newStatus === 1 ? 'Active' : 'Inactive'}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, proceed!',
    cancelButtonText: 'No, cancel!',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
  }).then((result) => {
    if (result.isConfirmed) {
      this.cityService.toggleCityStatus(city.id.toString(), newStatus.toString()).subscribe(
        () => {
          Swal.fire('Updated!', `City status changed to ${newStatus === 1 ? 'Active' : 'Inactive'}.`, 'success');
          this.loadCities();
        },
        (error) => {
          Swal.fire('Error', 'Failed to update status. Please try again later.', 'error');
        }
      );
    }
  });
}


  // Edit city (open modal with pre-filled values)
  editCity(city: any, index: number) {
    this.cityModel = { ...city }; // Pre-fill the form with the selected city data
    this.editIndex = index;
    this.openModal();
  }

  // Remove city from the list
  removeCity(index: number) {
    this.cities.splice(index, 1);
    this.refreshTable();
  }

  // Filter cities by search text
  filteredCities() {
    return this.cities.filter((city) =>
      city.city_name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      city.district_name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // Refresh the table to trigger change detection
  refreshTable() {
    this.cities = [...this.cities]; // Reassign the array reference to trigger Angular's change detection
    this.cdr.detectChanges(); // Manually trigger Angular's change detection
  }
}

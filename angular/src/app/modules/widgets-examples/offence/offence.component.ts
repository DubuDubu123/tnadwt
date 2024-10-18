import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { NgForm } from '@angular/forms';
import { OffenceService } from 'src/app/services/offence.service'; // Import your service

@Component({
  selector: 'app-offence',
  templateUrl: './offence.component.html',
})
export class OffenceComponent implements OnInit {
  @ViewChild('formModal') formModal: any;
  modalRef: NgbModalRef | undefined;
  searchText: string = '';
  offenceModel: any = { offence_name: '', status: 1 }; // Updated to match correct property name
  offences: any[] = []; // Offence list will be loaded from backend
  page: number = 1;
  editIndex: number | null = null; // Track if we're editing an offence

  constructor(
    private modalService: NgbModal,
    private offenceService: OffenceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOffences(); // Load offences when component is initialized
  }

  // Load offences from the backend
  loadOffences(): void {
    this.offenceService.getAllOffences().subscribe(
      (data) => {
        this.offences = data;
        this.refreshTable(); // Refresh the table to reflect data changes
      },
      (error) => {
        Swal.fire('Error', 'Failed to load offences. Please try again later.', 'error');
      }
    );
  }

  // Open Modal for Adding or Editing an Offence
  openModal() {
    this.modalRef = this.modalService.open(this.formModal, { centered: true });
  }

  // Close the Modal
  closeModal() {
    if (this.modalRef) {
      this.modalRef.close(); // Close the modal
    }
    this.resetForm(); // Reset form after closing
  }

  // Reset the form and editing state
  resetForm() {
    this.offenceModel = { offence_name: '', status: 1 }; // Updated to correct property name
    this.editIndex = null; // Reset edit index after closing
  }

  // Submit the form data (Add/Edit Offence)

  submitForm(myForm: NgForm) {
    if (myForm.valid) {
      if (this.editIndex !== null) {
        // Editing an existing offence
        const id = this.offences[this.editIndex].id;
        this.offenceService.updateOffence(id, this.offenceModel).subscribe(
          () => {
            Swal.fire('Updated!', 'Offence updated successfully!', 'success');
            this.loadOffences(); // Reload the offences to reflect the changes
            this.closeModal();
          },
          (error) => {
            if (error.status === 400 && error.error.error === 'This offence already exists.') {
              Swal.fire('Error', 'This offence already exists. Please enter a different name.', 'error');
            } else {
              Swal.fire('Error', 'Failed to update offence. Please try again later.', 'error');
            }
          }
        );
      } else {
        // Add new offence
        this.offenceService.addOffence(this.offenceModel).subscribe(
          () => {
            Swal.fire('Added!', 'Offence added successfully!', 'success');
            this.loadOffences(); // Reload the offences to reflect the new addition
            this.closeModal();
          },
          (error) => {
            if (error.status === 400 && error.error.error === 'This offence already exists.') {
              Swal.fire('Error', 'This offence already exists. Please enter a different name.', 'error');
            } else {
              Swal.fire('Error', 'Failed to add offence. Please try again later.', 'error');
            }
          }
        );
      }
    } else {
      // If form is invalid, show error messages
      Object.keys(myForm.controls).forEach((field) => {
        const control = myForm.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
    }
  }

  // Confirm delete action with SweetAlert
  confirmDelete(index: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this offence!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.removeOffence(index);
      }
    });
  }

  // Confirm status toggle action with SweetAlert
  confirmToggleStatus(offence: any) {
    const newStatus = offence.status === 1 ? 0 : 1;
    Swal.fire({
      title: `Are you sure you want to set this offence to ${newStatus === 1 ? 'Active' : 'Inactive'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        this.toggleStatus(offence);
      }
    });
  }

  // Toggle the status between Active and Inactive
  toggleStatus(offence: any) {
    offence.status = offence.status === 1 ? 0 : 1;
    this.offenceService.updateOffence(offence.id, offence).subscribe(
      () => {
        this.showSuccessAlert(`Offence status changed to ${offence.status === 1 ? 'Active' : 'Inactive'}!`);
        this.refreshTable(); // Refresh the table to show updated status
      },
      (error) => {
        Swal.fire('Error', 'Failed to update status. Please try again later.', 'error');
      }
    );
  }

  // Edit offence (Open modal with pre-filled values)
  editOffence(offence: any, index: number) {
    this.offenceModel = { ...offence }; // Pre-fill the form with the selected offence
    this.editIndex = index; // Track the index of the offence being edited
    this.openModal();
  }

  // Remove an offence from the list
  removeOffence(index: number) {
    const id = this.offences[index].id;
    this.offenceService.deleteOffence(id).subscribe(
      () => {
        Swal.fire('Deleted!', 'Offence has been deleted.', 'success');
        this.loadOffences(); // Reload offences to reflect deletion
      },
      (error) => {
        Swal.fire('Error', 'Failed to delete offence. Please try again later.', 'error');
      }
    );
  }

  // Filter the offences based on search text
  filteredOffences() {
    return this.offences.filter((offence) =>
      offence.offence_name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // Show success SweetAlert modal
  showSuccessAlert(message: string) {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6',
    });
  }

  // Refresh the table after any change
  refreshTable() {
    this.cdr.detectChanges();
  }
}

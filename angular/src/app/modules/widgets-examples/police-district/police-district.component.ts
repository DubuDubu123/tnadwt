import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { PoliceDivisionService } from 'src/app/services/police-division.service';

@Component({
  selector: 'app-police-district',
  templateUrl: './police-district.component.html',
})
export class PoliceDistrictComponent implements OnInit {
  @ViewChild('formModal') formModal: any;
  modalRef: NgbModalRef | undefined;
  searchText: string = '';
  districtModel: any = { district_division_name: '', police_range_name: '', police_zone_name: '', status: 1 };
  districts: string[] = []; // District names for dropdown
  policeDivisions: any[] = []; // Police division list
  page: number = 1;
  editIndex: number | null = null;

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private policeDivisionService: PoliceDivisionService // Corrected Service Reference
  ) {}

  ngOnInit(): void {
    this.loadPoliceDivisions();
    this.loadDistricts();
  }

  loadPoliceDivisions(): void {
    this.policeDivisionService.getAllPoliceDivisions().subscribe(
      (data: any) => {
        this.policeDivisions = data;
        this.refreshTable();
      },
      (error: any) => {
        Swal.fire('Error', 'Failed to load police divisions. Please try again later.', 'error');
      }
    );
  }

  loadDistricts(): void {
    this.policeDivisionService.getAllDistricts().subscribe(
      (data: any) => {
        this.districts = data.map((district: any) => district.district_name);
      },
      (error: any) => {
        Swal.fire('Error', 'Failed to load districts. Please try again later.', 'error');
      }
    );
  }

  openModal(): void {
    this.modalRef = this.modalService.open(this.formModal, { centered: true });
  }

  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.close();
    }
    this.resetForm();
  }

  resetForm(): void {
    this.districtModel = { district_division_name: '', police_range_name: '', police_zone_name: '', status: 1 };
    this.editIndex = null;
  }

  submitForm(myForm: any): void {
    if (myForm.valid) {
      if (this.editIndex !== null) {
        const id = this.policeDivisions[this.editIndex].id;
        this.policeDivisionService.updatePoliceDivision(id, this.districtModel).subscribe(
          () => {
            Swal.fire('Updated!', 'Police division updated successfully!', 'success');
            this.loadPoliceDivisions();
            this.closeModal();
          },
          (error: any) => {
            if (error.status === 400 && error.error.error === 'This district division already exists with the same range and zone.') {
              Swal.fire('Error', 'This district division already exists with the same range and zone. Please enter different details.', 'error');
            } else {
              Swal.fire('Error', 'Failed to update the police division. Please try again later.', 'error');
            }
          }
        );
      } else {
        // Add new police division
        this.policeDivisionService.addPoliceDivision(this.districtModel).subscribe(
          () => {
            Swal.fire('Added!', 'Police division added successfully!', 'success');
            this.loadPoliceDivisions();
            this.closeModal();
          },
          (error: any) => {
            if (error.status === 400 && error.error.error === 'This district division already exists with the same range and zone.') {
              Swal.fire('Error', 'This district division already exists with the same range and zone. Please enter different details.', 'error');
            } else {
              Swal.fire('Error', 'Failed to add police division. Please try again later.', 'error');
            }
          }
        );
      }
      this.resetForm();
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(myForm.controls).forEach((field) => {
        const control = myForm.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
    }
  }

  confirmDelete(index: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to delete this police division? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.removeDivision(index);
      }
    });
  }

  removeDivision(index: number): void {
    const id = this.policeDivisions[index].id;
    this.policeDivisionService.deletePoliceDivision(id).subscribe(
      () => {
        this.policeDivisions.splice(index, 1);
        Swal.fire('Deleted!', 'Police division deleted successfully!', 'success');
        this.refreshTable();
      },
      (error: any) => {
        Swal.fire('Error', 'Failed to delete police division. Please try again later.', 'error');
      }
    );
  }

  toggleStatus(division: any): void {
    const newStatus = division.status === 1 ? 0 : 1;
    Swal.fire({
      title: `Are you sure you want to set this police division to ${newStatus === 1 ? 'Active' : 'Inactive'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedDivision = {
          ...division,
          status: newStatus,
        };
        this.policeDivisionService.updatePoliceDivision(division.id, updatedDivision).subscribe(
          () => {
            division.status = newStatus;
            Swal.fire('Updated!', `Police division status changed to ${newStatus === 1 ? 'Active' : 'Inactive'}!`, 'success');
            this.refreshTable();
          },
          (error: any) => {
            Swal.fire('Error', 'Failed to update status. Please try again later.', 'error');
          }
        );
      }
    });
  }

  editDivision(division: any, index: number): void {
    this.districtModel = { ...division };
    this.editIndex = index;
    this.openModal();
  }

  filteredDistricts(): any[] {
    return this.policeDivisions.filter(division =>
      division.district_division_name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      division.police_range_name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      division.police_zone_name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  refreshTable(): void {
    this.policeDivisions = [...this.policeDivisions];
    this.cdr.detectChanges();
  }
}

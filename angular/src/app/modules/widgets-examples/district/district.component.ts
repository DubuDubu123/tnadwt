import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';
import { DistrictService } from 'src/app/services/district.service'; // Import the District Service

@Component({
  selector: 'app-district',
  templateUrl: './district.component.html',
})
export class DistrictComponent implements OnInit {
  @ViewChild('formModal') formModal: any;
  modalRef: NgbModalRef | undefined;
  searchText: string = '';
  districtModel: any = { district_name: '', status: 1 };
  districts: any[] = [];
  page: number = 1;
  editIndex: number | null = null;

  // Add tamilNaduDistricts array to store Tamil Nadu district names
  tamilNaduDistricts: string[] = [
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


  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private districtService: DistrictService // Inject the District Service
  ) {}

  ngOnInit(): void {
    this.loadDistricts();
  }

  loadDistricts() {
    this.districtService.getAllDistricts().subscribe(
      (data) => {
        this.districts = data;
        this.refreshTable();
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
    this.districtModel = { district_name: '', status: 1 };
    this.editIndex = null;
  }

  submitForm() {
    if (this.districtModel.district_name) {
      if (this.editIndex !== null) {
        // Edit existing district
        const id = this.districts[this.editIndex].id;
        this.districtService.updateDistrict(id, this.districtModel).subscribe(
          () => {
            Swal.fire('Updated!', 'District updated successfully!', 'success');
            this.loadDistricts();
            this.closeModal();
          },
          (error) => {
            if (error.status === 400 && error.error.error === 'District already exists') {
              Swal.fire('Error', 'This district already exists. Please try a different district name.', 'error');
            } else {
              Swal.fire('Error', 'Failed to update district. Please try again later.', 'error');
            }
          }
        );
      } else {
        // Add new district
        this.districtService.addDistrict(this.districtModel).subscribe(
          () => {
            Swal.fire('Added!', 'District added successfully!', 'success');
            this.loadDistricts();
            this.closeModal();
          },
          (error) => {
            if (error.status === 400 && error.error.error === 'District already exists') {
              Swal.fire('Error', 'This district already exists. Please try a different district name.', 'error');
            } else {
              Swal.fire('Error', 'Failed to add district. Please try again later.', 'error');
            }
          }
        );
      }
      this.resetForm();
    }
  }

  confirmDelete(index: number) {
    const id = this.districts[index].id;
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the district!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.districtService.deleteDistrict(id).subscribe(
          () => {
            Swal.fire('Deleted!', 'District has been deleted.', 'success');
            this.loadDistricts();
          },
          (error) => {
            Swal.fire('Error', 'Failed to delete district. Please try again later.', 'error');
          }
        );
      }
    });
  }

  confirmToggleStatus(district: any) {
    const newStatus = district.status === 1 ? '0' : '1';
    Swal.fire({
      title: `Are you sure you want to set this district to ${newStatus === '1' ? 'Active' : 'Inactive'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        this.districtService.toggleDistrictStatus(district.id, newStatus).subscribe(
          () => {
            Swal.fire('Updated!', `District status changed to ${newStatus === '1' ? 'Active' : 'Inactive'}.`, 'success');
            this.loadDistricts();
          },
          (error) => {
            Swal.fire('Error', 'Failed to update status. Please try again later.', 'error');
          }
        );
      }
    });
  }

  editDistrict(district: any, index: number) {
    this.districtModel = { ...district }; // Pre-fill the form with the selected district data
    this.editIndex = index; // Store the index of the district being edited
    this.openModal();
  }

  filteredDistricts() {
    return this.districts.filter(district =>
      district.district_name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  refreshTable() {
    this.districts = [...this.districts]; // Create a new reference to trigger change detection
    this.cdr.detectChanges(); // Manually trigger change detection
  }
}

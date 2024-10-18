import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { NgForm } from '@angular/forms';
import { CasteCommunityService } from 'src/app/services/caste-community.service';

@Component({
  selector: 'app-caste-and-community',
  templateUrl: './caste-and-community.component.html',
})
export class CasteAndCommunityComponent implements OnInit {
  @ViewChild('formModal') formModal: any;
  modalRef: NgbModalRef | undefined;
  searchText: string = '';
  casteModel: any = { caste_name: '', community_name: '', status: 1 };
  castes: any[] = [];
  editIndex: number | null = null;
  page: number = 1;

  constructor(
    private modalService: NgbModal,
    private casteCommunityService: CasteCommunityService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCastes();
  }

  loadCastes(): void {
    this.casteCommunityService.getAllCastes().subscribe(
      (data) => {
        this.castes = data;
        this.refreshTable();
      },
      (error) => {
        Swal.fire('Error', 'Failed to load castes. Please try again later.', 'error');
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
    this.casteModel = { caste_name: '', community_name: '', status: 1 };
    this.editIndex = null;
  }

  submitForm(myForm: NgForm) {
    if (myForm.valid) {
      if (this.editIndex !== null) {
        const id = this.castes[this.editIndex].id;
        this.casteCommunityService.updateCaste(id, this.casteModel).subscribe(
          (response) => {
            Swal.fire('Updated!', response.message, 'success');
            this.loadCastes();
            this.closeModal();
          },
          (error) => {
            Swal.fire('Error', 'Failed to update caste. Please try again later.', 'error');
          }
        );
      } else {
        this.casteCommunityService.addCaste(this.casteModel).subscribe(
          (response) => {
            Swal.fire('Added!', response.message, 'success');
            this.loadCastes();
            this.closeModal();
          },
          (error) => {
            Swal.fire('Error', 'Failed to add caste. Please try again later.', 'error');
          }
        );
      }
    } else {
      Swal.fire('Error', 'Please fill in all required fields!', 'error');
    }
  }

  confirmDelete(index: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the Caste and Community!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.removeCaste(index);
      }
    });
  }

  toggleStatus(caste: any) {
    this.casteCommunityService.toggleStatus(caste.id).subscribe(
      (response) => {
        Swal.fire('Updated!', response.message, 'success');
        this.loadCastes();
      },
      (error) => {
        Swal.fire('Error', 'Failed to update status. Please try again later.', 'error');
      }
    );
  }

  editCaste(caste: any, index: number) {
    this.casteModel = { ...caste };
    this.editIndex = index;
    this.openModal();
  }

  removeCaste(index: number) {
    const id = this.castes[index].id;
    this.casteCommunityService.deleteCaste(id).subscribe(
      (response) => {
        Swal.fire('Deleted!', response.message, 'success');
        this.loadCastes();
      },
      (error) => {
        Swal.fire('Error', 'Failed to delete caste. Please try again later.', 'error');
      }
    );
  }

  filteredCastes() {
    return this.castes.filter(caste =>
      caste.caste_name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      caste.community_name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  refreshTable() {
    this.cdr.detectChanges();
  }
}

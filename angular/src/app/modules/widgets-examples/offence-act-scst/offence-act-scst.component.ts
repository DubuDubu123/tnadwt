import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { NgForm } from '@angular/forms';
import { OffenceActService } from 'src/app/services/offence-act.service'; // Import your service

@Component({
  selector: 'app-offence-act-scst',
  templateUrl: './offence-act-scst.component.html',
})
export class OffenceActScStComponent implements OnInit {
  @ViewChild('formModal') formModal: any;
  modalRef: NgbModalRef | undefined;
  searchText: string = '';
  offenceActModel: any = { offence_act_name: '', status: 1 };
  offenceActs: any[] = [];
  page: number = 1;
  editIndex: number | null = null;

  constructor(
    private modalService: NgbModal,
    private offenceActService: OffenceActService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOffenceActs();
  }

  loadOffenceActs(): void {
    this.offenceActService.getAllOffenceActs().subscribe(
      (data) => {
        this.offenceActs = data;
        this.cdr.detectChanges(); // Refresh the table to reflect data changes
      },
      (error) => {
        Swal.fire('Error', 'Failed to load offence acts. Please try again later.', 'error');
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
    this.offenceActModel = { offence_act_name: '', status: 1 };
    this.editIndex = null;
  }

  submitForm(myForm: NgForm) {
    if (myForm.valid) {
      if (this.editIndex !== null) {
        // Editing an existing offence act
        const id = this.offenceActs[this.editIndex].id;
        this.offenceActService.updateOffenceAct(id, this.offenceActModel).subscribe(
          (response) => {
            Swal.fire('Updated!', response.message, 'success');
            this.loadOffenceActs();
            this.closeModal();
          },
          (error) => {
            Swal.fire('Error', 'Failed to update offence act. Please try again later.', 'error');
          }
        );
      } else {
        // Add new offence act
        this.offenceActService.addOffenceAct(this.offenceActModel).subscribe(
          (response) => {
            Swal.fire('Added!', response.message, 'success');
            this.loadOffenceActs();
            this.closeModal();
          },
          (error) => {
            Swal.fire('Error', 'Failed to add offence act. Please try again later.', 'error');
          }
        );
      }
    } else {
      Object.keys(myForm.controls).forEach((field) => {
        const control = myForm.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
    }
  }

  confirmDelete(index: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this offence act!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.removeOffenceAct(index);
      }
    });
  }

  toggleStatus(offenceAct: any) {
    this.offenceActService.toggleStatus(offenceAct.id).subscribe(
      (response) => {
        Swal.fire('Updated!', response.message, 'success');
        this.loadOffenceActs(); // Refresh the table after status update
      },
      (error) => {
        Swal.fire('Error', 'Failed to update status. Please try again later.', 'error');
      }
    );
  }

  editOffenceAct(offenceAct: any, index: number) {
    this.offenceActModel = { ...offenceAct };
    this.editIndex = index;
    this.openModal();
  }

  removeOffenceAct(index: number) {
    const id = this.offenceActs[index].id;
    this.offenceActService.deleteOffenceAct(id).subscribe(
      (response) => {
        Swal.fire('Deleted!', response.message, 'success');
        this.loadOffenceActs(); // Refresh the table after delete
      },
      (error) => {
        Swal.fire('Error', 'Failed to delete offence act. Please try again later.', 'error');
      }
    );
  }

  filteredOffenceActs() {
    return this.offenceActs.filter((offenceAct) =>
      offenceAct.offence_act_name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}

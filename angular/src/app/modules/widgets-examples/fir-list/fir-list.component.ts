import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FirListTestService } from 'src/app/services/fir-list-test.service';
import { ChangeDetectorRef } from '@angular/core'; // Import ChangeDetectorRef

@Component({
  selector: 'app-fir-list',
  templateUrl: './fir-list.component.html',
})
export class FirListComponent implements OnInit {
  searchText: string = ''; // Declare the searchText property
  firList: any[] = []; // FIR list fetched from backend
  page: number = 1;
  isLoading: boolean = true; // Flag to track loading state

  constructor(
    private firService: FirListTestService,
    private cdr: ChangeDetectorRef  // Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFirList();
  }

  loadFirList() {
    this.isLoading = true;  // Start loading state
    this.firService.getFirList().subscribe(
      (data: any[]) => {
        this.firList = data;
        this.isLoading = false; // End loading state
        this.cdr.detectChanges();  // Manually trigger change detection
      },
      (error) => {
        this.isLoading = false;  // End loading state even on error
        Swal.fire('Error', 'Failed to load FIR data', 'error');
      }
    );
  }

  // Function to handle deletion of FIR
  deleteFIR(index: number, firId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.firService.deleteFir(firId).subscribe(
          () => {
            this.firList.splice(index, 1); // Remove FIR from the list after deletion
            Swal.fire('Deleted!', 'The FIR has been deleted.', 'success');
          },
          (error) => {
            Swal.fire('Error', 'Failed to delete FIR', 'error');
          }
        );
      }
    });
  }

  // Open Edit page (dummy example, add your navigation logic here)
  openEditPage(firId: number) {
    console.log(`Opening edit page for FIR ID: ${firId}`);
  }

  // Function to filter the FIR list based on the searchText
  filteredFirList() {
    return this.firList.filter(fir =>
      fir.fir_id.toString().includes(this.searchText.toLowerCase()) ||
      fir.police_city.toLowerCase().includes(this.searchText.toLowerCase()) ||
      fir.police_station.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}

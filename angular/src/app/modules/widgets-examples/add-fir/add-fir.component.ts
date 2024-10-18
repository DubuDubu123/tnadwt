import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FirService } from 'src/app/services/fir.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-fir',
  templateUrl: './add-fir.component.html',
  styleUrls: ['./add-fir.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
})
export class AddFirComponent implements OnInit {
  step: number = 1;
  firForm: FormGroup;
  firId: number | null = null;
  userId: string = '';
  loading: boolean = false;

  // Tabs for step navigation
  tabs = [
    { label: 'Basic Information' },
    { label: 'Offence Information' },
    { label: 'Victim Information' },
    { label: 'Accused Information' },
  ];

  // Dropdown options
  policeCities: string[] = [];
  policeZones: string[] = [];
  policeRanges: string[] = [];
  revenueDistricts: string[] = [];
  offenceOptions: string[] = [];
  offenceActsOptions: string[] = [];
  scstSectionsOptions: string[] = [];
  policeStations: string[] = [];
  alphabetList: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  stationNumbers: number[] = Array.from({ length: 99 }, (_, k) => k + 1);
firNumberOptions: number[] = [];

  constructor(
    private fb: FormBuilder,
    private firService: FirService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadOptions();
    this.loadOffenceActs();
    this.loadScstSections();

    this.userId = sessionStorage.getItem('userId') || '';
    if (this.userId) {
      this.loadUserData();
    }
  }

  // Initialize the form with all fields
  initializeForm() {
    this.firForm = this.fb.group({
      policeCity: ['', Validators.required],
      policeZone: ['', Validators.required],
      policeRange: ['', Validators.required],
      revenueDistrict: ['', Validators.required],
      alphabetSelection: ['', Validators.required],
      stationNumber: ['', Validators.required],
      stationName: ['', Validators.required],
      investigatingOfficers: this.fb.array([this.createOfficerGroup()]),

      firNumber: ['', Validators.required],
      firNumberSuffix: ['', Validators.required],
      dateOfOccurrence: ['', Validators.required],
      timeOfOccurrence: ['', Validators.required],
      placeOfOccurrence: ['', Validators.required],
      dateOfRegistration: ['', Validators.required],
      timeOfRegistration: ['', Validators.required],
      natureOfOffence: [[], Validators.required],
      sectionsIPC: ['', Validators.required],
      scstSections: [[]],

      complainantDetails: this.fb.group({
        nameOfComplainant: ['', Validators.required],
        mobileNumberOfComplainant: ['', Validators.required],
        isVictimSameAsComplainant: [false],
        numberOfVictims: [1, Validators.required],
      }),
      victims: this.fb.array([]), // Initialize as empty

      numberOfAccused: [1, Validators.required],
      accuseds: this.fb.array([]), // Initialize as empty
    });

    this.onNumberOfVictimsChange();
    this.onNumberOfAccusedChange();
  }

  // Create FormGroup for Investigating Officer
  createOfficerGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      designation: ['', Validators.required],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
      ],
    });
  }

  // Dropdown and option loading methods
  loadOptions() {
    this.firService.getOffences().subscribe(
      (offences: any) => {
        this.offenceOptions = offences.map((offence: any) => offence.offence_name);
      },
      (error: any) => {
        Swal.fire('Error', 'Failed to load offence options.', 'error');
      }
    );
  }

  loadOffenceActs() {
    this.firService.getOffenceActs().subscribe(
      (acts: any) => {
        this.offenceActsOptions = acts.map((act: any) => act.offence_act_name);
      },
      (error: any) => {
        Swal.fire('Error', 'Failed to load offence acts options.', 'error');
      }
    );
  }

  loadScstSections() {
    this.firService.getCastes().subscribe(
      (sections: any) => {
        this.scstSectionsOptions = sections.map((section: any) => section.caste_name);
      },
      (error: any) => {
        Swal.fire('Error', 'Failed to load SC/ST sections options.', 'error');
      }
    );
  }

  loadUserData() {
    this.firService.getUserDetails(this.userId).subscribe(
      (user: any) => {
        if (user && user.district) {
          const district = user.district;
          this.firForm.patchValue({ policeCity: district });
          this.loadPoliceDivisionDetails(district);
        }
      },
      (error: any) => {
        Swal.fire('Error', 'Failed to load user details.', 'error');
      }
    );
  }

  loadPoliceDivisionDetails(district: string) {
    this.firService.getPoliceDivision(district).subscribe(
      (data: any) => {
        this.policeCities = [district];
        this.policeZones = data.map((item: any) => item.police_zone_name);
        this.policeRanges = data.map((item: any) => item.police_range_name);
        this.revenueDistricts = data.map((item: any) => item.district_division_name);
        this.firForm.patchValue({
          policeZone: this.policeZones[0] || '',
          policeRange: this.policeRanges[0] || '',
          revenueDistrict: this.revenueDistricts[0] || '',
        });
      },
      (error: any) => {
        Swal.fire('Error', 'Failed to load division details.', 'error');
      }
    );
  }

  // Investigating Officers Management
  get investigatingOfficers(): FormArray {
    return this.firForm.get('investigatingOfficers') as FormArray;
  }

  addOfficer() {
    this.investigatingOfficers.push(this.createOfficerGroup());
  }

  removeOfficer(index: number) {
    if (this.investigatingOfficers.length > 1) {
      this.investigatingOfficers.removeAt(index);
    }
  }

  // Victim Information Methods
  get victims(): FormArray {
    return this.firForm.get('victims') as FormArray;
  }

  onNumberOfVictimsChange() {
    this.loading = true; // Start loading
    this.cdr.detectChanges(); // Trigger change detection

    const numberOfVictims = this.firForm.get('complainantDetails.numberOfVictims')?.value || 1;

    setTimeout(() => {
      while (this.victims.length !== 0) {
        this.victims.removeAt(0); // Remove any existing victim entries
      }

      for (let i = 0; i < numberOfVictims; i++) {
        this.victims.push(this.createVictim());
      }

      this.loading = false; // Stop loading after 1 second
      this.cdr.detectChanges(); // Ensure UI is updated
    }, 1000); // Simulate 1-second delay
  }

  createVictim(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      age: ['', Validators.required],
      gender: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      address: ['', Validators.required],
      community: ['', Validators.required],
      caste: ['', Validators.required],
      guardianName: ['', Validators.required],
      isNativeDistrictSame: [false],
      nativeDistrict: ['', Validators.required],
      offenceCommitted: ['', Validators.required],
      isDeceased: [false],
      deceasedPersonName: ['']
    });
  }

  // Accused Information Methods
  get accuseds(): FormArray {
    return this.firForm.get('accuseds') as FormArray;
  }

  onNumberOfAccusedChange() {
    this.loading = true; // Start loading
    this.cdr.detectChanges(); // Trigger change detection

    const numberOfAccused = this.firForm.get('numberOfAccused')?.value || 1;

    setTimeout(() => {
      while (this.accuseds.length !== 0) {
        this.accuseds.removeAt(0); // Remove any existing accused entries
      }

      for (let i = 0; i < numberOfAccused; i++) {
        this.accuseds.push(this.createAccusedGroup());
      }

      this.loading = false; // Stop loading after 1 second
      this.cdr.detectChanges(); // Ensure UI is updated
    }, 1000); // Simulate 1-second delay
  }

  createAccusedGroup(): FormGroup {
    return this.fb.group({
      age: ['', Validators.required],
      name: ['', Validators.required],
      gender: ['', Validators.required],
      address: [''],
      community: ['', Validators.required],
      caste: ['', Validators.required],
      guardianName: ['', Validators.required],
      isArrested: [false],
      reasonForNonArrest: [''],
      previousIncident: [false],
      previousFIRNumber: [''],
      previousFIRNumberSuffix: [''],
      scstOffence: [false],
      scstFIRNumber: [''],
      scstFIRNumberSuffix: [''],
      uploadFIRCopy: ['', Validators.required],
      uploadAlterationCopy: ['', Validators.required],
    });
  }

  // Handle City Change
  onCityChange(event: any) {
    const selectedCity = event.target.value;
    if (selectedCity) {
      this.loadPoliceDivisionDetails(selectedCity);
    }
  }

  // Save as Draft or Insert FIR
  saveAsDraft() {
    this.saveFir('draft');
  }

  saveFir(type: string) {
    if (this.firForm.invalid && type === 'manual') {
      Swal.fire('Error', 'Please fill in all required fields.', 'error');
      return;
    }

    const firData = {
      ...this.firForm.value,
      status: type === 'draft' ? 0 : this.step,
      investigatingOfficers: this.investigatingOfficers.value,
    };

    if (!this.firId) {
      this.createFir(firData);
    } else {
      this.updateFir(firData);
    }
  }

  createFir(firData: any) {
    this.firService.submitFir(firData).subscribe(
      (response: any) => {
        this.firId = response.fir_id;
        if (this.firId !== null) {
          sessionStorage.setItem('firId', this.firId.toString());
        }
        Swal.fire('Success', 'FIR Draft Saved Successfully.', 'success');
        this.nextStep();
      },
      (error: any) => {
        Swal.fire('Error', 'Failed to save FIR Draft.', 'error');
      }
    );
  }

  updateFir(firData: any) {
    this.firService.updateFir(this.firId!, firData).subscribe(
      (response: any) => {
        Swal.fire('Success', 'FIR Updated Successfully.', 'success');
        this.nextStep();
      },
      (error: any) => {
        Swal.fire('Error', 'Failed to update FIR.', 'error');
      }
    );
  }

  onSubmit() {
    if (this.step === 1 || this.step === 2) {
      this.saveFir('manual');
    } else {
      Swal.fire('Info', `Step ${this.step} is a static form, no insertion.`, 'info');
      this.nextStep();
    }
  }

  nextStep() {
    if (this.step < this.tabs.length) {
      this.step++;
    }
  }

  previousStep() {
    if (this.step > 1) {
      this.step--;
    }
  }

  setStep(stepNumber: number) {
    this.step = stepNumber;
  }

  onIsDeceasedChange(index: number) {
    const victim = this.victims.at(index);
    if (!victim.get('isDeceased')?.value) {
      victim.get('deceasedPersonName')?.reset();
    }
  }

  onIsArrestedChange(index: number) {
    const accused = this.accuseds.at(index);
    if (accused.get('isArrested')?.value) {
      accused.get('reasonForNonArrest')?.reset();
    }
  }
}

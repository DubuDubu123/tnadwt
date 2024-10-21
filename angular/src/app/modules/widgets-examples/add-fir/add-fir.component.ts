import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef,AfterViewInit } from '@angular/core';

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

import Tagify from '@yaireo/tagify';

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
  yearOptions: number[] = [];
  today: string = '';


  // Tabs for step navigation
  tabs = [
    { label: 'Basic Information' },
    { label: 'Offence Information' },
    { label: 'Victim Information' },
    { label: 'Accused Information' },
  ];

  @ViewChild('tagifyInput') tagifyInput!: ElementRef;
  tagify!: Tagify; // Correctly typed Tagify instance
  sectionsIPC: string[] = []; // Array to store multiple tags


  // Dropdown options
  policeCities: string[] = [];
  policeZones: string[] = [];
  policeRanges: string[] = [];
  revenueDistricts: string[] = [];
  offenceOptions: string[] = [];
  offenceActsOptions: string[] = [];
  scstSectionsOptions: string[] = [];
  alphabetList: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  stationNumbers: number[] = Array.from({ length: 99 }, (_, k) => k + 1);
  firNumberOptions: number[] = Array.from({ length: 99 }, (_, k) => k + 1);
  policeStations: string[] = [];
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
    this.generateYearOptions();
    this.loadnativedistrict()
    this.userId = sessionStorage.getItem('userId') || '';
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];
    if (this.userId) {
      this.loadUserData();
    }
    this.initializeTagify();

  }

  initializeTagify(): void {
    if (this.tagifyInput?.nativeElement) {
      this.tagify = new Tagify(this.tagifyInput.nativeElement, {
        maxTags: 10,
        enforceWhitelist: false,
        delimiters: ', ',
        dropdown: { enabled: 0 }
      });

      // Listen for 'add' event to update sectionsIPC array
      this.tagify.on('add', (e: any) => {
        this.sectionsIPC.push(e.detail.data.value);
        this.updateSectionsIPCControl();
      });

      // Listen for 'remove' event to update sectionsIPC array
      this.tagify.on('remove', (e: any) => {
        const removedTag = e.detail.data.value;
        this.sectionsIPC = this.sectionsIPC.filter(tag => tag !== removedTag);
        this.updateSectionsIPCControl();
      });
    }
  }



  // Update the FormControl for sectionsIPC
  updateSectionsIPCControl(): void {
    this.firForm.get('sectionsIPC')?.setValue(this.sectionsIPC.join(', '));
  }
  onVictimAgeChange(index: number): void {
    const victimGroup = this.victims.at(index) as FormGroup;
    const ageControl = victimGroup.get('age');
    const nameControl = victimGroup.get('name');

    if (ageControl) {
      const ageValue = ageControl.value;

      // If age is below 18, disable the name field
      if (ageValue < 18) {
        nameControl?.disable({ emitEvent: false });
        nameControl?.reset();
      } else {
        nameControl?.enable({ emitEvent: false });
      }

      this.cdr.detectChanges(); // Trigger change detection
    }
  }


  onAccusedAgeChange(index: number): void {
    const accusedGroup = this.accuseds.at(index) as FormGroup;
    const ageControl = accusedGroup.get('age');
    const nameControl = accusedGroup.get('name');

    if (ageControl) {
      const ageValue = ageControl.value;

      // If age is below 18, disable the name field
      if (ageValue < 18) {
        nameControl?.disable({ emitEvent: false });
        nameControl?.reset();
      } else {
        nameControl?.enable({ emitEvent: false });
      }

      this.cdr.detectChanges(); // Trigger change detection
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

      dateOfOccurrence: ['', [Validators.required, this.maxDateValidator()]],
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
      victims: this.fb.array([this.createVictimGroup()]), // Initialize as empty

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

  ngAfterViewInit(): void {
    // Initialize Tagify after the view is fully initialized
    this.initializeTagify();
  }
  // Validator to restrict future dates
maxDateValidator() {
  return (control: any) => {
    const selectedDate = new Date(control.value);
    const currentDate = new Date();
    if (selectedDate > currentDate) {
      return { maxDate: true };
    }
    return null;
  };
}


  createVictimGroup(): FormGroup {
    return this.fb.group({
      age: ['', Validators.required],
      name: [{ value: '', disabled: false }, Validators.required],
      gender: ['', Validators.required],
      mobileNumber: [''],
      address: [''],
      community: ['', Validators.required],
      caste: ['', Validators.required],
      guardianName: ['', Validators.required],
      isNativeDistrictSame: ['', Validators.required],
      nativeDistrict: [''],
      isDeceased: ['', Validators.required],
      deceasedPersonName: [''],
      offenceCommitted: ['', Validators.required],
    });
  }

  onNativeDistrictSameChange(index: number) {
    const victim = this.victims.at(index);
    const isNativeDistrictSame = victim.get('isNativeDistrictSame')?.value;

    if (isNativeDistrictSame === 'yes') {
      // If "Yes", reset and disable the Native District field
      victim.get('nativeDistrict')?.reset();
      victim.get('nativeDistrict')?.clearValidators();
    } else if (isNativeDistrictSame === 'no') {
      // If "No", make Native District field required
      victim.get('nativeDistrict')?.setValidators(Validators.required);
    }

    victim.get('nativeDistrict')?.updateValueAndValidity(); // Update the validation state
  }

  generateYearOptions() {
    const currentYear = new Date().getFullYear();
    const startYear = 1900;

    for (let year = currentYear; year >= startYear; year--) {
      this.yearOptions.push(year); // Populate yearOptions array with years
    }
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

  loadnativedistrict() {
    this.firService.getPoliceRevenue().subscribe(
      (Native: any) => {
        this.policeStations = Native.map((Native: any) => Native.revenue_district_name);
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
        this.victims.push(this.createVictimGroup());
      }

      this.loading = false; // Stop loading after 1 second
      this.cdr.detectChanges(); // Ensure UI is updated
    }, 1000); // Simulate 1-second delay
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
      isArrested: ['', Validators.required],
      reasonForNonArrest: ['', Validators.required],
      previousIncident: [false],
      previousFIRNumber: [''],
      previousFIRNumberSuffix: [''],
      scstOffence: ['', Validators.required],
      scstFIRNumber: [''],
      scstFIRNumberSuffix: [''],
      uploadFIRCopy: ['', Validators.required],
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

    this.updateSectionsIPCControl();

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
    const isDeceased = victim.get('isDeceased')?.value;

    if (isDeceased === 'yes') {
      // If "Yes", make the deceased person's name field required
      victim.get('deceasedPersonName')?.setValidators(Validators.required);
    } else {
      // If "No", reset and clear validators for the deceased person's name field
      victim.get('deceasedPersonName')?.reset();
      victim.get('deceasedPersonName')?.clearValidators();
    }

    victim.get('deceasedPersonName')?.updateValueAndValidity(); // Update the validation state
  }

  onIsArrestedChange(index: number) {
    const accused = this.accuseds.at(index);
    if (accused.get('isArrested')?.value) {
      accused.get('reasonForNonArrest')?.reset();
    }
  }

  onPreviousIncidentsChange(index: number) {
    const accused = this.accuseds.at(index);
    const previousIncident = accused.get('previousIncident')?.value;

    if (previousIncident) {
      // If "Yes", make the previous FIR fields required
      accused.get('previousFIRNumber')?.setValidators(Validators.required);
      accused.get('previousFIRNumberSuffix')?.setValidators(Validators.required);
    } else {
      // If "No", reset and clear validators for the previous FIR fields
      accused.get('previousFIRNumber')?.reset();
      accused.get('previousFIRNumber')?.clearValidators();
      accused.get('previousFIRNumberSuffix')?.reset();
      accused.get('previousFIRNumberSuffix')?.clearValidators();
    }

    accused.get('previousFIRNumber')?.updateValueAndValidity();
    accused.get('previousFIRNumberSuffix')?.updateValueAndValidity();
  }

  onScstOffencesChange(index: number) {
    const accused = this.accuseds.at(index);
    const scstOffence = accused.get('scstOffence')?.value;

    if (scstOffence) {
      // If "Yes", make the SC/ST FIR fields required
      accused.get('scstFIRNumber')?.setValidators(Validators.required);
      accused.get('scstFIRNumberSuffix')?.setValidators(Validators.required);
    } else {
      // If "No", reset and clear validators for the SC/ST FIR fields
      accused.get('scstFIRNumber')?.reset();
      accused.get('scstFIRNumber')?.clearValidators();
      accused.get('scstFIRNumberSuffix')?.reset();
      accused.get('scstFIRNumberSuffix')?.clearValidators();
    }

    accused.get('scstFIRNumber')?.updateValueAndValidity();
    accused.get('scstFIRNumberSuffix')?.updateValueAndValidity();
  }


}

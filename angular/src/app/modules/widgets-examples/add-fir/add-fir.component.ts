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
import { MatRadioModule } from '@angular/material/radio';

import Tagify from '@yaireo/tagify';
declare var $: any;
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
    MatRadioModule,
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
    { label: 'FIR Stage(MRF) Details' },
  ];

  @ViewChild('tagifyInput', { static: false }) tagifyInput!: ElementRef;
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
  selectedAdditionalReliefs: string[] = [];
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
    this.ngAfterViewInit();

  }




  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.tagifyInput && this.tagifyInput.nativeElement) {
        // Initialize the Bootstrap Tags Input after ensuring the element is available
        $(this.tagifyInput.nativeElement).tagsinput({
          maxTags: 10,
          trimValue: true
        });

        // Listen to the 'itemAdded' and 'itemRemoved' events
        $(this.tagifyInput.nativeElement).on('itemAdded', (event: any) => {
          this.sectionsIPC.push(event.item);
          this.updateSectionsIPCControl();
        });

        $(this.tagifyInput.nativeElement).on('itemRemoved', (event: any) => {
          this.sectionsIPC = this.sectionsIPC.filter(tag => tag !== event.item);
          this.updateSectionsIPCControl();
        });
      }
    }, 0); // Add a small delay
  }


  // Update the form control for sectionsIPC
  updateSectionsIPCControl(): void {
    this.firForm.get('sectionsIPC')?.setValue(this.sectionsIPC.join(', '));
  }









  additionalReliefOptions = [
    { value: 'Pension', label: 'Pension' },
    { value: 'Employment / Job', label: 'Employment / Job' },
    { value: 'Education concession', label: 'Education concession' },
    { value: 'Provisions', label: 'Provisions' },
    { value: 'House site Patta', label: 'House site Patta' }
  ];

  onAdditionalReliefChange(event: any): void {
    const value = event.target.value;
    if (event.target.checked) {
      // Add to the selected list if checked
      this.selectedAdditionalReliefs.push(value);
    } else {
      // Remove from the selected list if unchecked
      this.selectedAdditionalReliefs = this.selectedAdditionalReliefs.filter(item => item !== value);
    }

    // Update the form control value
    this.firForm.get('additionalRelief')?.setValue(this.selectedAdditionalReliefs);
  }

  // Handle file selection
  onFileSelect(event: any, index: number) {
    const files = event.target.files;
    const filesArray = Array.from(files); // Convert FileList to an array

    // Update the 'files' form control with the selected files
    this.attachments.at(index).get('files')?.setValue(filesArray);

    // Trigger change detection to update the UI
    this.cdr.detectChanges();
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
        nameOfComplainant: ['', [Validators.required, Validators.pattern('^[A-Za-z\s]*$')]],
        mobileNumberOfComplainant: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        isVictimSameAsComplainant: [false],
        numberOfVictims: [1, Validators.required],
      }),
      victims: this.fb.array([this.createVictimGroup()]), // Initialize as empty

      numberOfAccused: [1, Validators.required],
      accuseds: this.fb.array([]), // Initialize as empty

      communityCertificate: ['', Validators.required],
      victimName: ['', Validators.required],
      reliefAmountScst: ['', Validators.required],
      reliefAmountExGratia: ['', Validators.required],
      reliefAmountFirstStage: ['', Validators.required],
      totalCompensation: ['', Validators.required],
      additionalRelief: ['', Validators.required],
      proceedingsFileNo: ['', Validators.required],
      proceedingsDate: ['', Validators.required],
      proceedingsFile: ['', Validators.required],
      attachments: this.fb.array([]),
    });

    this.onNumberOfVictimsChange();
    this.onNumberOfAccusedChange();
  }

  // Create FormGroup for Investigating Officer
  createOfficerGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.pattern('^[A-Za-z\s]*$')],
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
// Allow only letters for the name input
allowOnlyLetters(event: KeyboardEvent): void {
  const charCode = event.key.charCodeAt(0);
  // Allow only uppercase (A-Z), lowercase (a-z), and space (charCode 32)
  if (
    !(charCode >= 65 && charCode <= 90) && // A-Z
    !(charCode >= 97 && charCode <= 122) && // a-z
    charCode !== 32 // space
  ) {
    event.preventDefault(); // Prevent the character from being entered
  }
}

// Allow only numbers for the mobile number input
allowOnlyNumbers(event: KeyboardEvent): void {
  const charCode = event.key.charCodeAt(0);
  // Allow only numbers (0-9)
  if (charCode < 48 || charCode > 57) {
    event.preventDefault(); // Prevent the character from being entered
  }
}

// Check if the name field is invalid
isNameInvalid(): boolean {
  const nameControl = this.firForm.get('complainantDetails.nameOfComplainant');
  return !!(nameControl && nameControl.invalid && nameControl.touched);
}

isPhoneInvalid(): boolean {
  const phoneControl = this.firForm.get('complainantDetails.mobileNumberOfComplainant');
  return !!(
    phoneControl &&
    (phoneControl.invalid || phoneControl.value.length !== 10) &&
    phoneControl.touched
  );
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
      name: [{ value: '', disabled: false }, [Validators.required, Validators.pattern('^[A-Za-z\\s]*$')]],

      gender: ['', Validators.required],
      mobileNumber: [''],
      address: [''],
      community: ['', Validators.required],
      caste: ['', Validators.required],
      guardianName: ['', [Validators.required, Validators.pattern('^[A-Za-z\s]*$')]],
      isNativeDistrictSame: ['', Validators.required],
      nativeDistrict: [''],
      isDeceased: ['', Validators.required],
      deceasedPersonName: ['', [Validators.required, Validators.pattern('^[A-Za-z\s]*$')]],
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
      antecedents: ['', Validators.required],
      landOIssues: ['', Validators.required],
      gistOfCurrentCase: ['', Validators.required]
    });
  }

  // Handle City Change
  onCityChange(event: any) {
    const selectedCity = event.target.value;
    if (selectedCity) {
      this.loadPoliceDivisionDetails(selectedCity);
    }
  }

    // Create a FormGroup for a single attachment
    createAttachmentGroup(): FormGroup {
      return this.fb.group({
        fileName: [''], // Holds the file name
        file: [null, Validators.required], // Holds the file itself
      });
    }


    // Handle single file selection
  onSingleFileSelect(event: any, index: number): void {
    const file = event.target.files[0]; // Get the selected file

    if (file) {
      // Update the attachment FormGroup with the file and its name
      this.attachments.at(index).patchValue({
        fileName: file.name,
        file: file,
      });

      // Trigger change detection to update the UI
      this.cdr.detectChanges();
    }
  }

  // Add a new attachment entry
  addAttachment(): void {
    this.attachments.push(this.createAttachmentGroup());
  }

  // Remove an attachment entry
  removeAttachment(index: number): void {
    if (this.attachments.length > 1) {
      this.attachments.removeAt(index);
    }
  }

  // Getter for attachments FormArray
  get attachments(): FormArray {
    return this.firForm.get('attachments') as FormArray;
  }

  // Save as Draft or Insert FIR
  saveAsDraft() {
    this.saveFir('draft');
  }

  isVictimNameInvalid(index: number): boolean {
    const nameControl = this.victims.at(index).get('name');
    return nameControl?.invalid && nameControl?.touched ? true : false;
  }

  isVictimMobileInvalid(index: number): boolean {
    const mobileControl = this.victims.at(index).get('mobileNumber');
    return mobileControl?.invalid && mobileControl?.touched ? true : false;
  }

  isGuardianNameInvalid(index: number): boolean {
    const guardianNameControl = this.victims.at(index).get('guardianName');
    return guardianNameControl?.invalid && guardianNameControl?.touched ? true : false;
  }

  isDeceasedPersonNameInvalid(index: number): boolean {
    const deceasedNameControl = this.victims.at(index).get('deceasedPersonName');
    return deceasedNameControl?.invalid && deceasedNameControl?.touched ? true : false;
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

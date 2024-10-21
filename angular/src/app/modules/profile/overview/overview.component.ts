import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
})
export class OverviewComponent implements OnInit {
  editUserForm: FormGroup;  // Declare the form group

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Initialize the form
    this.editUserForm = this.fb.group({
      role: ['', Validators.required],
      district: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  // Define the onSubmit method to handle form submission
  onSubmit(): void {
    if (this.editUserForm.valid) {
      console.log(this.editUserForm.value);  // Handle form submission
    } else {
      console.log('Form is invalid');
    }
  }
}

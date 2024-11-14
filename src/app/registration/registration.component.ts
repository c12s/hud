import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent implements OnInit {
  form: any = {
    email: null,
    name: null,
    org: null,
    password: null,
    surname: null,
    username: null,
    passwordConfirmation: null
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  allFieldsPopulated(): boolean {
    return (
      this.form.email &&
      this.form.name &&
      this.form.org &&
      this.form.password &&
      this.form.surname &&
      this.form.username &&
      this.form.passwordConfirmation
    ) !== null;
  }
  
  onSubmit(): void {
    const { email, name, org, password, surname, username, passwordConfirmation } = this.form;

    // Check if passwords match
    if (password !== passwordConfirmation) {
      this.errorMessage = 'Passwords do not match';
      this.isSignUpFailed = true;
      return;
    }

    this.isLoading = true;
    this.authService.register(email, name, org, password, surname, username).subscribe(
      data => {
        this.isLoading = false;
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        this.router.navigate(['/app/login']);
      },
      err => {
        this.isLoading = false;
        this.errorMessage = err.error.message || 'Failed to register. Please try again.';
        this.isSignUpFailed = true;
      }
    );
  }
}

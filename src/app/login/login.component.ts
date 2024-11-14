import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  form: any = {
    email: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  isLoading = false;

  constructor(private authService: AuthService, 
              private tokenStorage: TokenStorageService,
              private router: Router) { }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.router.navigate(['/app/home']);
    }
  }

  allFieldsPopulated(): boolean {
    return (
      this.form.password &&
      this.form.username
    ) !== null;
  }

  onSubmit(): void {
    const {password, username} = this.form;
    if (!username || !password) {
      this.errorMessage = 'Both username and password are required.';
      this.isLoginFailed = true;
      return;
    }
    this.isLoading = true;
    this.authService.login(password, username).subscribe(
      data => {
        this.isLoading = false;
        this.tokenStorage.saveToken(data.token);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.router.navigate(['/app/home']);
      },
      err => {
        this.isLoading = false;
        this.errorMessage = 'Login failed. Please try again.';
        this.isLoginFailed = true;
      }
    );
  }

  reloadPage(): void {
    window.location.reload();
  }

}

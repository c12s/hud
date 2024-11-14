import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrl: './menubar.component.scss'
})
export class MenubarComponent implements OnInit{
  badgevisible = false;
  isLoggedIn = false;
  constructor(private tokenService: TokenStorageService, private router: Router) { }

  badgevisibility() {
    this.badgevisible = true;
  }

  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenService.getToken();
  }

  logout(): void {
    this.tokenService.clearToken(); 
    this.isLoggedIn = false;
    this.router.navigate(['/app/login']);
  }
}

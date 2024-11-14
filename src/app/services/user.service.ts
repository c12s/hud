import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {TokenStorageService} from './token-storage.service';
import { IProfile } from '../model/profile.mode';

const API_URL = 'http://localhost:8080/api/users/';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient, private tokenService: TokenStorageService) { }

  getCurrentUser(): Observable<IProfile>{
    return this.http.post<IProfile>(API_URL + 'current', {}, {
      headers: {
        Authorization: 'Bearer ' + this.tokenService.getToken()
      }
    });
  }

  getLoggedInUserId(): Observable<number> {
    return this.http.post<number>(API_URL + 'currentuserid', {}, {
      headers: {
        Authorization: 'Bearer ' + this.tokenService.getToken()
      }
    });
  }

}
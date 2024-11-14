import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {TokenStorageService} from './token-storage.service';

const AUTH_API = '/apis/core/v1/'

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})

export class AuthService {

    constructor(private http: HttpClient, private tokenService: TokenStorageService) { }

    login(password: string, username: string): Observable<any> {
        return this.http.post(AUTH_API + 'auth', {
            password,
            username
        }, httpOptions);
    }

    register(email: string,
             name: string,
             org: string,
             password: string,
             surname: string,
             username: string): Observable<any> {
        return this.http.post(AUTH_API + 'users', {
            email,
            name,
            org,
            password,
            surname,
            username,
        }, httpOptions);
    }

}
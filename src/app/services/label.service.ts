import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {TokenStorageService} from './token-storage.service';

const API_URL = '/apis/core/v1/labels/float64'

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})

export class LabelService {
    constructor(private http: HttpClient, private tokenService: TokenStorageService) {}

    addLabel(key: string, value: number, nodeId: string, org: string): Observable<any>{
        const body = {
            label: {
              key: key,
              value: value
            },
            nodeId: nodeId,
            org: org
          };
        const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer:' + this.tokenService.getToken()
        });
      
        return this.http.post(API_URL, body, { headers });
    }
}
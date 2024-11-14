import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import {TokenStorageService} from './token-storage.service';
import axios from 'axios';

const API_URL = '/apis/core/v1/nodes'

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})

export class NodeService {
    constructor(private http: HttpClient, private tokenService: TokenStorageService) {}

    getAvailableNodes(): Observable<any>{
        return this.http.get(API_URL + '/available', {});
    }

    getAllocatedNodes(org: string): Observable<any>{
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: 'Bearer:' + this.tokenService.getToken()
            });
        //const params = new HttpParams().set('org', org);
        const body = {
            org: org
        }

        return this.http.post(API_URL + '/allocated', body, { headers });
    }

//     getAllocatedNodes(org: string): Promise<any> {
//       const url = '/apis/core/v1/nodes/allocated';
//       const headers = {
//           'Content-Type': 'application/json',
//           Authorization: 'Bearer ' + this.tokenService.getToken()
//       };
//       const body = { org };

//       console.log('Sending request to:', url);
//       console.log('Request headers:', headers);
//       console.log('Request body:', body);
  
//       return axios.post(url, {
//           headers: headers,
//           data: body,
//       })
//       .then(response => response.data)
//       .catch(error => {
//         console.error('Error occurred while fetching allocated nodes:', error);
//         console.error('Error response:', error.response);
//         throw error;
//       });
//   }

     /* getAllocatedNodes(org: string): Promise<any> {
        const url = '/apis/core/v1/nodes/allocated';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.tokenService.getToken(),
            'X-HTTP-Method-Override': 'GET'  // Custom header to tell the server to treat this as a GET
        };
        const body = { org };
    
        return axios.get(url, body, { headers })
            .then(response => response.data)
            .catch(error => {
                console.error('Error occurred while fetching allocated nodes:', error);
                throw error;
            });
    } */   

   /* getAllocatedNodes() {
        const url = '/apis/core/v1/nodes/allocated';
        const data = {
            "org": "c12s"
        };
    
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Allocated nodes:', data.nodes);
            return data.nodes;
        })
        .catch(error => {
            console.error('Error fetching allocated nodes:', error);
        });
    }*/

    claimNodes(org: string, labelKey: string, shouldBe: string, value: string): Observable<any> {
        const body = {
            org, 
            query: [
            {
                labelKey: labelKey,
                shouldBe: shouldBe,
                value: value
            }
        ]};
        return this.http.patch(API_URL, body, {
            headers: {
                Authorization: 'Bearer:' + this.tokenService.getToken()
            }
        });
    }

    createRelationship(fromId: string, fromKind: string, toId: string, toKind: string): Observable<any> {
        const body = {
          from: {
            id: fromId,
            kind: fromKind
          },
          to: {
            id: toId,
            kind: toKind
          }
        };
    
        return this.http.post('/apis/core/v1/relations', body, {
          headers: {
            Authorization: 'Bearer:' + this.tokenService.getToken(),
            'Content-Type': 'application/json'
          }
        });
      }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import {TokenStorageService} from './token-storage.service';
import * as yaml from 'js-yaml';

const API_URL = '/apis/core/v1/configs/standalone'

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})

export class StandaloneConfigService {
    constructor(private http: HttpClient, private tokenService: TokenStorageService) {}

    loadJsonFile(): Promise<any> {
        const filePath = 'assets/schemas/create-standalone-config.yaml';
        return this.http.get(filePath, { responseType: 'text' }).toPromise()
            .then(data => {
            if (data) {
                return data;
            } else {
                throw new Error('Failed to load JSON file: Response is undefined.');
            }
        });
    }

    createStandaloneConfig(path: string){
        const parsedJson = yaml.load(path);
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: 'Bearer:' + this.tokenService.getToken()
        });
        return this.http.post(API_URL, parsedJson, { headers });
    }

    getStandaloneConfig(org: string, namespace: string, name: string, version: string){
        const body = {
            organization: org,
            namespace: namespace,
            name: name,
            version: version
        };
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: 'Bearer:' + this.tokenService.getToken()
        });
        return this.http.post(API_URL + '/single', body, { headers });
    }

    getStandaloneConfigList(org: string, namespace: string){
        const body = {
            organization: org,
            namespace: namespace
        };
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: 'Bearer:' + this.tokenService.getToken()
        });
        return this.http.post(API_URL + '/list', body, { headers });
    }

    diffStandaloneConfig(refOrg: string, refNamespace: string, refName: string, refVersion: string, diffOrg: string, diffNamespace: string, diffName: string, diffVersion: string){
        const body = {
            reference: {
                organization: refOrg,
                namespace: refNamespace,
                name: refName,
                version: refVersion
            },
            diff: {
                organization: diffOrg,
                namespace: diffNamespace,
                name: diffName,
                version: diffVersion
            }
        };
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: 'Bearer:' + this.tokenService.getToken()
        });
        return this.http.post(API_URL + '/diff', body, { headers });
    }

    deleteStandaloneConfig(org: string, namespace: string, name: string, version: string){
        const body = {
            organization: org,
            namespace: namespace,
            name: name,
            version: version
        };
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: 'Bearer:' + this.tokenService.getToken()
        });
        const options = {
            headers: headers,
            body: body,
        }
        return this.http.delete(API_URL, options);
    }

}
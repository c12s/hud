import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { TokenStorageService } from './token-storage.service';

const API_URL = '/apis/core/v1/schemas';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class SchemaService {
  constructor(
    private http: HttpClient,
    private tokenService: TokenStorageService
  ) {}

  loadCreateSchemaYaml(): Promise<any> {
    const filePath = 'assets/schemas/create-schema.yaml';
    return this.http
      .get(filePath, { responseType: 'text' })
      .toPromise()
      .then((data) => {
        if (data) {
          return data;
        } else {
          throw new Error('Failed to load YAML file: Response is undefined.');
        }
      });
  }

  loadValidateSchemaYaml(): Promise<any> {
    const filePath = 'assets/schemas/validate-schema.yaml';
    return this.http
      .get(filePath, { responseType: 'text' })
      .toPromise()
      .then((data) => {
        if (data) {
          return data;
        } else {
          throw new Error('Failed to load YAML file: Response is undefined.');
        }
      });
  }

  createSchema(
    org: string,
    namespace: string,
    name: string,
    version: string,
    path: string
  ) {
    const body = {
      schema_details: {
        organization: org,
        namespace: namespace,
        schema_name: name,
        version: version,
      },
      schema: path,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer:' + this.tokenService.getToken(),
    });
    return this.http.post(API_URL + '/create', body, { headers });
  }

  getSchemaVersions(org: string, namespace: string, name: string) {
    const body = {
      schema_details: {
        organization: org,
        namespace: namespace,
        schema_name: name,
      },
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer:' + this.tokenService.getToken(),
    });
    return this.http.post(API_URL + '/versions', body, { headers });
  }

  getSchema(org: string, name: string, version: string, namespace: string) {
    const body = {
      schema_details: {
        organization: org,
        schema_name: name,
        version: version,
        namespace: namespace,
      },
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer:' + this.tokenService.getToken(),
    });
    return this.http.post(API_URL, body, { headers });
  }

  validateSchema(
    org: string,
    name: string,
    version: string,
    namespace: string,
    path: string
  ) {
    const body = {
      schema_details: {
        organization: org,
        schema_name: name,
        version: version,
        namespace: namespace,
      },
      configuration: path,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer:' + this.tokenService.getToken(),
    });
    return this.http.post(API_URL + '/validations', body, { headers });
  }

  deleteSchema(
    org: string,
    name: string,
    version: string,
    namespace: string
  ) {
    const body = {
      schema_details: {
        organization: org,
        schema_name: name,
        version: version,
        namespace: namespace
      }
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer:' + this.tokenService.getToken(),
    });
    const options = {
      headers: headers,
      body: body,
    };
    return this.http.delete(API_URL, options);
  }
}

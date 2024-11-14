import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { SchemaService } from '../services/schema.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddSchemaDialogComponent } from '../add-schema-dialog/add-schema-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {
  FormBuilder,
  FormControl,
} from '@angular/forms';
import {
  FloatLabelType,
} from '@angular/material/form-field';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { SchemaDetailsDialogComponent } from './schema-details-dialog/schema-details-dialog.component';

@Component({
  selector: 'app-schema-management',
  templateUrl: './schema-management.component.html',
  styleUrl: './schema-management.component.css',
})
export class SchemaManagementComponent implements OnInit {
  readonly hideRequiredControl = new FormControl(false);
  readonly floatLabelControl = new FormControl('auto' as FloatLabelType);
  readonly options = inject(FormBuilder).group({
    hideRequired: this.hideRequiredControl,
    floatLabel: this.floatLabelControl,
  });
  protected readonly hideRequired = toSignal(
    this.hideRequiredControl.valueChanges
  );
  protected readonly floatLabel = toSignal(
    this.floatLabelControl.valueChanges.pipe(map((v) => v || 'auto')),
    { initialValue: 'auto' }
  );

  org: string = 'c12s';
  namespace: string = '';
  name: string = '';
  version: string = '';
  path: string = '';
  isLoading = false;
  isLoadingValidate: boolean[] = [];
  isLoadingDelete: boolean[] = [];
  isValidSchema: boolean[] = [];
  schemaVersions: Array<{
    schemaName: string;
    namespace: string;
    organization: string;
    version: string;
  }> = [];

  constructor(
    private schemaService: SchemaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSchemaPath();
  }

  async loadSchemaPath() {
    try {
      const validateData = await this.schemaService.loadValidateSchemaYaml();
      this.path = validateData;
    } catch (error) {
      console.error('Error loading YAML file', error);
      this.snackBar.open('Failed to load schema configuration.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  getSchemaVersions(): void {
    this.isLoading = true;
    this.schemaService
      .getSchemaVersions(this.org, this.namespace, this.name)
      .subscribe(
        (res: any) => {
          const versions = res.schemaVersions.map((item: any) => ({
            schemaName: item.schemaDetails.schemaName,
            namespace: item.schemaDetails.namespace,
            organization: item.schemaDetails.organization,
            version: item.schemaDetails.version,
          }));
          this.schemaVersions = versions;
          this.isLoading = false;
        },
        (error) => {
          this.snackBar.open('Failed to retrieve schema versions', 'Close', {
            duration: 3000,
          });
          this.isLoading = false;
        }
      );
  }

  validateSchema(
    org: string,
    name: string,
    version: string,
    namespace: string,
    index: number
  ): void {
    this.isLoadingValidate[index] = true;

    this.schemaService
      .validateSchema(org, name, version, namespace, this.path)
      .subscribe(
        (res: any) => {
          this.isLoadingValidate[index] = false;
          this.isValidSchema[index] = res.isValid;
          this.cdRef.detectChanges();
          if (res.isValid) {
            this.snackBar.open(res.message, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
          } else {
            this.snackBar.open(res.message, 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
          }
        },
        (error) => {
          this.isLoadingValidate[index] = false;
          this.snackBar.open('Failed to validate schema', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        }
      );
  }

  deleteSchemaVersion(
    org: string,
    name: string,
    version: string,
    namespace: string,
    index: number
  ): void {
    this.isLoadingDelete[index] = true;

    this.schemaService.deleteSchema(org, name, version, namespace).subscribe(
      (res: any) => {
        this.isLoadingDelete[index] = false;
        this.snackBar.open(res.message, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });

        this.schemaVersions.splice(index, 1);
        this.schemaVersions = [...this.schemaVersions];
        this.cdRef.detectChanges();
      },
      (error) => {
        this.isLoadingDelete[index] = false;
        this.snackBar.open('Failed to delete schema', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      }
    );
  }

  onRowClick(name: string, version: string, namespace: string): void {
    const dialogRef = this.dialog.open(SchemaDetailsDialogComponent, {
      width: '600px',
      data: { schema: '', creationTime: '', version: '', name: '', isLoading: true },
    });
    this.schemaService.getSchema(this.org, name, version, namespace).subscribe(
      (res: any) => {
        const schemaData = res.schemaData;
        dialogRef.componentInstance.data.schema = schemaData.schema;
        dialogRef.componentInstance.data.creationTime = schemaData.creationTime;
        dialogRef.componentInstance.data.version = version;
        dialogRef.componentInstance.data.name = name;
        dialogRef.componentInstance.isLoading = false;
      },
      (error) => {
        this.snackBar.open('Failed to retrieve schema details', 'Close', {
          duration: 3000,
        });
        dialogRef.componentInstance.isLoading = false;
      }
    );
  }

  openAddSchemaDialog(): void {
    this.dialog.open(AddSchemaDialogComponent, {
      width: '400px',
    });
  }
}

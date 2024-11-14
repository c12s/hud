import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SchemaService } from '../services/schema.service';

@Component({
  selector: 'app-add-schema-dialog',
  templateUrl: './add-schema-dialog.component.html',
  styleUrl: './add-schema-dialog.component.css',
})
export class AddSchemaDialogComponent implements OnInit {
  schemaForm: FormGroup;
  isLoading = false;
  path: string = '';

  constructor(
    private fb: FormBuilder,
    private schemaService: SchemaService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddSchemaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { nodeId: string }
  ) {
    this.schemaForm = this.fb.group({
      org: ['', Validators.required],
      namespace: ['', Validators.required],
      name: ['', Validators.required],
      version: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadSchemaPath();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  async loadSchemaPath() {
    try {
      const schemaData = await this.schemaService.loadCreateSchemaYaml();
      this.path = schemaData;
    } catch (error) {
      console.error('Error loading YAML file', error);
      this.snackBar.open('Failed to load schema configuration.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  onSubmit() {
    const { org, namespace, name, version } = this.schemaForm.value;
    this.isLoading = true;
    this.schemaService
      .createSchema(org, namespace, name, version, this.path)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.snackBar.open(res.message, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.dialogRef.close();
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 401) {
            this.snackBar.open(
              'Invalid authentication token. Please log in again.',
              'Close',
              {
                duration: 3000,
                panelClass: ['error-snackbar'],
              }
            );
          } else if (error.status === 403) {
            this.snackBar.open(
              'You are not a member of the specified organization.',
              'Close',
              {
                duration: 3000,
                panelClass: ['error-snackbar'],
              }
            );
          } else {
            this.snackBar.open(
              'An error occurred. Please try again.',
              'Close',
              {
                duration: 3000,
                panelClass: ['error-snackbar'],
              }
            );
          }
        },
      });
  }
}

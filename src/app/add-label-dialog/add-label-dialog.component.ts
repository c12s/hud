import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LabelService } from '../services/label.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-label-dialog',
  templateUrl: './add-label-dialog.component.html',
  styleUrls: ['./add-label-dialog.component.scss'],
})
export class AddLabelDialogComponent {
  labelForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private labelService: LabelService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddLabelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { nodeId: string }
  ) {
    this.labelForm = this.fb.group({
      labelName: ['', Validators.required],
      value: ['', Validators.required],
      org: ['', Validators.required],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.labelForm.valid) {
      const { labelName, value, org } = this.labelForm.value;
      this.isLoading = true;
      this.labelService
        .addLabel(labelName, value, this.data.nodeId, org)
        .subscribe(
          (response) => {
            this.isLoading = false;
            this.snackBar.open('Label created successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
            this.dialogRef.close(true);
          },
          (error) => {
            this.isLoading = false;
            this.handleError(error);
          }
        );
    }
  }

  private handleError(error: any): void {
    let message = 'An error occurred. Please try again.';
    if (error.status === 401) {
      message = 'Invalid authentication token. Please log in again.';
    } else if (error.status === 403) {
      ('The node is not owned by the specified organization.');
    } else if (error.status === 404) {
      message = 'The specified node does not exist.';
    }
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }
}

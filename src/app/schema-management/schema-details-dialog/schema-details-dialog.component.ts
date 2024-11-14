import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-schema-details-dialog',
  templateUrl: './schema-details-dialog.component.html',
  styleUrl: './schema-details-dialog.component.css',
})
export class SchemaDetailsDialogComponent {
  isLoading: boolean;

  constructor(
    public dialogRef: MatDialogRef<SchemaDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isLoading = data.isLoading;
  }

  close(): void {
    this.dialogRef.close();
  }
}

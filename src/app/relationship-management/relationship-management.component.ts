import { Component } from '@angular/core';
import { NodeService } from '../services/node.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-relationship-management',
  templateUrl: './relationship-management.component.html',
  styleUrl: './relationship-management.component.css'
})
export class RelationshipManagementComponent {
  fromId: string = '';
  fromKind: string = '';
  toId: string = '';
  toKind: string = '';
  isLoading = false;

  constructor(private nodeService: NodeService, private snackBar: MatSnackBar) {}

  onSubmit() {
    this.isLoading = true;
    this.nodeService.createRelationship(this.fromId, this.fromKind, this.toId, this.toKind).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Relationship successfully created!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 401) {
          this.snackBar.open('Invalid authentication token', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        } else if (error.status === 403) {
          this.snackBar.open('The user has no permission to manage specified resources.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        } else {
          this.snackBar.open('An error occurred while creating the relationship', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

}

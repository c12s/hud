import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ConfigGroupService } from '../services/configGroup.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  FloatLabelType,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { SelectionModel } from '@angular/cdk/collections';
import { trigger, state, style, transition, animate } from '@angular/animations';


interface ParamSet {
  key: string;
  value: string;
}

interface ConfigParam {
  name: string;
  paramSet: ParamSet[];
}

interface ConfigGroup {
  organization: string;
  name: string;
  version: string;
  namespace: string;
  createdAt: string;
  paramSets: ConfigParam[];
}

interface ConfigGroupListResponse {
  groups: ConfigGroup[];
}

interface DiffDetail {
  type: string;
  diff: {
    key: string;
    value: string;
  };
}

interface ParamSetDiff {
  diffs?: DiffDetail[];
}

interface DiffResponse {
  diffs: {
    [paramSetName: string]: ParamSetDiff;
  };
}


@Component({
  selector: 'app-config-group-management',
  templateUrl: './config-group-management.component.html',
  styleUrl: './config-group-management.component.css',
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '0px',
        overflow: 'hidden',
        opacity: 0
      })),
      state('expanded', style({
        height: '*',
        opacity: 1
      })),
      transition('collapsed <=> expanded', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class ConfigGroupManagementComponent {
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
  namespace2: string = '';
  name: string = '';
  version: string = '';
  path: string = '';
  isLoading = false;
  isLoadingConfig = false;
  isLoadingConfigList = false;
  isLoadingDelete: boolean[] = [];
  configGroupData: ConfigGroup | null = null;
  configGroupListData: ConfigGroup[] = [];
  selection = new SelectionModel<ConfigGroup>(true, []);
  diffArray: any[] = [];
  differences: boolean = false;
  isConfigGroupDetailsExpanded = false;
  isConfigGroupListExpanded = false;

  constructor(
    private configGroupService: ConfigGroupService,
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSchemaPath();
  }

  toggleConfigGroupDetails(): void {
    this.isConfigGroupDetailsExpanded = !this.isConfigGroupDetailsExpanded;
  }

  toggleConfigGroupList(): void {
    this.isConfigGroupListExpanded = !this.isConfigGroupListExpanded;
  }

  async loadSchemaPath() {
    try {
      const yamlData = await this.configGroupService.loadYamlFile();
      this.path = yamlData;
    } catch (error) {
      console.error('Error loading YAML file', error);
      this.snackBar.open('Failed to load schema configuration.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  createConfigGroup(): void {
    this.isLoading = true;
    this.configGroupService.createConfigGroup(this.path).subscribe(
      (res: any) => {
        this.isLoading = false;
        this.snackBar.open('Config group created successfully!', 'Close', {
          duration: 3000,
        });
      },
      (error) => {
        this.isLoading = false;
        this.snackBar.open('Failed to create config group', 'Close', {
          duration: 3000,
        });
      }
    );
  }

  getConfigGroup(): void {
    this.isLoadingConfig = true; 

    this.configGroupService.getConfigGroup(this.org, this.namespace, this.name, this.version).subscribe(
      (data: any) => {
        if (data.paramSets) {
          data.paramSets = data.paramSets.map((set: ConfigParam) => ({
            ...set,
            paramSet: set.paramSet || []
          }));
        }
        this.configGroupData = data;
        this.isLoadingConfig = false;
      },
      (error) => {
        this.isLoadingConfig = false;
        console.error('Error fetching config group data:', error);
        this.snackBar.open('Failed to fetch config group data', 'Close', {
          duration: 3000,
        });
      }
    );
  }

  getConfigGroupList(): void {
    this.isLoadingConfigList = true;

    this.configGroupService.getConfigGroupList(this.org, this.namespace2).subscribe(
      (data: any) => {
        this.configGroupListData = data.groups || []; // Store the config group list
        this.isLoadingConfigList = false;
        this.cdRef.detectChanges();
      },
      (error) => {
        this.isLoadingConfigList = false;
        console.error('Error fetching config group list:', error);
        this.snackBar.open('Failed to fetch config group list', 'Close', {
          duration: 3000,
        });
      }
    );
  }

  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.configGroupListData.forEach(row => this.selection.select(row));
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.configGroupListData.length;
    return numSelected === numRows;
  }

  // toggleSelection(group: ConfigGroup) {
  //   this.selection.toggle(group);
  // }

  toggleSelection(group: ConfigGroup): void {
    if (this.selection.selected.length < 2 || this.selection.isSelected(group)) {
      this.selection.toggle(group);
    } else {
      this.snackBar.open('You can only select up to 2 items.', 'Close', {
        duration: 3000,
      });
    }
  }

  compareVersions(): void {
    if (this.selection.selected.length === 2) {
      const referenceGroup = this.selection.selected[0];
      const diffGroup = this.selection.selected[1];

      this.configGroupService.diffConfigGroup(
        referenceGroup.organization, referenceGroup.namespace, referenceGroup.name, referenceGroup.version,
        diffGroup.organization, diffGroup.namespace, diffGroup.name, diffGroup.version
      ).subscribe((result: any) => {
        if (result && result.diffs) {
          this.displayDifferences(result.diffs);
          this.differences = true;  // Show the differences section
        } else {
          console.log('No differences found.');
          this.snackBar.open('No differences found', 'Close', { duration: 3000 });
          this.differences = false;  // Hide differences section
        }
      }, (error) => {
        console.error('Error fetching config differences:', error);
        this.snackBar.open('Failed to fetch differences', 'Close', { duration: 3000 });
      });
    }
  }
  
  displayDifferences(diffs: { [paramSetName: string]: ParamSetDiff }): void {
    this.diffArray = [];
  
    for (const paramSetName in diffs) {
      const paramSetDiff = diffs[paramSetName];
      if (paramSetDiff.diffs) {
        paramSetDiff.diffs.forEach((diff: DiffDetail) => {
          this.diffArray.push({
            paramSetName,
            diffType: diff.type,
            key: diff.diff.key,
            value: diff.diff.value
          });
        });
      }
    }
  }

  deleteConfigGroupVersion(
    org: string,
    namespace: string,
    name: string,
    version: string,
    index: number
  ): void {
    this.isLoadingDelete[index] = true;

    this.configGroupService.deleteConfigGroup(org, namespace, name, version).subscribe(
      (res: any) => {
        this.isLoadingDelete[index] = false;
        this.snackBar.open(res.message, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });

        this.configGroupListData.splice(index, 1);
        this.configGroupListData = [...this.configGroupListData];
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
  

}

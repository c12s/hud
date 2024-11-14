import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import { NodeService } from '../services/node.service';
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FloatLabelType, MatFormFieldModule} from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import {map} from 'rxjs/operators';
import { AddLabelDialogComponent } from '../add-label-dialog/add-label-dialog.component';

interface Select {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-nodes',
  templateUrl: './nodes.component.html',
  styleUrl: './nodes.component.css'
})
export class NodesComponent implements OnInit{

  readonly hideRequiredControl = new FormControl(false);
  readonly floatLabelControl = new FormControl('auto' as FloatLabelType);
  readonly options = inject(FormBuilder).group({
    hideRequired: this.hideRequiredControl,
    floatLabel: this.floatLabelControl,
  });
  protected readonly hideRequired = toSignal(this.hideRequiredControl.valueChanges);
  protected readonly floatLabel = toSignal(
    this.floatLabelControl.valueChanges.pipe(map(v => v || 'auto')),
    {initialValue: 'auto'},
  );
  nodes : any;
  displayedColumns: string[] = ['id', 'cpuCores', 'avgClockSpeedMHz', 'avgCacheKB', 'memory', 'diskTotalGB', 'diskFreeGB'];
  allColumns: string[] = [];
  dataSource: any[] = [];
  allocatedDataSource: any[] = [];
  claimedNodes: any[] = [];
  org: string = 'c12s';
  labelKey: string = '';
  shouldBe: string = '';
  value: string = '';
  token: string = '';
  queryString: string = '';
  errorMessage: string = '';
  isLoading = false;
  expressions: Select[] = [
    {value: '=', viewValue: 'equals'},
    {value: '!=', viewValue: 'not equals'},
    {value: '<', viewValue: 'less than'},
    {value: '>', viewValue: 'greater than'},
  ];
  labels: Select[] = [
    {value: 'memory-totalGB', viewValue: 'Memory (GB)'},
    {value: 'disk-totalGB', viewValue: 'Disk Total (GB)'},
    {value: 'disk-freeGB', viewValue: 'Disk Free (GB)'},
  ];

  constructor(
    private nodeService : NodeService,
    private dialog: MatDialog
  ) {}

  columnDisplayNames: { [key: string]: string } = {
    id: 'Node ID',
    cpuCores: 'CPU Cores',
    avgClockSpeedMHz: 'Avg Clock Speed (MHz)',
    avgCacheKB: 'Avg Cache (KB)',
    memory: 'Memory (GB)',
    diskTotalGB: 'Disk Total (GB)',
    diskFreeGB: 'Disk Free (GB)',
    customLabels: 'Custom Labels'
  };

  ngOnInit(): void {
    this.loadAvailableNodes();
    this.loadAllocatedNodes();
  }

  isObjectOrArray(value: any): boolean {
    return typeof value === 'object' && value !== null;
  }
  
  isArray(value: any): boolean {
    return Array.isArray(value);
  }
  
  loadAvailableNodes(): void {
    this.nodeService.getAvailableNodes().subscribe((res) => {
      if (res.nodes && res.nodes.length > 0) {
        this.dataSource = [...this.processNodes(res.nodes)];
      } else {
        this.dataSource = []; 
      }
    });
  }

  loadAllocatedNodes(): void {
    this.nodeService.getAllocatedNodes(this.org)
        .subscribe((res: any) => {
            if (res.nodes && res.nodes.length > 0) {
                this.allocatedDataSource = this.processNodes(res.nodes);
                this.updateDisplayedColumns(this.allocatedDataSource);
            } else {
                this.allocatedDataSource = [];
            }
        });
}

  processNodes(nodes: any[]): any[] {
    const standardKeys = new Set([
      'cpu-cores', 'core0mhz', 'core0vendorId', 'core0model', 'core0cacheKB',
      'core1mhz', 'core1vendorId', 'core1model', 'core1cacheKB', 
      'core2mhz', 'core2vendorId', 'core2model', 'core2cacheKB',
      'core3mhz', 'core3vendorId', 'core3model', 'core3cacheKB',
      'core4mhz', 'core4vendorId', 'core4model', 'core4cacheKB',
      'core5mhz', 'core5vendorId', 'core5model', 'core5cacheKB',
      'core6mhz', 'core6vendorId', 'core6model', 'core6cacheKB',
      'core7mhz', 'core7vendorId', 'core7model', 'core7cacheKB',
      'core8mhz', 'core8vendorId', 'core8model', 'core8cacheKB',
      'core9mhz', 'core9vendorId', 'core9model', 'core9cacheKB',
      'disk-freeGB', 'disk-totalGB', 'memory-totalGB', 'kernel-arch', 
      'kernel-version', 'platform', 'platform-family', 'platform-version'
    ]);

    return nodes.map(node => {
      const nodeData: any = { 
        id: node.id,
        cpuCores: 'N/A',
        avgClockSpeedMHz: 'N/A',
        avgCacheKB: 'N/A',
        memory: 'N/A',
        diskTotalGB: 'N/A',
        diskFreeGB: 'N/A',
        customLabels: []
      };
  
      let totalClockSpeed = 0;
      let totalCache = 0;
      let coreCount = 0;
  
      node.labels.forEach((label: any) => {
        if (standardKeys.has(label.key)) {
        if (label.key === 'cpu-cores') {
          nodeData.cpuCores = label.value;
        } else if (label.key.includes('mhz')) {
          totalClockSpeed += parseFloat(label.value);
          coreCount++;
        } else if (label.key.includes('cacheKB')) {
          totalCache += parseFloat(label.value);
        } else if (label.key === 'disk-freeGB') {
          nodeData.diskFreeGB = label.value;
        } else if (label.key === 'disk-totalGB') {
          nodeData.diskTotalGB = label.value;
        } else if (label.key === 'memory-totalGB' && node.resources && node.resources.mem) {
          nodeData.memory = `${node.resources.mem.toFixed(2)} GB`;
        }
      } else {
        if (label.value) {
          nodeData.customLabels.push(`${label.key}: ${label.value}`);
        }
      }
      });
  
      if (coreCount > 0) {
        nodeData.avgClockSpeedMHz = (totalClockSpeed / coreCount).toFixed(2);
        nodeData.avgCacheKB = (totalCache / coreCount).toFixed(2);
      }
  
      if (node.resources && node.resources.mem) {
        nodeData.memory = `${node.resources.mem.toFixed(2)} GB`;
      }
  
      return nodeData;
    });
  }

claimNodes(): void {
    this.isLoading = true;
    this.nodeService.claimNodes(this.org, this.labelKey, this.shouldBe, this.value)
    .subscribe(
      (res) => {
        this.isLoading = false;
        this.claimedNodes = res.nodes;
        this.allocatedDataSource = [...this.processNodes(res.node)];
        this.errorMessage = '';
        this.refreshAvailableNodes();
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error claiming nodes. Please check your input and try again.';
        console.error('Error:', error);
      }
    );
}

refreshAvailableNodes(): void {
  this.nodeService.getAvailableNodes().subscribe((res) => {
    if (res.nodes && res.nodes.length > 0) {
      this.dataSource = [...this.processNodes(res.nodes)];
      console.log(this.dataSource);
    } else {
      this.dataSource = [];
    }
  });
}

updateDisplayedColumns(dataSource: any[]): void {
  const labelKeys = new Set<string>();
  dataSource.forEach(node => {
    Object.keys(node).forEach(key => {
      if (!this.displayedColumns.includes(key) && key !== 'id' && key !== 'addLabel' && key !== 'customLabels') {
        labelKeys.add(key);
      }
    });
  });

  this.displayedColumns = ['id', 'cpuCores', 'avgClockSpeedMHz', 'avgCacheKB', 'memory', 'diskTotalGB', 'diskFreeGB', ...Array.from(labelKeys), 'customLabels'];
  this.allColumns = [...this.displayedColumns, 'addLabel'];
}

openAddLabelDialog(nodeId: string): void {
  const dialogRef = this.dialog.open(AddLabelDialogComponent, {
    width: '300px',
    data: { nodeId }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.loadAllocatedNodes();
    }
  });
}

}

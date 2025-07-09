// === admin.component.ts ===
import {
  AfterViewInit,
  Component,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AdminEditDialogComponent } from './admin-edit-dialog.component';
import { exportToCSV } from './export-util-helper';
import { UserData } from './user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GridApi } from 'ag-grid-community';

import {
  ModuleRegistry,
  themeAlpine,
  themeBalham,
  themeMaterial,
  themeQuartz,
} from 'ag-grid-community';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    MatButtonModule,
    FormsModule,
    MatDialogModule,
    NzSelectModule,
    MatSnackBarModule,
    NzModalModule,
    NzIconModule,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  
  dialog = inject(MatDialog);
  snack = inject(MatSnackBar);
  nzModal = inject(NzModalService);
  gridApi!: GridApi;
  pageSize = 20;
  themes = [
    { label: 'Theme Quartz', theme: themeQuartz },
    { label: 'Theme Balham', theme: themeBalham },
    { label: 'Theme Material', theme: themeMaterial },
    { label: 'Theme Alpine', theme: themeAlpine },
  ];
  theme = themeQuartz;

  @ViewChild('gridRef') grid!: AgGridAngular;
  activeTab = 'users';

  rowData = signal<UserData[]>(
    Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: 'Sridhar S M',
      email: `sridhar${i}@gmail.com`,
      contact: '+91-9686802325',
      role: ['User'],
      message: 'Electro zenix technology.',
    }))
  );

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    editable: false,
  };

  columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Full Name' },
    { field: 'email', headerName: 'Email' },
    { field: 'contact', headerName: 'Contact' },
    {
      field: 'role',
      headerName: 'Roles',
      cellRenderer: (params: any) => {
        const roles = Array.isArray(params.value)
          ? params.value
          : [params.value];
        return roles
          .map((role: string) => {
            const cls = `nz-tag role-${role.toLowerCase()}`;
            return `<nz-tag class='${cls}'>${role}</nz-tag>`;
          })
          .join(' ');
      },
    },
    {
      field: 'message',
      headerName: 'Message',
      flex: 2,
    },
    {
      headerName: 'Actions',
    cellRenderer: () => `
  <span class="link-action edit" data-action="edit">
    <i nz-icon class="anticon" nzType="edit" nzTheme="outline"></i> Edit
  </span> 
  <span class="link-action delete" data-action="delete">
    <i nz-icon class="anticon" nzType="delete" nzTheme="outline"></i> Delete
  </span>
`,


      onCellClicked: (params: any) => {
        const action = params.event.target?.getAttribute('data-action');
        if (action === 'edit') this.openEditDialog(params.data);
        if (action === 'delete') this.confirmDelete(params.data);
      },
    },
  ];

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  openEditDialog(user?: UserData) {
    const dialogRef = this.dialog.open(AdminEditDialogComponent, {
      width: '500px',
      data: { user: user ? { ...user } : null },
      panelClass: 'dialog-glass',
    });

    dialogRef.afterClosed().subscribe((result: UserData | undefined) => {
      if (result) {
        if (user) {
          this.rowData.update((users) =>
            users.map((u) => (u.id === user.id ? result : u))
          );
          this.snack.open('User Updated', 'Close', { duration: 3000 });
        } else {
          result.id = Date.now();
          this.rowData.update((users) => [...users, result]);
        }
      }
    });
  }

  confirmDelete(user: UserData) {
    this.nzModal.confirm({
      nzTitle: `Delete ${user.name}?`,
      nzContent: `Are you sure you want to remove this user?`,
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOnOk: () => this.deleteRow(user),
      nzCancelText: 'Cancel',
    });
  }

  deleteRow(user: UserData) {
    this.rowData.update((users) => users.filter((u) => u.id !== user.id));
    this.snack.open(`${user.name} deleted`, 'Close', { duration: 3000 });
  }

  deleteSelected() {
    const selected = this.grid.api.getSelectedRows();
    if (!selected.length) return;

    this.nzModal.confirm({
      nzTitle: `Delete ${selected.length} selected users?`,
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes, Delete',
      nzOkType: 'primary',
      nzOnOk: () => {
        const idsToRemove = selected.map((u: any) => u.id);
        this.rowData.update((users) =>
          users.filter((u) => !idsToRemove.includes(u.id))
        );
        this.snack.open(`Deleted ${selected.length} users`, 'Close', {
          duration: 3000,
        });
      },
      nzCancelText: 'Cancel',
    });
  }

  exportCSV() {
    exportToCSV(this.rowData());
    this.snack.open('Exported to CSV', 'Close', { duration: 3000 });
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    (this.gridApi as any).paginationSetPageSize(20);
  }
}

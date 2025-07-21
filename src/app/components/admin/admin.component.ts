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
import { AuthService } from '../../auth/auth.service';
import { ToastService } from '../../shared/toast.service';

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
  authService = inject(AuthService)
  toastService = inject(ToastService)
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

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    editable: false,
  };

  rowData = signal<UserData[]>([]); 
  columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Full Name' },
    { field: 'email', headerName: 'Email' },
    { field: 'phone', headerName: 'Contact' },
{
  field: 'role',
  headerName: 'Roles',
  cellRenderer: (params: any) => {
    let roles: string[] = [];

    if (Array.isArray(params.value)) {
      roles = params.value.flat().map((r: any) => String(r).trim());
    } else if (typeof params.value === 'string') {
      roles = params.value.split(',').map((r:any) => r.trim());
    } else if (params.value) {
      roles = [String(params.value).trim()];
    }

    return roles
      .map((role: string) => {
        const safeRole = role.toLowerCase();
        const cls = `nz-tag role-${safeRole}`;
        return `<nz-tag class="${cls}">${role}</nz-tag>`;
      })
      .join(' ');
  },
},
    { field: 'message', headerName: 'Message' },
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

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.authService.getAllUsers().subscribe({
      next: (res: any) => {
        const users = res?.data?.data || [];
        this.rowData.set(
          users.map((u: any) => ({
            id: u._id,
            name: u.fullName,
            email: u.email,
            phone: u.phone,
            role: [u.role], // wrap in array for tags
            message: `Profile ${u.isProfileComplete ? 'Complete' : 'Incomplete'}`,
          }))
        );
        this.toastService.success('Users loaded successfully');
      },
      error: () => {
        this.toastService.error('Failed to load users');
      },
    });
  }


switchTab(tab: string) {
    this.activeTab = tab;
  }
openEditDialog(user?: UserData) {
  if (user?.id) {
    // Editing: Fetch fresh user details from API before opening popup
    this.authService.getUser(user.id).subscribe({
      next: (res: any) => {
        const fetchedUser = res?.data?.data || user;
        this.openDialog(fetchedUser);
      },
      error: () => {
        this.toastService.error('Failed to fetch user details');
      }
    });
  } else {
    // Creating New User
    this.openDialog();
  }
}

private openDialog(user?: any) {
  const mappedUser = user
    ? {
        id: user.id || user._id,
        name: user.name || user.fullName,
        email: user.email,
        phone: user.phone,
        role: Array.isArray(user.role) ? user.role : [user.role],
        message: user.message || `Profile ${user.isProfileComplete ? 'Complete' : 'Incomplete'}`,
      }
    : null;

  const dialogRef = this.dialog.open(AdminEditDialogComponent, {
    width: '500px',
    data: { user: mappedUser },
    panelClass: 'dialog-glass',
  });

  dialogRef.afterClosed().subscribe((result: UserData | undefined) => {
    if (result) {
      if (user) {
        this.updateUser(user._id, result);
      } else {
        this.createUser(result);
      }
    }
  });
}

updateUser(id: string, updatedData: UserData) {
  const apiPayload = {
    fullName: updatedData.name,
    email: updatedData.email,
    phone: updatedData.phone,
    role: updatedData.role,
  };

  this.authService.updateUser(id, apiPayload).subscribe({
    next: () => {
      this.rowData.update((users) =>
        users.map((u) => (u.id === id ? { ...updatedData, id } : u))
      );
      this.toastService.success('User updated successfully');
    },
    error: () => {
      this.toastService.error('Failed to update user');
    },
  });
}

createUser(newUser: UserData) {
  const apiPayload = {
    fullName: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
    terms: true,
  };

  this.authService.createUser(apiPayload).subscribe({
    next: (res: any) => {
      const savedUser = res?.data?.user;
      this.rowData.update((users) => [
        ...users,
        {
          id: savedUser._id,
          name: savedUser.fullName,
          email: savedUser.email,
          phone: savedUser.phone,
          role: [savedUser.role],
          message: `Profile ${
            savedUser.isProfileComplete ? 'Complete' : 'Incomplete'
          }`,
        },
      ]);
      this.toastService.success('User created successfully');
    },
    error: () => {
      this.toastService.error('Failed to create user');
    },
  });
}


deleteRow(user: UserData) {
  this.authService.deleteUser(user.id).subscribe({
    next: () => {
      this.rowData.update((users) => users.filter((u) => u.id !== user.id));
      this.toastService.success(`${user.name} deleted successfully`);
    },
    error: () => {
      this.toastService.error('Failed to delete user');
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
    this.toastService.success('Exported to CSV');
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    (this.gridApi as any).paginationSetPageSize(20);
  }
}

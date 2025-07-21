// === export-util.ts ===
import { UserData } from './user.model';

export function exportToCSV(data: UserData[], filename: string = 'users.csv') {
  const csvContent = [
    ['Name', 'Email', 'Contact', 'Role', 'Message'],
    ...data.map(u => [u.name, u.email, u.phone, u.role, u.message])
  ]
    .map(row => row.map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

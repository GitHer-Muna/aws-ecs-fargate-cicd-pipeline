import { format, formatDistanceToNow } from 'date-fns';
import clsx, { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
}

export function formatRelativeTime(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    WAITING_ON_CUSTOMER: 'bg-purple-100 text-purple-800',
    WAITING_ON_THIRD_PARTY: 'bg-pink-100 text-pink-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getPriorityColor(priority: string) {
  const colors: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function truncate(str: string, length: number) {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TicketIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Layout } from '@/components/Layout';
import { useTicketStore } from '@/store/ticket.store';
import { useAuthStore } from '@/store/auth.store';
import { formatRelativeTime, getStatusColor, getPriorityColor, truncate } from '@/lib/utils';

export function DashboardPage() {
  const { tickets, stats, fetchTickets, fetchStats, setFilters } = useTicketStore();
  const { user } = useAuthStore();

  useEffect(() => {
    setFilters({ page: 1, limit: 5 });
    fetchTickets();
    fetchStats();
  }, []);

  const statCards = [
    {
      name: 'Total Tickets',
      value: stats?.total || 0,
      icon: TicketIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Open',
      value: stats?.byStatus.open || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'In Progress',
      value: stats?.byStatus.inProgress || 0,
      icon: ExclamationCircleIcon,
      color: 'bg-orange-500',
    },
    {
      name: 'Resolved',
      value: stats?.byStatus.resolved || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {user?.firstName}! Here's what's happening with your tickets.
            </p>
          </div>
          <Link to="/tickets/new" className="btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            New Ticket
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md ${stat.color} p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Tickets */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Tickets</h2>
            <Link to="/tickets" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new ticket.
              </p>
              <div className="mt-6">
                <Link to="/tickets/new" className="btn-primary">
                  <PlusIcon className="h-5 w-5 mr-2 inline" />
                  New Ticket
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <li key={ticket.id} className="py-4">
                    <Link to={`/tickets/${ticket.id}`} className="block hover:bg-gray-50 -mx-6 px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-500">
                              {ticket.ticketNumber}
                            </span>
                            <span className={`badge ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                            <span className={`badge ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {ticket.title}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {truncate(ticket.description, 100)}
                          </p>
                          <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                            <span>Created {formatRelativeTime(ticket.createdAt)}</span>
                            <span>•</span>
                            <span>by {ticket.createdBy.firstName} {ticket.createdBy.lastName}</span>
                            {ticket.assignedTo && (
                              <>
                                <span>•</span>
                                <span>Assigned to {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

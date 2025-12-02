import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { 
  HomeIcon, 
  TicketIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/auth.store';
import { getInitials } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Tickets', href: '/tickets', icon: TicketIcon },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      // Force reload to clear all state
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout anyway
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold text-primary-600">CloudCare</h1>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                      location.pathname === item.href
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              {/* Profile dropdown */}
              <Menu as="div" className="relative ml-3">
                <Menu.Button className="flex items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                    {user ? getInitials(user.firstName, user.lastName) : 'U'}
                  </div>
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                          {user?.role}
                        </span>
                      </div>
                    </div>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                        >
                          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

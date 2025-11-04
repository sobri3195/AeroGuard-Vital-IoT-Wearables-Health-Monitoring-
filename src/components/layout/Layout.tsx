import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  User,
  Thermometer,
  Bell,
  FileText,
  Smartphone,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const navigation = [
    { name: 'Overview', path: '/overview', icon: LayoutDashboard, roles: ['commander', 'medical', 'iot_operator'] },
    { name: 'Team', path: '/team', icon: Users, roles: ['commander', 'medical'] },
    { name: 'Person', path: '/person', icon: User, roles: ['medical'] },
    { name: 'Environment', path: '/environment', icon: Thermometer, roles: ['commander', 'medical', 'iot_operator'] },
    { name: 'Alerts', path: '/alerts', icon: Bell, roles: ['commander', 'medical', 'iot_operator'] },
    { name: 'Devices', path: '/devices', icon: Smartphone, roles: ['iot_operator'] },
    { name: 'Reports', path: '/reports', icon: FileText, roles: ['commander', 'medical'] },
    { name: 'Policies', path: '/policies', icon: Shield, roles: ['security_admin', 'commander'] },
    { name: 'Admin', path: '/admin', icon: Settings, roles: ['security_admin'] },
  ];

  const filteredNavigation = navigation.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-900 text-white transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-primary-800">
          <div className="flex items-center gap-2">
            <Shield size={32} />
            <div>
              <h1 className="font-bold text-lg">AeroGuard Vital</h1>
              <p className="text-xs text-primary-300">IoT Health Monitor</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-primary-800 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-800'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.username}</p>
              <p className="text-xs text-primary-300 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-800 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

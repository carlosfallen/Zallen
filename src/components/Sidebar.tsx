import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Monitor,
    Users,
    UserCheck,
    AlertTriangle,
    Shield
} from 'lucide-react';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/monitoring', icon: Monitor, label: 'Monitoramento' },
    { to: '/vendors', icon: Users, label: 'Vendedores' },
    { to: '/leads', icon: UserCheck, label: 'Leads' },
    { to: '/alerts', icon: AlertTriangle, label: 'Alertas' },
];

export default function Sidebar() {
    return (
        <aside className="w-64 bg-secondary-500 text-white flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-secondary-600">
                <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-primary-400" />
                    <div>
                        <h1 className="text-xl font-bold">Zapper</h1>
                        <p className="text-xs text-secondary-200">Monitor WhatsApp</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-primary-500 text-white'
                                : 'text-secondary-100 hover:bg-secondary-600'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-secondary-600">
                <p className="text-xs text-secondary-300 text-center">
                    © 2026 Zapper Monitor
                </p>
            </div>
        </aside>
    );
}

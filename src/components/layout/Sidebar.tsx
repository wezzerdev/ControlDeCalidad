import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  TestTube,
  ClipboardCheck,
  Award,
  CreditCard,
  X,
  Package,
  Database,
  ShieldAlert,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationGroups = [
    {
      title: null,
      items: [
        { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'OPERACIÓN',
      items: [
        { name: 'Proyectos', href: '/app/proyectos', icon: Briefcase, permission: 'access_proyectos' },
        { name: 'Muestras', href: '/app/muestras', icon: TestTube, permission: 'access_muestras' },
        { name: 'Ensayos', href: '/app/ensayos', icon: ClipboardCheck, permission: 'access_ensayos' },
        { name: 'Resultados', href: '/app/resultados', icon: Database, permission: 'access_resultados' },
        { name: 'Certificados', href: '/app/certificados', icon: Award, permission: 'access_certificados' },
      ]
    },
    {
      title: 'GESTIÓN',
      items: [
        { name: 'Normas', href: '/app/normas', icon: FileText, roles: ['administrador', 'gerente'] },
        { name: 'Inventarios', href: '/app/inventarios', icon: Package, permission: 'access_inventarios' },
        { name: 'Auditoría', href: '/app/auditoria', icon: ShieldAlert, permission: 'access_auditoria' },
      ]
    },
    {
      title: 'SISTEMA',
      items: [
        { name: 'Planes', href: '/app/planes', icon: CreditCard },
      ]
    }
  ];

  // Helper to check access
  const hasAccess = (item: any) => {
    if (item.roles && user && !item.roles.includes(user.role)) {
      return false;
    }
    if (item.permission && user?.permissions) {
      // @ts-ignore
      return user.permissions[item.permission];
    }
    return true;
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )} 
        onClick={onClose}
      />

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 bg-card border-r border-border transform transition-all duration-300 ease-in-out flex flex-col h-[100dvh]",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "w-20" : "w-64",
        "lg:translate-x-0 lg:static lg:h-screen lg:inset-auto"
      )}>
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-border",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <a href="/" className="text-xl font-bold text-primary truncate hover:text-primary/80 transition-colors">
              ConstruLab
            </a>
          )}
          {isCollapsed && (
            <a href="/" className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
              CL
            </a>
          )}
          
          <button 
            onClick={onClose} 
            className="lg:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground active:bg-accent rounded-full transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="h-6 w-6" />
          </button>

          <button 
            onClick={toggleCollapse} 
            className="hidden lg:flex h-6 w-6 items-center justify-center rounded-full bg-accent text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto scrollbar-hide">
          {navigationGroups.map((group, groupIndex) => {
            const filteredItems = group.items.filter(hasAccess);
            
            if (filteredItems.length === 0) return null;

            return (
              <div key={groupIndex} className="space-y-1">
                {group.title && !isCollapsed && (
                  <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 animate-in fade-in duration-300">
                    {group.title}
                  </h3>
                )}
                {group.title && isCollapsed && (
                   <div className="h-px bg-border my-2 mx-2" />
                )}
                
                {filteredItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={({ isActive }) => cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all group relative overflow-hidden",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                      !isCollapsed && "mr-3",
                      isCollapsed && "group-hover:scale-110"
                    )} />
                    
                    {!isCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <NavLink 
            to="/app/account"
            className={({ isActive }) => cn(
              "flex items-center p-2 rounded-lg transition-colors hover:bg-accent group cursor-pointer",
              isActive ? "bg-accent" : "",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? user?.name : undefined}
          >
            <img 
              className="h-9 w-9 rounded-full ring-2 ring-border" 
              src={user?.avatar || "https://ui-avatars.com/api/?name=User"} 
              alt={user?.name} 
            />
            {!isCollapsed && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize truncate">{user?.role}</p>
              </div>
            )}
          </NavLink>
        </div>
      </div>
    </>
  );
}

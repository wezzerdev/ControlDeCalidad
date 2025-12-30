import React, { useState, useEffect } from 'react';
import { Menu, Bell, Sun, Moon, LogOut, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface HeaderProps {
  onMenuClick: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  link?: string;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Ideally, setup realtime subscription here
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications', 
        filter: `user_id=eq.${user.id}` 
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    try {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false })
            .limit(10);
            
        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        }
    } catch (error) {
        console.error("Error fetching notifications", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
        console.error(error);
    }
  };

  const markAllAsRead = async () => {
      try {
          await supabase.from('notifications').update({ read: true }).eq('user_id', user?.id).eq('read', false);
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          setUnreadCount(0);
      } catch (error) {
          console.error(error);
      }
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-card border-b border-border">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 mr-2 text-muted-foreground hover:text-foreground lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleTheme}
          className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-colors"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
        
        <div className="relative">
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-colors relative" 
                aria-label="Notificaciones"
            >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-card" />
            )}
            </button>

            {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="p-3 border-b border-border flex justify-between items-center bg-muted/50">
                        <h3 className="text-sm font-semibold">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                                Marcar todo leído
                            </button>
                        )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No tienes notificaciones
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div 
                                    key={notification.id} 
                                    className={cn(
                                        "p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors flex gap-3",
                                        !notification.read && "bg-primary/5"
                                    )}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className={cn(
                                        "h-2 w-2 rounded-full mt-1.5 flex-shrink-0",
                                        !notification.read ? "bg-primary" : "bg-gray-300"
                                    )} />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{notification.title}</p>
                                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                                        <p className="text-[10px] text-gray-400">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>

        <div className="h-6 w-px bg-border mx-2" />

        <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4 mr-2" />
          Salir
        </Button>
      </div>
    </header>
  );
}

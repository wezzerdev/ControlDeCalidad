import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { User, Mail, Shield, Bell, Moon, Sun, Globe, Building, Users, Palette, FileText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { cn } from '@/lib/utils';
import Settings from './Settings';
import TeamManagement from '../components/account/TeamManagement';
import TemplateManagement from '../components/account/TemplateManagement';

export default function Account() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { theme, toggleTheme, primaryColor, setPrimaryColor } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'company' | 'team' | 'templates'>('profile');
  
  const colors = [
    { name: 'Verde (Default)', value: '#25A418' },
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Naranja', value: '#f97316' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Amarillo', value: '#eab308' },
    { name: 'Rojo', value: '#ef4444' },
    { name: 'Morado', value: '#a855f7' },
  ];
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here would be the API call to update user profile
    addToast('Perfil actualizado correctamente', 'success');
    setIsEditing(false);
  };

  type TabId = 'profile' | 'preferences' | 'company' | 'team' | 'templates';

  const tabs: { id: TabId; label: string; icon: React.ElementType; roles?: string[] }[] = [
    { id: 'profile', label: 'Mi Perfil', icon: User },
    { id: 'preferences', label: 'Preferencias', icon: Globe },
    { id: 'templates', label: 'Plantillas', icon: FileText, roles: ['administrador', 'gerente'] },
    { id: 'team', label: 'Equipo', icon: Users, roles: ['administrador'] },
    { id: 'company', label: 'Empresa', icon: Building, roles: ['administrador'] }
  ];

  const filteredTabs = tabs.filter(tab => !tab.roles || (user && tab.roles.includes(user.role)));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mi Cuenta</h1>
        <p className="text-muted-foreground mt-1">
          Administra tu perfil, preferencias y seguridad.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-2">
          {filteredTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información de Perfil</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <Button type="button" variant="outline" size="sm">Cambiar Avatar</Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nombre Completo"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        icon={<User className="h-4 w-4" />}
                      />
                      <Input
                        label="Correo Electrónico"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        icon={<Mail className="h-4 w-4" />}
                      />
                    </div>

                    <div className="pt-4 flex justify-end space-x-2">
                      {isEditing ? (
                        <>
                          <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit">
                            Guardar Cambios
                          </Button>
                        </>
                      ) : (
                        <Button type="button" onClick={() => setIsEditing(true)}>
                          Editar Perfil
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Seguridad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <Input
                      label="Contraseña Actual"
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nueva Contraseña"
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                      />
                      <Input
                        label="Confirmar Contraseña"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" disabled={!formData.currentPassword}>
                        Actualizar Contraseña
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rol y Permisos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-bold capitalize text-lg">{user?.role}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tu rol actual determina las acciones que puedes realizar en la plataforma.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferencias de Interfaz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      <span className="text-sm font-medium">Tema</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={toggleTheme}
                    >
                      {theme === 'dark' ? 'Oscuro' : 'Claro'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span className="text-sm font-medium">Idioma</span>
                    </div>
                    <select className="text-sm bg-transparent border border-input rounded-md p-1 focus:ring-0 cursor-pointer">
                      <option>Español</option>
                      <option>English</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Palette className="h-4 w-4" />
                      <span className="text-sm font-medium">Color de Énfasis</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          className={cn(
                            "w-6 h-6 rounded-full border border-gray-200 transition-transform hover:scale-110",
                            primaryColor === color.value && "ring-2 ring-offset-2 ring-primary"
                          )}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setPrimaryColor(color.value)}
                          title={color.name}
                        />
                      ))}
                      <div className="relative ml-2 group">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden cursor-pointer opacity-0 absolute inset-0"
                        />
                        <div 
                          className="w-8 h-8 rounded-full border border-gray-200 bg-[conic-gradient(at_top,_red,_orange,_yellow,_green,_blue,_indigo,_violet)]"
                          title="Color Personalizado"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4" />
                      <span className="text-sm font-medium">Notificaciones</span>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-green-400" defaultChecked/>
                      <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'team' && user?.role === 'administrador' && (
            <TeamManagement />
          )}

          {activeTab === 'templates' && (user?.role === 'administrador' || user?.role === 'gerente') && (
            <TemplateManagement />
          )}

          {activeTab === 'company' && user?.role === 'administrador' && (
            <div className="space-y-6">
              <SettingsContent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrapper to reuse the Settings form logic
function SettingsContent() {
    return <Settings />;
}

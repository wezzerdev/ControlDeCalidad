import React, { useState } from 'react';
import { useCompany } from '../../context/CompanyContext';
import { useData } from '../../context/DataContext';
import { plans } from '../../data/plans';
import { Button } from '../common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { Input } from '../common/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../common/Table';
import { useToast } from '../../context/ToastContext';
import { User, UserRole, UserPermissions } from '../../data/mockData';
import { Trash2, UserPlus, Shield, Mail, Pencil, X, Briefcase } from 'lucide-react';

export default function TeamManagement() {
  const { companyInfo, users, addUser, updateUser, removeUser } = useCompany();
  const { proyectos, updateProyecto } = useData();
  const { addToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [assignedProjectIds, setAssignedProjectIds] = useState<string[]>([]);
  
  const defaultPermissions: UserPermissions = {
    access_proyectos: true,
    access_muestras: true,
    access_ensayos: true,
    access_certificados: true,
    access_inventarios: true,
    access_resultados: true,
    access_reportes: true,
    access_auditoria: true,
    access_notificaciones: true
  };

  const initialUserState = {
    name: '',
    email: '',
    role: 'tecnico' as UserRole,
    permissions: defaultPermissions
  };

  const [formData, setFormData] = useState(initialUserState);

  const currentPlan = plans.find(p => p.id === companyInfo.planId) || plans[0];
  const userCount = users.length;
  const maxUsers = currentPlan.maxUsers;
  const canAddUser = userCount < maxUsers;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [name]: checked
      }
    });
  };

  const handleProjectAssignmentChange = (projectId: string, checked: boolean) => {
    if (checked) {
      setAssignedProjectIds(prev => [...prev, projectId]);
    } else {
      setAssignedProjectIds(prev => prev.filter(id => id !== projectId));
    }
  };

  const startEditing = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions || defaultPermissions
    });
    
    // Load assigned projects
    const userProjectIds = proyectos
      .filter(p => p.usuarios.some(u => u.userId === user.id))
      .map(p => p.id);
    setAssignedProjectIds(userProjectIds);
    
    setIsAdding(true);
  };

  const cancelEditing = () => {
    setIsAdding(false);
    setEditingUser(null);
    setFormData(initialUserState);
    setAssignedProjectIds([]);
  };

  const updateProjectAssignments = (userId: string, role: UserRole) => {
    proyectos.forEach(proyecto => {
      const isAssigned = assignedProjectIds.includes(proyecto.id);
      const isCurrentlyInProject = proyecto.usuarios.some(u => u.userId === userId);

      if (isAssigned && !isCurrentlyInProject) {
        // Add user to project
        const newUsuarios = [...proyecto.usuarios, { userId, rol: role }];
        updateProyecto(proyecto.id, { usuarios: newUsuarios });
      } else if (!isAssigned && isCurrentlyInProject) {
        // Remove user from project
        const newUsuarios = proyecto.usuarios.filter(u => u.userId !== userId);
        updateProyecto(proyecto.id, { usuarios: newUsuarios });
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // Update existing user
        const updatedUser: User = {
          ...editingUser,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          permissions: formData.permissions
        };
        await updateUser(updatedUser);
        // Update project assignments
        updateProjectAssignments(editingUser.id, formData.role);
        addToast('Usuario actualizado correctamente.', 'success');
      } else {
        // Add new user via RPC invite
        if (!canAddUser) {
          addToast('Has alcanzado el límite de usuarios de tu plan actual.', 'error');
          return;
        }

        // We only need email and role for the invite
        const userToInvite: User = {
          ...initialUserState,
          id: '', // Will be resolved by backend
          email: formData.email,
          role: formData.role,
          permissions: formData.permissions, // Will be set by RPC logic defaults for now
          createdAt: '',
          lastLogin: ''
        };

        await addUser(userToInvite);
        addToast('Usuario agregado correctamente al equipo.', 'success');
      }
      cancelEditing();
    } catch (error: any) {
      addToast(error.message || 'Error al procesar la solicitud.', 'error');
    }
  };

  const handleRemove = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      removeUser(id);
      addToast('Usuario eliminado.', 'success');
    }
  };

  // Helper to get assigned projects for a user
  const getUserProjects = (userId: string) => {
    return proyectos.filter(p => p.usuarios.some(u => u.userId === userId));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestión de Equipo</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Administra los usuarios que tienen acceso a tu cuenta. 
              <span className="block mt-1 text-xs text-amber-600 dark:text-amber-500">
                Nota: Para agregar un usuario, este debe haberse registrado previamente en el sistema con su email.
              </span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-muted-foreground">Plan Actual: <span className="text-primary font-bold">{currentPlan.name}</span></div>
            <div className={`text-lg font-bold ${userCount >= maxUsers ? 'text-red-500' : 'text-green-600'}`}>
              {userCount} / {maxUsers === 9999 ? 'Ilimitados' : maxUsers} Usuarios
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isAdding ? (
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIsAdding(true)} disabled={!canAddUser}>
                <UserPlus className="mr-2 h-4 w-4" />
                Agregar Usuario
              </Button>
            </div>
          ) : (
            <div className="bg-muted/30 p-4 rounded-lg mb-6 border border-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                <Button variant="ghost" size="sm" onClick={cancelEditing}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Nombre"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej. Juan Pérez"
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="juan@empresa.com"
                    disabled={!!editingUser} // Disable email editing for simplicity as it's the ID often
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Rol</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="tecnico">Técnico</option>
                      <option value="residente">Residente</option>
                      <option value="gerente">Gerente</option>
                      <option value="administrador">Administrador</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Permisos de Acceso</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-background p-4 rounded-md border border-input">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="access_proyectos" 
                        checked={formData.permissions.access_proyectos} 
                        onChange={handlePermissionChange}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Proyectos</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="access_muestras" 
                        checked={formData.permissions.access_muestras} 
                        onChange={handlePermissionChange}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Muestras</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="access_ensayos" 
                        checked={formData.permissions.access_ensayos} 
                        onChange={handlePermissionChange}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Ensayos</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="access_certificados" 
                        checked={formData.permissions.access_certificados} 
                        onChange={handlePermissionChange}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Certificados</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="access_resultados" 
                        checked={formData.permissions.access_resultados} 
                        onChange={handlePermissionChange}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Resultados</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="access_inventarios" 
                        checked={formData.permissions.access_inventarios} 
                        onChange={handlePermissionChange}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Inventarios (Gestión)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="access_reportes" 
                        checked={formData.permissions.access_reportes} 
                        onChange={handlePermissionChange}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Reportes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="access_auditoria" 
                        checked={formData.permissions.access_auditoria} 
                        onChange={handlePermissionChange}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Auditoría</span>
                    </label>
                  </div>
                </div>

                {/* Project Assignment Section - Only relevant if access_proyectos is checked */}
                {(formData.role === 'tecnico' || formData.role === 'residente') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Asignación de Proyectos</label>
                    <div className="bg-background p-4 rounded-md border border-input max-h-48 overflow-y-auto">
                      {proyectos.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-2">No hay proyectos disponibles.</p>
                      ) : (
                        <div className="space-y-2">
                          {proyectos.map(proyecto => (
                            <label key={proyecto.id} className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded">
                              <input 
                                type="checkbox" 
                                checked={assignedProjectIds.includes(proyecto.id)}
                                onChange={(e) => handleProjectAssignmentChange(proyecto.id, e.target.checked)}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <span className="text-sm flex-1">{proyecto.nombre}</span>
                              <span className="text-xs text-muted-foreground">{proyecto.cliente}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Selecciona los proyectos a los que este usuario tendrá acceso.
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="ghost" onClick={cancelEditing}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingUser ? 'Actualizar Usuario' : 'Guardar Usuario'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Proyectos</TableHead>
                <TableHead>Permisos</TableHead>
                <TableHead>Fecha Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const userProjects = getUserProjects(user.id);
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                          ) : (
                            user.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-3 w-3 text-muted-foreground" />
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        {user.role === 'administrador' || user.role === 'gerente' ? (
                          <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded w-fit">Acceso Total</span>
                        ) : userProjects.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {userProjects.slice(0, 2).map(p => (
                              <div key={p.id} className="flex items-center text-xs text-muted-foreground">
                                <Briefcase className="h-3 w-3 mr-1" />
                                <span className="truncate max-w-[150px]">{p.nombre}</span>
                              </div>
                            ))}
                            {userProjects.length > 2 && (
                              <span className="text-xs text-muted-foreground pl-4">+{userProjects.length - 2} más...</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Sin asignar</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {user.permissions?.access_proyectos && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800" title="Proyectos">P</span>}
                        {user.permissions?.access_muestras && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800" title="Muestras">M</span>}
                        {user.permissions?.access_ensayos && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800" title="Ensayos">E</span>}
                        {user.permissions?.access_certificados && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800" title="Certificados">C</span>}
                        {user.permissions?.access_resultados && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800" title="Resultados">R</span>}
                        {user.permissions?.access_inventarios && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800" title="Inventarios">I</span>}
                        {(!user.permissions || Object.values(user.permissions).every(p => !p)) && <span className="text-xs text-muted-foreground">Ninguno</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(user)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(user.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={user.role === 'administrador' && users.filter(u => u.role === 'administrador').length === 1} // Prevent deleting last admin
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

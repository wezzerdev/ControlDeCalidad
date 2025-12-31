import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, mockUsers } from '../data/mockData';
import { useAuth } from './AuthContext';

export interface CompanyInfo {
  id?: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  logoUrl?: string;
  planId: string;
}

interface CompanyContextType {
  companyInfo: CompanyInfo;
  users: User[];
  updateCompanyInfo: (info: CompanyInfo) => Promise<void>;
  updatePlan: (planId: string) => Promise<void>;
  // User management is now handled via Supabase Auth / Profiles
  // but we keep these for compatibility with existing UI
  addUser: (user: User) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  retryCompanySetup: () => Promise<void>;
}

const defaultCompanyInfo: CompanyInfo = {
  name: 'LABORATORIO DE CONSTRUCCIÓN',
  address: 'Av. Principal 123, Zona Industrial',
  city: 'Ciudad de México, CDMX',
  phone: '(55) 1234-5678',
  email: 'contacto@laboratorio.com',
  planId: 'free'
};

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo);
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useAuth(); // Re-fetch if user logs in

  useEffect(() => {
    fetchCompanySettings();
    fetchUsers();
  }, [user]);

  const fetchCompanySettings = async () => {
    if (!user) return;
    
    try {
      // 1. Get my company_id securely using the view or just trying to select
      // Since we applied RLS for "Users can view own company", we can just query the table directly if we have the ID.
      // But first we need the ID from the profile.
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile for company settings:', profileError);
        return;
      }
        
      if (profile?.company_id) {
        // I have a company assigned
        const { data, error: companyError } = await supabase
          .from('company_settings')
          .select('*')
          .eq('id', profile.company_id)
          .single();
          
        if (companyError) {
           console.error('Error fetching company details:', companyError);
        }

        if (data) {
          setCompanyInfo({
            id: data.id,
            name: data.name,
            address: data.address || '',
            city: data.city || '',
            phone: data.phone || '',
            email: data.email || '',
            logoUrl: data.logo_url,
            planId: data.plan_id || 'free'
          });
        }
      } else if (user.role === 'administrador') {
        // I am admin but have no company_id in profile.
        // This happens on first login after migration or registration.
        // Let's create one for me.
        
        console.log('Admin without company, creating new...');
        
        const { data: newCompany, error } = await supabase
          .from('company_settings')
          .insert({ name: 'Mi Laboratorio' })
          .select()
          .single();
          
        if (newCompany && !error) {
          // Link profile to company
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ company_id: newCompany.id })
            .eq('id', user.id);
          
          if (updateError) {
            console.error('Error linking profile to new company:', updateError);
            // Consider rolling back company creation or retry?
          } else {
             setCompanyInfo({
              id: newCompany.id,
              name: newCompany.name,
              address: '',
              city: '',
              phone: '',
              email: '',
              logoUrl: null,
              planId: 'free'
            });
          }
          
          // Force refresh user profile in AuthContext might be needed, but local state update is fine for now
        } else {
           console.error('Failed to create company:', error);
        }
      }
    } catch (error) {
      console.error('Error loading company settings', error);
    }
  };

  const fetchUsers = async () => {
    if (!user) return;

    try {
      // Use the RPC function to get company ID safely to avoid recursion in client-side queries too if we were to use the same logic
      // But here we just need the ID to filter.
      // Actually, let's use the same approach as fetchCompanySettings: trust the user.id -> profile -> company_id flow
      // The recursion happens in the DB RLS.
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
        
      if (!profile?.company_id) {
        setUsers([]);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', profile.company_id);

      if (data) {
        const mappedUsers: User[] = data.map(u => ({
          id: u.id,
          email: u.email || '',
          name: u.name,
          role: u.role,
          avatar: u.avatar_url,
          permissions: u.permissions,
          preferences: u.preferences,
          createdAt: u.created_at,
          lastLogin: u.last_login,
          companyId: u.company_id,
          isOwner: u.is_owner
        }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error('Error loading users', error);
    }
  };

  const updateCompanyInfo = async (info: CompanyInfo) => {
    try {
      if (!user) return;

      // Ensure we are updating the correct company linked to the user
      // Or if admin, the company they are managing
      
      let targetCompanyId = info.id;
      
      if (!targetCompanyId) {
          // Try to resolve from profile if not provided in info object
          const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();
            
          targetCompanyId = profile?.company_id;
      }

      if (!targetCompanyId) {
          console.error("No company ID found to update");
          return;
      }

      const { error: updateError } = await supabase
        .from('company_settings')
        .update({
          name: info.name,
          address: info.address,
          city: info.city,
          phone: info.phone,
          email: info.email,
          logo_url: info.logoUrl,
          plan_id: info.planId
        })
        .eq('id', targetCompanyId);

      if (updateError) throw updateError;
      
      // Update local state immediately for UI responsiveness
      setCompanyInfo({ ...info, id: targetCompanyId });
      
    } catch (error) {
      console.error('Error updating company info', error);
      throw error;
    }
  };

  const updatePlan = async (planId: string) => {
    const newInfo = { ...companyInfo, planId };
    await updateCompanyInfo(newInfo);
  };

  const addUser = async (userToAdd: User) => {
    if (!user) return;
    
    try {
       const { data, error } = await supabase.rpc('add_user_to_company', {
         target_email: userToAdd.email,
         target_role: userToAdd.role,
         target_permissions: userToAdd.permissions
       });

       if (error) {
         console.error('RPC Error:', error);
         throw new Error(error.message);
       }

       if (data && !data.success) {
         throw new Error(data.message);
       }

       // Refresh users list
       fetchUsers();
       
    } catch (error: any) {
      console.error('Error adding user to team', error);
      throw error; // Propagate to UI
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updatedUser.name,
          role: updatedUser.role,
          permissions: updatedUser.permissions,
          preferences: updatedUser.preferences
        })
        .eq('id', updatedUser.id);

      if (error) throw error;
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    } catch (error) {
      console.error('Error updating user', error);
      throw error; // Propagate error to caller
    }
  };

  const removeUser = async (userId: string) => {
    // We cannot delete auth users from client, but we can perhaps mark them inactive or delete profile?
    // For now, we'll try to delete the profile, but Auth user will remain.
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error removing user', error);
    }
  };

  const retryCompanySetup = async () => {
    await fetchCompanySettings();
  };

  return (
    <CompanyContext.Provider value={{ 
      companyInfo, 
      users, 
      isLoading,
      updateCompanyInfo, 
      updatePlan,
      addUser,
      updateUser,
      removeUser,
      retryCompanySetup
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}

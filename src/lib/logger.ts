import { supabase } from './supabase';

export type LogAction = 'create' | 'update' | 'delete' | 'login' | 'audit' | 'approve' | 'reject';
export type LogEntity = 'muestra' | 'ensayo' | 'usuario' | 'proyecto' | 'norma' | 'certificado';

export async function logActivity(
  action: LogAction,
  entity: LogEntity,
  entityId: string | undefined,
  details: any = {}
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get company_id from profile if needed, or store it in metadata
    // For now, we just log the user_id
    
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action,
      entity,
      entity_id: entityId,
      details
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw, we don't want to block the main action if logging fails
  }
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  link?: string
) {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      link
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export async function notifyRoles(
  roles: string[],
  title: string,
  message: string,
  excludeUserId?: string,
  link?: string
) {
  try {
    // 1. Get users with these roles
    let query = supabase.from('profiles').select('id, role');
    
    // Simple "OR" logic for roles
    // Supabase .in() works for checking a column against an array
    query = query.in('role', roles);
    
    const { data: users, error } = await query;
    
    if (error || !users) return;

    // 2. Filter excluded user
    const recipients = users.filter(u => u.id !== excludeUserId);

    if (recipients.length === 0) return;

    // 3. Prepare inserts
    const notifications = recipients.map(u => ({
      user_id: u.id,
      title,
      message,
      type: 'info',
      link
    }));

    // 4. Batch insert
    await supabase.from('notifications').insert(notifications);
    
  } catch (error) {
    console.error('Error notifying roles:', error);
  }
}

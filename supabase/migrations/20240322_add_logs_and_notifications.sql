-- Create Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', etc.
  entity TEXT NOT NULL, -- 'muestra', 'ensayo', 'usuario', etc.
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  company_id UUID, -- For multi-tenant filtering if needed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all logs
CREATE POLICY "Admins can view all activity logs" 
ON activity_logs FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Policy: Users can insert their own logs (triggered by frontend)
CREATE POLICY "Users can insert activity logs" 
ON activity_logs FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);


-- Create Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- The recipient
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own notifications
CREATE POLICY "Users can view own notifications" 
ON notifications FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" 
ON notifications FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy: System/Users can insert notifications for others
CREATE POLICY "Users can insert notifications" 
ON notifications FOR INSERT 
TO authenticated 
WITH CHECK (true); -- Allow any authenticated user to send a notification (backend logic will control who sends to whom)

-- Grant access to public (if needed for some edge cases, but usually authenticated)
GRANT ALL ON activity_logs TO authenticated;
GRANT ALL ON notifications TO authenticated;

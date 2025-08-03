import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type UserRole = 'admin' | 'moderator' | 'user';

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  assigned_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserWithRole {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  role: UserRole | null;
}

export const useUserRoles = (userId?: string) => {
  return useQuery({
    queryKey: ["user-roles", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId);
      
      if (error) throw error;
      return data as UserRoleData[];
    },
    enabled: !!userId,
  });
};

export const useAllUsersWithRoles = () => {
  return useQuery({
    queryKey: ["all-users-with-roles"],
    queryFn: async () => {
      // Get all profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, username, full_name");
      
      if (profilesError) throw profilesError;
      
      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      
      if (rolesError) throw rolesError;
      
      // Combine profiles with roles
      const usersWithRoles = profiles.map(profile => {
        const userRole = roles.find(role => role.user_id === profile.user_id);
        return {
          id: profile.user_id,
          email: '', // We'll need to get this from auth if needed
          username: profile.username,
          full_name: profile.full_name,
          role: userRole?.role as UserRole || 'user'
        };
      });
      
      return usersWithRoles as UserWithRole[];
    },
  });
};

export const useCurrentUserRole = () => {
  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  return useQuery({
    queryKey: ["current-user-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase.rpc('get_user_role', {
        _user_id: user.id
      });
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = function not found, which is OK
      return data as UserRole | null;
    },
    enabled: !!user?.id,
  });
};

export const useAssignRole = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: UserRole;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // First, remove existing role
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      // Then insert new role
      const { data, error } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role,
          assigned_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Rol asignado",
        description: "El rol se ha asignado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      queryClient.invalidateQueries({ queryKey: ["all-users-with-roles"] });
      queryClient.invalidateQueries({ queryKey: ["current-user-role"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al asignar rol",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useIsAdminOrModerator = () => {
  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  return useQuery({
    queryKey: ["is-admin-or-moderator", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase.rpc('is_admin_or_moderator', {
        _user_id: user.id
      });
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as boolean || false;
    },
    enabled: !!user?.id,
  });
};
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}

export const useAuth = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return {
        id: user.id,
        email: user.email!,
        ...profile,
      } as User;
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      username,
      full_name,
    }: {
      email: string;
      password: string;
      username: string;
      full_name: string;
    }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name,
          },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "¡Registro exitoso!",
        description: "Revisa tu email para confirmar tu cuenta.",
      });
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error en el registro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const signInMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error en el inicio de sesión",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      queryClient.clear();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp: signUpMutation.mutateAsync,
    signIn: signInMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    isSigningUp: signUpMutation.isPending,
    isSigningIn: signInMutation.isPending,
    isSigningOut: signOutMutation.isPending,
  };
};
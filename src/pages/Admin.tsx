import { useAuth } from "@/hooks/useAuth";
import { useCurrentUserRole } from "@/hooks/useUserRoles";
import { UserRoleManager } from "@/components/admin/UserRoleManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Shield, Users, Settings } from "lucide-react";
import { Navigate } from "react-router-dom";

export const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const { data: userRole, isLoading } = useCurrentUserRole();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <Shield className="h-16 w-16 text-muted-foreground/30 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
            <p className="text-muted-foreground">
              No tienes permisos para acceder al panel de administración.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <Crown className="h-3 w-3 mr-1" />
            Administrador
          </Badge>
        );
      case 'moderator':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Shield className="h-3 w-3 mr-1" />
            Moderador
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <Users className="h-3 w-3 mr-1" />
            Usuario
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Panel de Administración
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona usuarios y configuraciones del foro
          </p>
        </div>
        {getRoleBadge(userRole)}
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información del Administrador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="font-medium">{user?.full_name || user?.username || 'Usuario'}</p>
              <p className="text-sm text-muted-foreground">@{user?.username}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            {getRoleBadge(userRole)}
          </div>
        </CardContent>
      </Card>

      {/* Admin Features */}
      <div className="grid gap-6">
        <UserRoleManager />
        
        {/* Future admin features can be added here */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Próximamente: estadísticas de posts, comentarios, usuarios activos, etc.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
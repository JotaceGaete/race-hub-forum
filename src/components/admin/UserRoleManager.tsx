import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAllUsersWithRoles, useAssignRole, useCurrentUserRole, UserRole } from "@/hooks/useUserRoles";
import { Shield, Users, Crown } from "lucide-react";

const roleIcons = {
  admin: Crown,
  moderator: Shield,
  user: Users,
};

const roleColors = {
  admin: "bg-red-100 text-red-800 border-red-200",
  moderator: "bg-blue-100 text-blue-800 border-blue-200",
  user: "bg-gray-100 text-gray-800 border-gray-200",
};

const roleLabels = {
  admin: "Administrador",
  moderator: "Moderador", 
  user: "Usuario",
};

export const UserRoleManager = () => {
  const { data: users, isLoading } = useAllUsersWithRoles();
  const { data: currentUserRole } = useCurrentUserRole();
  const assignRole = useAssignRole();
  const [selectedRoles, setSelectedRoles] = useState<Record<string, UserRole>>({});

  const handleRoleChange = (userId: string, role: UserRole) => {
    setSelectedRoles(prev => ({ ...prev, [userId]: role }));
  };

  const handleAssignRole = async (userId: string) => {
    const role = selectedRoles[userId];
    if (!role) return;

    await assignRole.mutateAsync({ userId, role });
    setSelectedRoles(prev => {
      const newRoles = { ...prev };
      delete newRoles[userId];
      return newRoles;
    });
  };

  if (currentUserRole !== 'admin') {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No tienes permisos para acceder a esta sección.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Cargando usuarios...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Gestión de Roles de Usuario
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users?.map((user) => {
            const IconComponent = roleIcons[user.role];
            const selectedRole = selectedRoles[user.id];
            
            return (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-4 w-4" />
                  <div>
                    <p className="font-medium">
                      {user.full_name || user.username || 'Usuario sin nombre'}
                    </p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className={roleColors[user.role]}>
                    {roleLabels[user.role]}
                  </Badge>
                  
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedRole || ""}
                      onValueChange={(value: UserRole) => handleRoleChange(user.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Cambiar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="moderator">Moderador</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      onClick={() => handleAssignRole(user.id)}
                      disabled={!selectedRole || selectedRole === user.role || assignRole.isPending}
                      size="sm"
                    >
                      {assignRole.isPending ? "Asignando..." : "Asignar"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
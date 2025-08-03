import { useParams, useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfiles";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { ProfileEditModal } from "@/components/profile/ProfileEditModal";

export const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const { data: profile, isLoading, error } = useProfile(username || "");

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="ml-4 flex-1">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Usuario no encontrado</h1>
          <p className="text-muted-foreground mb-6">
            El perfil que buscas no existe o ha sido eliminado.
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === profile.user_id;

  const getInitials = (name?: string | null, username?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          
          {isOwnProfile && (
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="outline"
              size="sm"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar perfil
            </Button>
          )}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {getInitials(profile.full_name, profile.username)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">
                  {profile.full_name || profile.username || "Usuario"}
                </h1>
                {isOwnProfile && (
                  <Badge variant="secondary">Tu perfil</Badge>
                )}
              </div>
              {profile.username && (
                <p className="text-muted-foreground">@{profile.username}</p>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {profile.bio ? (
              <p className="text-foreground leading-relaxed">{profile.bio}</p>
            ) : (
              <p className="text-muted-foreground italic">
                {isOwnProfile 
                  ? "Agrega una biografía para que otros sepan más sobre ti." 
                  : "Este usuario no ha agregado una biografía."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentProfile={profile}
      />
    </div>
  );
};
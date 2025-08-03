import { Button } from "@/components/ui/button";
import { Calendar, Plus, Users, LogIn } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuth } from "@/hooks/useAuth";

interface ForumHeaderProps {
  onCreatePost: () => void;
  onCreateRace: () => void;
  onShowAuth: () => void;
}

export const ForumHeader = ({ onCreatePost, onCreateRace, onShowAuth }: ForumHeaderProps) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-gradient-forum p-6 rounded-lg shadow-card mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/ee5000c6-0d5b-4104-a587-05cdaac2aabf.png" 
            alt="Chileneros" 
            className="h-12 w-auto"
          />
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button
                onClick={onCreatePost}
                variant="secondary"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Post
              </Button>
              <Button
                onClick={onCreateRace}
                className="bg-forum-race text-white hover:bg-forum-race/90"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Anunciar Carrera
              </Button>
              <UserMenu />
            </>
          ) : (
            <Button
              onClick={onShowAuth}
              variant="secondary"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Iniciar Sesión
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
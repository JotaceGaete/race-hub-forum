import { Button } from "@/components/ui/button";
import { Calendar, Plus, Users } from "lucide-react";

interface ForumHeaderProps {
  onCreatePost: () => void;
  onCreateRace: () => void;
}

export const ForumHeader = ({ onCreatePost, onCreateRace }: ForumHeaderProps) => {
  return (
    <div className="bg-gradient-forum p-6 rounded-lg shadow-card mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Foro de Carreras
          </h1>
          <p className="text-white/90">
            Comparte, descubre y conecta con la comunidad runner
          </p>
        </div>
        <div className="flex gap-3">
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
        </div>
      </div>
    </div>
  );
};
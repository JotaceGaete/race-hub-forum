import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdminOrModerator } from "@/hooks/useUserRoles";
import { useEditComment, useDeleteComment } from "@/hooks/useEditComment";
import { Comment } from "@/hooks/useComments";
import { MediaUploadSection } from "./MediaUploadSection";
import { MediaDisplay } from "./MediaDisplay";

interface CommentActionsProps {
  comment: Comment;
}

export const CommentActions = ({ comment }: CommentActionsProps) => {
  const { user } = useAuth();
  const { data: isAdminOrModerator = false } = useIsAdminOrModerator();
  const editComment = useEditComment();
  const deleteComment = useDeleteComment();
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editMediaUrls, setEditMediaUrls] = useState<string[]>(comment.media_urls || []);
  const [editMediaTypes, setEditMediaTypes] = useState<string[]>(comment.media_types || []);

  // Check if user can edit/delete this comment
  const canEdit = user && (user.id === comment.user_id || isAdminOrModerator);
  const canDelete = user && (user.id === comment.user_id || isAdminOrModerator);

  if (!canEdit && !canDelete) {
    return null;
  }

  const handleEdit = async () => {
    await editComment.mutateAsync({
      commentId: comment.id,
      content: editContent,
      media_urls: editMediaUrls.length > 0 ? editMediaUrls : undefined,
      media_types: editMediaTypes.length > 0 ? editMediaTypes : undefined,
    });
    setIsEditOpen(false);
  };

  const handleDelete = async () => {
    await deleteComment.mutateAsync(comment.id);
  };

  const handleMediaUpdate = (urls: string[], types: string[]) => {
    setEditMediaUrls(urls);
    setEditMediaTypes(types);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canEdit && (
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Editar Comentario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Escribe tu comentario..."
                  className="min-h-[100px]"
                />
                
                {editMediaUrls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Archivos adjuntos actuales:</p>
                    <MediaDisplay 
                      mediaUrls={editMediaUrls} 
                      mediaTypes={editMediaTypes}
                    />
                  </div>
                )}
                
                <MediaUploadSection
                  onMediaUploaded={(media) => {
                    if (Array.isArray(media)) {
                      const urls = media.map(m => m.url);
                      const types = media.map(m => m.type === 'image' ? 'image/*' : 'video/*');
                      setEditMediaUrls([...editMediaUrls, ...urls]);
                      setEditMediaTypes([...editMediaTypes, ...types]);
                    }
                  }}
                  folder="comments"
                />
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleEdit}
                    disabled={editComment.isPending || !editContent.trim()}
                  >
                    {editComment.isPending ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar comentario?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. El comentario será eliminado permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={deleteComment.isPending}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {deleteComment.isPending ? "Eliminando..." : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
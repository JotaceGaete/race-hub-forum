import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, ArrowDown, MessageSquare, Clock, Send, Edit, Trash2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useComments, useCreateComment, Comment } from "@/hooks/useComments";
import { usePostVotes, useVotePost } from "@/hooks/useVotes";
import { useToast } from "@/hooks/use-toast";
import { MediaUploadSection } from "./MediaUploadSection";
import { MediaDisplay } from "./MediaDisplay";
import { MediaUpload } from "@/hooks/useMediaUpload";
import { AuthorLink } from "@/components/profile/AuthorLink";

interface Post {
  id: string;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
  user_id?: string;
  category?: {
    name: string;
    color: string;
  };
  profile?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface PostDetailsModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
}

export const PostDetailsModal = ({ post, isOpen, onClose, onEdit, onDelete }: PostDetailsModalProps) => {
  const [commentText, setCommentText] = useState("");
  const [commentMedia, setCommentMedia] = useState<MediaUpload[]>([]);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const { data: comments = [], isLoading: commentsLoading } = useComments(post?.id || "");
  const createComment = useCreateComment();
  const { data: voteStats } = usePostVotes(post?.id || "");
  const votePost = useVotePost();
  
  if (!post) return null;

  const handleVote = async (voteType: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para votar",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await votePost.mutateAsync({ postId: post.id, voteType });
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para comentar",
        variant: "destructive"
      });
      return;
    }

    try {
      const mediaUrls = commentMedia.map(media => media.url);
      const mediaTypes = commentMedia.map(media => media.type === 'image' ? 'image/jpeg' : 'video/mp4');
      
      await createComment.mutateAsync({
        post_id: post.id,
        content: commentText.trim(),
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
        media_types: mediaTypes.length > 0 ? mediaTypes : undefined
      });
      
      setCommentText("");
      setCommentMedia([]);
      toast({
        title: "Comentario publicado",
        description: "Tu comentario se ha publicado exitosamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo publicar el comentario",
        variant: "destructive"
      });
    }
  };

  const getCategoryStyles = (categoryName?: string) => {
    switch (categoryName) {
      case 'Próximas Carreras':
        return 'bg-forum-race/10 border-forum-race text-forum-race';
      case 'General':
        return 'bg-forum-general/10 border-forum-general text-forum-general';
      case 'Entrenamiento':
        return 'bg-forum-training/10 border-forum-training text-forum-training';
      case 'Equipamiento':
        return 'bg-forum-equipment/10 border-forum-equipment text-forum-equipment';
      default:
        return 'bg-primary/10 border-primary text-primary';
    }
  };

  const canEditOrDelete = user && post.user_id && user.id === post.user_id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {post.category && (
                  <Badge className={getCategoryStyles(post.category.name)}>
                    {post.category.name}
                  </Badge>
                )}
                <div className="flex items-center text-muted-foreground text-sm">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDistanceToNow(new Date(post.created_at), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </div>
              </div>
              <DialogTitle className="text-2xl font-bold">
                {post.title}
              </DialogTitle>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-muted-foreground">por</span>
                <AuthorLink
                  username={post.profile?.username}
                  full_name={post.profile?.full_name}
                  avatar_url={post.profile?.avatar_url}
                  author_name={post.author_name}
                  showAvatar={false}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Voting buttons */}
              <div className="flex flex-col items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`p-1 h-auto ${voteStats?.userVote === 1 ? 'bg-forum-upvote/20' : ''}`}
                  onClick={() => handleVote(1)}
                  disabled={!isAuthenticated}
                >
                  <ArrowUp className={`w-4 h-4 ${voteStats?.userVote === 1 ? 'text-forum-upvote' : 'text-muted-foreground'}`} />
                </Button>
                <span className="text-sm font-medium">{voteStats?.total || 0}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`p-1 h-auto ${voteStats?.userVote === -1 ? 'bg-forum-downvote/20' : ''}`}
                  onClick={() => handleVote(-1)}
                  disabled={!isAuthenticated}
                >
                  <ArrowDown className={`w-4 h-4 ${voteStats?.userVote === -1 ? 'text-forum-downvote' : 'text-muted-foreground'}`} />
                </Button>
              </div>

              {/* Edit/Delete buttons */}
              {canEditOrDelete && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit?.(post)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete?.(post.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Post content */}
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Comments section */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-forum-general" />
              <h3 className="text-lg font-semibold">
                Comentarios ({comments.length})
              </h3>
            </div>

            {/* Add comment form */}
            {isAuthenticated ? (
              <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escribe tu comentario..."
                  className="mb-3 resize-none"
                  rows={3}
                />
                
                <MediaUploadSection
                  onMediaUploaded={setCommentMedia}
                  maxFiles={4}
                  folder="comments"
                />
                
                <div className="flex justify-end mt-3">
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || createComment.isPending}
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {createComment.isPending ? "Publicando..." : "Publicar comentario"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-muted/30 rounded-lg text-center">
                <p className="text-muted-foreground">
                  Inicia sesión para dejar un comentario
                </p>
              </div>
            )}

            {/* Comments list */}
            {commentsLoading ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Cargando comentarios...</p>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <div key={comment.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-primary/70 bg-primary/10 px-2 py-0.5 rounded">
                          #{index + 1}
                        </span>
                        <AuthorLink
                          username={comment.user.username}
                          full_name={comment.user.full_name}
                          avatar_url={comment.user.avatar_url}
                          showAvatar={true}
                        />
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.created_at), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                    <MediaDisplay 
                      mediaUrls={comment.media_urls} 
                      mediaTypes={comment.media_types} 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Sé el primero en comentar
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
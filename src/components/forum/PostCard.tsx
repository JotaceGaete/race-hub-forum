import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, MessageSquare, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { usePostVotes, useVotePost } from "@/hooks/useVotes";
import { useAuth } from "@/hooks/useAuth";

interface Post {
  id: string;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
  category?: {
    name: string;
    color: string;
  };
}

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

export const PostCard = ({ post, onClick }: PostCardProps) => {
  const { data: voteStats } = usePostVotes(post.id);
  const votePost = useVotePost();
  const { isAuthenticated } = useAuth();

  const handleVote = async (voteType: number) => {
    if (!isAuthenticated) return;
    
    try {
      await votePost.mutateAsync({ postId: post.id, voteType });
    } catch (error) {
      console.error("Error voting:", error);
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

  return (
    <Card className="cursor-pointer transition-all duration-200 hover:shadow-hover" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
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
            <h3 className="text-lg font-semibold mb-2 line-clamp-2">{post.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">por {post.author_name}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`p-1 h-auto ${voteStats?.userVote === 1 ? 'bg-forum-upvote/20' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleVote(1);
              }}
              disabled={!isAuthenticated}
            >
              <ArrowUp className={`w-4 h-4 ${voteStats?.userVote === 1 ? 'text-forum-upvote' : 'text-muted-foreground'}`} />
            </Button>
            <span className="text-sm font-medium">{voteStats?.total || 0}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`p-1 h-auto ${voteStats?.userVote === -1 ? 'bg-forum-downvote/20' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleVote(-1);
              }}
              disabled={!isAuthenticated}
            >
              <ArrowDown className={`w-4 h-4 ${voteStats?.userVote === -1 ? 'text-forum-downvote' : 'text-muted-foreground'}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {post.content}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>0 comentarios</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
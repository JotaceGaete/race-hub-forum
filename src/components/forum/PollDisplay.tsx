import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { usePoll } from "@/hooks/usePolls";
import { usePollVotes, useVotePoll } from "@/hooks/usePollVotes";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Users } from "lucide-react";

interface PollDisplayProps {
  postId: string;
  compact?: boolean;
}

export const PollDisplay: React.FC<PollDisplayProps> = ({ postId, compact = false }) => {
  const { user, isAuthenticated } = useAuth();
  const { data: poll, isLoading: pollLoading } = usePoll(postId);
  const { data: voteStats, isLoading: votesLoading } = usePollVotes(poll?.id || "skip");
  const { mutateAsync: votePoll, isPending: isVoting } = useVotePoll();
  const { toast } = useToast();

  if (pollLoading || votesLoading || !poll) return null;

  const handleVote = async (optionId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión requerida",
        description: "Debes iniciar sesión para participar en la encuesta.",
        variant: "destructive",
      });
      return;
    }

    try {
      await votePoll({ pollId: poll.id, optionId });
      toast({
        title: "Voto registrado",
        description: "Tu voto ha sido registrado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error al votar",
        description: "No se pudo registrar tu voto. Inténtalo nuevamente.",
        variant: "destructive",
      });
    }
  };

  const getTotalVotes = () => {
    return poll.options.reduce((total, option) => total + (option.vote_count || 0), 0);
  };

  const getPercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  const totalVotes = getTotalVotes();
  const hasVoted = voteStats?.hasVoted || false;
  const userVoteOptionId = voteStats?.userVote;

  if (compact) {
    return (
      <div className="bg-muted/50 rounded-lg p-3 mt-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">📊 {poll.question}</span>
          <div className="flex items-center text-xs text-muted-foreground">
            <Users className="h-3 w-3 mr-1" />
            {totalVotes} votos
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-border mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          📊 {poll.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isAuthenticated ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>Debes iniciar sesión para participar en esta encuesta</p>
          </div>
        ) : !hasVoted ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-3">
              Selecciona una opción para ver los resultados:
            </p>
            {poll.options.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleVote(option.id)}
                disabled={isVoting}
              >
                {option.option_text}
              </Button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {poll.options.map((option) => {
              const percentage = getPercentage(option.vote_count || 0, totalVotes);
              const isUserChoice = option.id === userVoteOptionId;

              return (
                <div key={option.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={isUserChoice ? "font-semibold" : ""}>
                        {option.option_text}
                      </span>
                      {isUserChoice && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <span className="text-muted-foreground">
                      {option.vote_count || 0} votos ({percentage}%)
                    </span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                </div>
              );
            })}

            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{totalVotes} personas han votado</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote(userVoteOptionId || "")}
                disabled={isVoting}
                className="text-xs"
              >
                Cambiar mi voto
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
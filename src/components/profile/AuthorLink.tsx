import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AuthorLinkProps {
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  author_name?: string;
  className?: string;
  showAvatar?: boolean;
}

export const AuthorLink = ({
  username,
  full_name,
  avatar_url,
  author_name,
  className = "",
  showAvatar = true,
}: AuthorLinkProps) => {
  const displayName = full_name || username || author_name || "Usuario";
  const initials = full_name
    ? full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : username
    ? username.slice(0, 2).toUpperCase()
    : author_name
    ? author_name.slice(0, 2).toUpperCase()
    : "U";

  if (!username) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showAvatar && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={avatar_url || undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        )}
        <span className="text-sm font-medium text-muted-foreground">
          {displayName}
        </span>
      </div>
    );
  }

  return (
    <Link
      to={`/perfil/${username}`}
      className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}
    >
      {showAvatar && (
        <Avatar className="h-6 w-6">
          <AvatarImage src={avatar_url || undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      )}
      <span className="text-sm font-medium text-primary hover:underline">
        {displayName}
      </span>
    </Link>
  );
};
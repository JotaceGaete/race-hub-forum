import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCategories } from "@/hooks/useCategories";
import { useCreatePost } from "@/hooks/usePosts";
import { useCreatePoll } from "@/hooks/usePolls";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PollCreator } from "./PollCreator";

interface PostCreateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PollData {
  question: string;
  options: string[];
}

export const PostCreateForm: React.FC<PostCreateFormProps> = ({ open, onOpenChange }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pollData, setPollData] = useState<PollData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories } = useCategories();
  const { mutateAsync: createPost } = useCreatePost();
  const { mutateAsync: createPoll } = useCreatePoll();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear un post.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !content.trim() || !categoryId) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the post
      const post = await createPost({
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId,
        author_name: user.username || user.full_name || user.email,
      });

      // Create poll if provided
      if (pollData && pollData.question.trim() && pollData.options.length >= 2) {
        await createPoll({
          postId: post.id,
          question: pollData.question.trim(),
          options: pollData.options,
        });
      }

      toast({
        title: "¡Post creado!",
        description: "Tu post ha sido publicado correctamente.",
      });

      // Reset form
      setTitle("");
      setContent("");
      setCategoryId("");
      setPollData(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el post. Inténtalo nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del post"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Categoría</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="content">Contenido</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe el contenido de tu post..."
              className="mt-1 min-h-[120px]"
              required
            />
          </div>

          <PollCreator onPollChange={setPollData} />

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Publicando..." : "Publicar Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
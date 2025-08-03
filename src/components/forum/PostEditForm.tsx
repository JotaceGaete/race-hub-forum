import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCategories } from "@/hooks/useCategories";
import { Save, X } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  category_id: string | null;
  category?: {
    name: string;
    color: string;
  };
}

interface PostEditFormProps {
  post: Post;
  onSubmit: (postData: { id: string; title: string; content: string; category_id: string }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const PostEditForm = ({ post, onSubmit, onCancel, isSubmitting = false }: PostEditFormProps) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content || "");
  const [categoryId, setCategoryId] = useState(post.category_id || "");
  
  const { data: categories = [] } = useCategories();

  useEffect(() => {
    setTitle(post.title);
    setContent(post.content || "");
    setCategoryId(post.category_id || "");
  }, [post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !categoryId) {
      return;
    }

    onSubmit({
      id: post.id,
      title: title.trim(),
      content: content.trim(),
      category_id: categoryId
    });
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Editar Post</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Título
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Escribe el título del post..."
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Categoría
          </label>
          <Select value={categoryId} onValueChange={setCategoryId} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">
            Contenido
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe el contenido del post..."
            rows={8}
            className="resize-none"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim() || !categoryId}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
};
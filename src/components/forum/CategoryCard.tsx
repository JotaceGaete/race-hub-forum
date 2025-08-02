import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  postCount?: number;
}

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
  isSelected?: boolean;
}

export const CategoryCard = ({ category, onClick, isSelected }: CategoryCardProps) => {
  const getCategoryStyles = (categoryName: string) => {
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
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-hover ${
        isSelected ? 'ring-2 ring-primary shadow-hover' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{category.name}</CardTitle>
          <Badge className={getCategoryStyles(category.name)}>
            <MessageSquare className="w-3 h-3 mr-1" />
            {category.postCount || 0}
          </Badge>
        </div>
        <CardDescription>{category.description}</CardDescription>
      </CardHeader>
    </Card>
  );
};
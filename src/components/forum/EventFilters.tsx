import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface EventFilters {
  location: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  onClearFilters: () => void;
}

export const EventFiltersComponent = ({ filters, onFiltersChange, onClearFilters }: EventFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = filters.location || filters.dateFrom || filters.dateTo;

  const updateFilter = (key: keyof EventFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5 text-primary" />
            Filtros de Búsqueda
            {hasActiveFilters && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                Activos
              </span>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                <X className="w-4 h-4 mr-1" />
                Limpiar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location-filter">Lugar</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="location-filter"
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                placeholder="Buscar por ciudad o país..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha desde</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? (
                      format(filters.dateFrom, "PP", { locale: es })
                    ) : (
                      <span>Fecha inicial</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom || undefined}
                    onSelect={(date) => updateFilter('dateFrom', date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha hasta</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? (
                      format(filters.dateTo, "PP", { locale: es })
                    ) : (
                      <span>Fecha final</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo || undefined}
                    onSelect={(date) => updateFilter('dateTo', date)}
                    disabled={(date) => filters.dateFrom ? date < filters.dateFrom : false}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Filtros activos:</strong>
                {filters.location && ` Lugar: "${filters.location}"`}
                {filters.dateFrom && ` Desde: ${format(filters.dateFrom, "PP", { locale: es })}`}
                {filters.dateTo && ` Hasta: ${format(filters.dateTo, "PP", { locale: es })}`}
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
import * as React from "react";
import { Search, Filter, LayoutGrid, List as ListIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CaseFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
}

export function CaseFilters({ searchTerm, onSearchChange, viewMode = "grid", onViewModeChange }: CaseFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-secondary/30 p-4 rounded-xl border border-border">
      <div className="relative flex-1 w-full">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="البحث برقم القضية، اسم الموكل، أو العنوان..." 
          className="pr-10 bg-background border-border text-foreground focus-visible:ring-legal-gold h-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button variant="outline" className="border-border text-foreground hover:bg-secondary flex-1 sm:flex-none h-10">
          <Filter className="w-4 h-4 ml-2" />
          تصفية
        </Button>
        
        {onViewModeChange && (
          <div className="flex bg-background border border-border rounded-md p-1 h-10">
            <button 
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === 'grid' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === 'list' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

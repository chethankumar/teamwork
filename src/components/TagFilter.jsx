// src/components/TagFilter.jsx
// Displays global tags for filtering tasks by tag
import React from "react";
import useKanbanStore from "../lib/store";
import { Button } from "./ui/button";
import { Tag, X } from "lucide-react";

export default function TagFilter({ filterTags, onToggleTag, onClearFilters }) {
  const { tags } = useKanbanStore();
  
  // Find active tags for the filter
  const hasFilters = filterTags.length > 0;
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
        <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <Tag size={15} className="text-gray-500" />
          {hasFilters ? "Filtered by:" : "Filter by tags:"}
        </span>
        
        {/* Always show all available tags */}
        <div className="flex flex-wrap gap-1.5">
          {tags.length === 0 ? (
            <span className="text-xs text-gray-400 italic">No tags defined</span>
          ) : (
            tags.map((tag) => (
              <button
                key={tag.id}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm hover:opacity-90 transition-all ${filterTags.includes(tag.id) ? 'ring-2 ring-white/50' : ''}`}
                style={{ 
                  backgroundColor: tag.color, 
                  color: '#fff',
                  opacity: filterTags.includes(tag.id) ? 1 : 0.85
                }}
                onClick={() => onToggleTag(tag.id)}
              >
                {tag.name}
                {filterTags.includes(tag.id) && (
                  <span className="ml-1 inline-flex items-center">
                    <X size={10} />
                  </span>
                )}
              </button>
            ))
          )}
        </div>
        
        {/* Show clear button only when filters are active */}
        {hasFilters && (
          <button 
            onClick={onClearFilters}
            className="ml-1 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear all filters"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

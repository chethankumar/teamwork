// src/components/TagFilter.jsx
// Displays global tags for filtering tasks by tag
import React from "react";
import useKanbanStore from "../lib/store";
import { Button } from "./ui/button";

export default function TagFilter({ filterTagId, onChange }) {
  const { tags } = useKanbanStore();
  return (
    <div className="flex gap-2">
      <Button
        className="rounded-full"
        size="sm"
        variant={filterTagId ? "outline" : "default"}
        onClick={() => onChange(null)}
      >
        All
      </Button>
      {tags.map((tag) => (
        <Button
          key={tag.id}
          size="sm"
          className="rounded-full cursor-pointer"
          variant={filterTagId === tag.id ? "default" : "outline"}
          style={{ backgroundColor: tag.color }}
          onClick={() => onChange(filterTagId === tag.id ? null : tag.id)}
        >
          {tag.name}
        </Button>
      ))}
    </div>
  );
}

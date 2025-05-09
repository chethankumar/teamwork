// src/app/page.js
// Replaced default template with Kanban board
"use client";

// src/app/page.js
// Kanban board main page with swimlanes and member/task/tag management

import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import useKanbanStore from "../lib/store";
import DraggableSwimlane from "../components/DraggableSwimlane";
import TagFilter from "../components/TagFilter";
import TagManager from "../components/TagManager";
import { Dialog, DialogTrigger, DialogContent } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Download, Upload } from "lucide-react";

function ExportImportButtons() {
  const state = useKanbanStore();
  // Export handler
  const handleExport = () => {
    const data = JSON.stringify(
      {
        members: state.members,
        tags: state.tags,
        tasks: state.tasks,
      },
      null,
      2
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teamwork-board-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  // Import handler
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target.result);
        if (json.members && json.tasks && json.tags) {
          useKanbanStore.setState({
            members: json.members,
            tags: json.tags,
            tasks: json.tasks,
          });
        } else {
          alert("Invalid board data");
        }
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  return (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleExport}
        className="flex items-center gap-1 cursor-pointer"
      >
        <Download size={16} /> Export
      </Button>
      <label>
        <Button
          asChild
          variant="secondary"
          size="sm"
          className="flex items-center gap-1 cursor-pointer"
        >
          <span>
            <Upload size={16} /> Import
          </span>
        </Button>
        <input
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImport}
        />
      </label>
    </div>
  );
}

export default function Home() {
  const members = useKanbanStore((state) => state.members);
  const addMember = useKanbanStore((state) => state.addMember);
  const [filterTags, setFilterTags] = useState([]);
  const [open, setOpen] = useState(false); // Dialog open state
  const [newMember, setNewMember] = useState("");
  
  // Animation classes for staggered entry
  const getAnimationDelay = (index) => {
    return { animationDelay: `${index * 0.05}s` };
  };
  
  // Handle tag filter changes
  const handleTagFilter = (tagId) => {
    setFilterTags(prevTags => {
      // If tag is already in the filter, remove it
      if (prevTags.includes(tagId)) {
        return prevTags.filter(id => id !== tagId);
      }
      // Otherwise add it to the filter
      return [...prevTags, tagId];
    });
  };
  
  // Clear all tag filters
  const clearTagFilters = () => {
    setFilterTags([]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="flex-none text-xl font-bold pr-10 text-blue-600 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            TeamWorks
          </div>
          <div className="flex-1 text-center max-w-md mx-auto">
            <TagFilter filterTags={filterTags} onToggleTag={handleTagFilter} onClearFilters={clearTagFilters} />
          </div>
          <div className="flex-none flex items-center space-x-3">
            <ExportImportButtons />
            <TagManager />
            {/* Add Member Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                  size="sm"
                >
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-lg shadow-xl border-0">
                <h4 className="font-semibold text-lg mb-3 text-gray-800">Add Team Member</h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newMember.trim()) return;
                    addMember(newMember.trim());
                    setNewMember("");
                    setOpen(false);
                  }}
                  className="flex flex-col gap-4"
                >
                  <Input
                    placeholder="Member name"
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    autoFocus
                    className="rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  />
                  <div className="flex justify-end gap-3 mt-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newMember.trim()}
                      className="bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setOpen(false)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>
        <main className="flex overflow-x-auto py-6 px-4 flex-1 space-x-6 pb-8">
          {members.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200 max-w-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to TeamWorks</h3>
                <p className="text-gray-600 mb-4">Get started by adding team members to track their tasks.</p>
                <Button
                  onClick={() => setOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Add Your First Team Member
                </Button>
              </div>
            </div>
          ) : (
            members.map((member, idx) => (
              <div key={member.id} className="animate-[fadeIn_0.3s_ease-in-out_forwards]" style={getAnimationDelay(idx)}>
                <DraggableSwimlane
                  member={member}
                  filterTags={filterTags}
                  index={idx}
                  memberOrder={members.map((m) => m.id)}
                />
              </div>
            ))
          )}
        </main>
      </div>
    </DndProvider>
  );
}

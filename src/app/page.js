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
  const [filterTag, setFilterTag] = useState(null);
  const [open, setOpen] = useState(false); // Dialog open state
  const [newMember, setNewMember] = useState("");

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-gray-100 min-h-screen flex flex-col">
        <header className="flex justify-between items-center p-4 bg-white shadow-md border-b">
          <div className="flex-none text-xl font-bold pr-10">TeamWorks</div>
          <div className="flex-1 text-center">
            <TagFilter filterTagId={filterTag} onChange={setFilterTag} />
          </div>
          <div className="flex-none flex items-center space-x-2">
            <ExportImportButtons />
            <TagManager />
            {/* Add Member Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  size="sm"
                >
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <h4 className="font-semibold mb-2">Add Team Member</h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newMember.trim()) return;
                    addMember(newMember.trim());
                    setNewMember("");
                    setOpen(false);
                  }}
                  className="flex flex-col gap-3"
                >
                  <Input
                    placeholder="Member name"
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newMember.trim()}
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>
        <main className="flex overflow-x-auto p-4 flex-1 space-x-4">
          {members.map((member, idx) => (
            <DraggableSwimlane
              key={member.id}
              member={member}
              filterTag={filterTag}
              index={idx}
              memberOrder={members.map((m) => m.id)}
            />
          ))}
        </main>
      </div>
    </DndProvider>
  );
}

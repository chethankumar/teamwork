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
                  <Button type="submit" size="sm" disabled={!newMember.trim()}>
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
            memberOrder={members.map(m => m.id)}
          />
        ))}
      </main>
    </div>
    </DndProvider>
  );
}

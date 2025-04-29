// src/components/Swimlane.jsx
// Renders tasks under a specific member, and an add-task button
// src/components/Swimlane.jsx
// Renders tasks under a specific member, and allows editing/removing member
import { useState } from "react";
import { useDrop } from "react-dnd";
import useKanbanStore from "../lib/store";
import TaskCard from "./TaskCard";
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Pencil, Trash2, Tags } from "lucide-react";
import { Textarea } from "./ui/textarea";

export default function Swimlane({ member, filterTag }) {
  const { tasks, addTask, updateMember, deleteMember } = useKanbanStore();
  let memberTasks = tasks.filter((t) => t.memberId === member.id);
  if (filterTag)
    memberTasks = memberTasks.filter((t) => t.tagIds.includes(filterTag));
  // Split into open and done
  const openTasks = memberTasks.filter((t) => t.status !== "done");
  const doneTasks = memberTasks.filter((t) => t.status === "done");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTags, setNewTags] = useState([]);
  const [open, setOpen] = useState(false);
  // State for rename dialog
  const [editOpen, setEditOpen] = useState(false);
  const [rename, setRename] = useState(member.name);
  // State for delete confirmation
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { tags } = useKanbanStore();

  const onAdd = () => {
    if (!newTitle.trim()) return;
    addTask(member.id, newTitle, newDesc, newTags);
    setNewTitle("");
    setNewDesc("");
    setNewTags([]);
    setOpen(false);
  };

  const onRename = (e) => {
    e.preventDefault();
    if (!rename.trim()) return;
    updateMember(member.id, { name: rename.trim() });
    setEditOpen(false);
  };

  const onDelete = () => {
    deleteMember(member.id);
    setDeleteOpen(false);
  };

  // Enable drop for task cards
  const { updateTask } = useKanbanStore();
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "TASK_CARD",
    drop: (item) => {
      if (item.memberId !== member.id) {
        updateTask(item.id, { memberId: member.id });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Swimlane styled as a board column
  return (
    <div ref={drop} className={`w-80 h-[calc(100vh-96px)] flex-shrink-0 bg-white rounded-xl shadow-lg border border-gray-200 mx-3 my-0 flex flex-col transition-colors ${isOver && canDrop ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}>
      {/* Header: colored dot, member/column name, card count, actions */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {/* Colored dot (random pastel per member) */}
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: stringToColor(member.name) }}
          ></span>
          <span className="font-semibold text-base">{member.name}</span>
          <span className="ml-2 text-xs bg-gray-100 rounded px-2 py-0.5 text-gray-600">
            {memberTasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Edit member dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <button
                className="text-xs px-2 text-gray-400 hover:text-blue-600"
                aria-label="Rename Member"
              >
                <Pencil size={16} />
              </button>
            </DialogTrigger>
            <DialogContent>
              <h4 className="font-semibold mb-2">Rename Member</h4>
              <form onSubmit={onRename} className="flex flex-col gap-3">
                <Input
                  value={rename}
                  onChange={(e) => setRename(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button type="submit" size="sm" disabled={!rename.trim()}>
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          {/* Delete member dialog */}
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <button
                className="text-xs px-2 text-red-400 hover:text-red-600"
                aria-label="Remove Member"
              >
                <Trash2 size={16} />
              </button>
            </DialogTrigger>
            <DialogContent>
              <h4 className="font-semibold mb-2">Remove Member?</h4>
              <p className="text-sm mb-4">
                This will remove the member and all their tasks. Are you sure?
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="destructive" size="sm" onClick={onDelete}>
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Add Task Button */}
      <div className="px-5 pt-3 pb-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="w-full py-1.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100">
              + Add Task
            </button>
          </DialogTrigger>
          <DialogContent>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Tags size={18} /> New Task
            </h4>
            <Input
              placeholder="Task title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
            />
            <Textarea
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="mt-2"
              rows={2}
            />
            {/* Tag selection */}
            {tags.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-medium mb-1 flex items-center gap-1 text-gray-700">
                  <Tags size={14} /> Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newTags.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked)
                            setNewTags([...newTags, tag.id]);
                          else
                            setNewTags(newTags.filter((id) => id !== tag.id));
                        }}
                        className="accent-blue-500"
                      />
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: tag.color,
                          color: "#fff",
                          opacity: 0.95,
                        }}
                      >
                        {tag.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button size="sm" onClick={onAdd}>
                Add
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Card list (scrollable) */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 pt-1 space-y-4">
        {openTasks.map((t) => (
          <TaskCard key={t.id} task={t} />
        ))}
        {doneTasks.length > 0 && openTasks.length > 0 && (
          <div className="h-6" />
        )}
        {doneTasks.map((t) => (
          <TaskCard key={t.id} task={t} />
        ))}
      </div>
    </div>
  );

  // Utility: pastel color from string
  function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = ((hash % 360) + 360) % 360;
    return `hsl(${h},70%,85%)`;
  }
}

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

export default function Swimlane({ member, filterTags }) {
  const { tasks, addTask, updateMember, deleteMember } = useKanbanStore();
  let memberTasks = tasks.filter((t) => t.memberId === member.id);
  
  // Filter tasks by multiple tags if any are selected
  if (filterTags && filterTags.length > 0) {
    memberTasks = memberTasks.filter((task) => {
      // A task matches if it has at least one of the selected tags
      return task.tagIds.some(tagId => filterTags.includes(tagId));
    });
  }
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
    <div 
      ref={drop} 
      className={`w-[320px] h-[calc(100vh-120px)] flex-shrink-0 bg-white rounded-xl shadow-md border border-gray-200 flex flex-col transition-all ${isOver && canDrop ? 'ring-2 ring-blue-500 bg-blue-50 shadow-lg transform scale-[1.01]' : 'hover:shadow-lg hover:border-gray-300'}`}
    >
      {/* Header: colored dot, member/column name, card count, actions */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl z-10">
        <div className="flex items-center gap-2">
          {/* Colored dot (random pastel per member) */}
          <span
            className="w-3 h-3 rounded-full shadow-inner"
            style={{ backgroundColor: stringToColor(member.name) }}
          ></span>
          <span className="font-semibold text-base text-gray-800">{member.name}</span>
          <span className="ml-2 text-xs bg-gray-100 rounded-full px-2.5 py-0.5 text-gray-600 font-medium">
            {memberTasks.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Edit member dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <button
                className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                aria-label="Rename Member"
              >
                <Pencil size={15} />
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-lg shadow-xl border-0">
              <h4 className="font-semibold text-lg mb-3 text-gray-800">Rename Member</h4>
              <form onSubmit={onRename} className="flex flex-col gap-4">
                <Input
                  value={rename}
                  onChange={(e) => setRename(e.target.value)}
                  autoFocus
                  className="rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                />
                <div className="flex justify-end gap-3 mt-2">
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={!rename.trim()}
                    className="bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditOpen(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
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
                className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Remove Member"
              >
                <Trash2 size={15} />
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-lg shadow-xl border-0">
              <h4 className="font-semibold text-lg mb-3 text-gray-800">Remove Member?</h4>
              <p className="text-sm mb-4 text-gray-600">
                This will remove the member and all their tasks. Are you sure?
              </p>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={onDelete}
                  className="bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteOpen(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Add Task Button */}
      <div className="px-5 pt-4 pb-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="w-full py-2 rounded-md bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors shadow-sm border border-blue-100 hover:border-blue-200 flex items-center justify-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Task
            </button>
          </DialogTrigger>
          <DialogContent className="rounded-lg shadow-xl border-0">
            <h4 className="font-semibold text-lg mb-3 text-gray-800 flex items-center gap-2">
              <Tags size={18} /> New Task
            </h4>
            <Input
              placeholder="Task title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              className="rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
            />
            <Textarea
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="mt-3 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
              rows={3}
            />
            {/* Tag selection */}
            {tags.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2 flex items-center gap-1.5 text-gray-700">
                  <Tags size={15} /> Tags
                </div>
                <div className="flex flex-wrap gap-2 bg-gray-50 p-3 rounded-md border border-gray-100">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
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
                        className="accent-blue-500 w-4 h-4"
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

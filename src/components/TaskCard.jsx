// src/components/TaskCard.jsx
// Displays a single task with title, description, tags, timestamps, and status toggle
import { useState, useEffect, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import useKanbanStore from "../lib/store";
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Pencil, Plus, Timer } from "lucide-react";

// TagPopover: plus button opens popover to add/remove tags for a task
function TagPopover({ taskId, tagIds }) {
  const { tags, updateTask } = useKanbanStore();
  // Handler for checkbox change
  const handleToggle = (id, checked) => {
    let newTags;
    if (checked) newTags = [...tagIds, id];
    else newTags = tagIds.filter((tid) => tid !== id);
    updateTask(taskId, { tagIds: newTags });
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="ml-1 px-1.5 py-0.5 rounded bg-gray-100 text-xs font-bold border border-gray-300 hover:bg-gray-200 flex items-center rounded-full"
          aria-label="Add tag"
        >
          <Plus size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3">
        <div className="font-semibold mb-2 text-sm">Manage Tags</div>
        <div className="flex flex-col gap-2">
          {tags.length === 0 && (
            <span className="text-xs text-gray-400">No tags defined.</span>
          )}
          {tags.map((tag) => (
            <label
              key={tag.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={tagIds.includes(tag.id)}
                onChange={(e) => handleToggle(tag.id, e.target.checked)}
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
      </PopoverContent>
    </Popover>
  );
}

// Convert hex color to rgb
function hexToRgb(hex) {
  // Expand shorthand hex form (#abc) to full form (#aabbcc)
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(x=>x+x).join('');
  if (h.length !== 6) return null;
  const num = parseInt(h, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

// Format short date/time
function formatShort(ts) {
  if (!ts) return "-";
  const d = new Date(ts);
  return (
    d.toLocaleDateString([], { month: "short", day: "2-digit" }) +
    " " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

// Format milliseconds into human-readable string
function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default function TaskCard({ task }) {
  // Enable drag-and-drop for this card (source + drop target)
  const ref = useRef(null);
  const moveTaskInSwimlane = useKanbanStore((s) => s.moveTaskInSwimlane);
  const [, drag] = useDrag({
    type: "TASK_CARD",
    item: { id: task.id, memberId: task.memberId },
  });
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "TASK_CARD",
    canDrop: (item) => item.id !== task.id && item.memberId === task.memberId && task.status === useKanbanStore.getState().tasks.find(t => t.id === item.id)?.status,
    drop: (item) => {
      if (item.id !== task.id && item.memberId === task.memberId) {
        moveTaskInSwimlane(item.id, task.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });
  drag(drop(ref));
  const { tags, markTaskDone, markTaskTodo, updateTask } = useKanbanStore();
  const [elapsed, setElapsed] = useState(
    formatDuration(Date.now() - task.createdAt)
  );

  // Update elapsed time every second for active tasks
  useEffect(() => {
    if (task.status === "todo") {
      const id = setInterval(
        () => setElapsed(formatDuration(Date.now() - task.createdAt)),
        1000
      );
      return () => clearInterval(id);
    } else {
      setElapsed(formatDuration(task.completedAt - task.createdAt));
    }
  }, [task.status, task.createdAt, task.completedAt]);

  // Derive tag objects
  const taskTags = tags.filter((t) => task.tagIds.includes(t.id));

  // Edit modal state
  const [openEdit, setOpenEdit] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);
  const [editTags, setEditTags] = useState(task.tagIds);

  useEffect(() => {
    if (openEdit) {
      setEditTitle(task.title);
      setEditDesc(task.description);
      setEditTags(task.tagIds);
    }
  }, [openEdit, task]);

  const onSave = () => {
    updateTask(task.id, {
      title: editTitle,
      description: editDesc,
      tagIds: editTags,
    });
    setOpenEdit(false);
  };

  const toggleStatus = () => {
    if (task.status === "todo") markTaskDone(task.id);
    else markTaskTodo(task.id);
  };

  // Subtle card background: blend colors if multiple tags, gradient if one
  let cardBg = "#fff";
  if (taskTags.length === 1) {
    const rgb = hexToRgb(taskTags[0].color);
    cardBg = rgb ? `linear-gradient(135deg, rgba(${rgb.r},${rgb.g},${rgb.b},0.15) 0%, #fff 100%)` : "#fff";
  } else if (taskTags.length > 1) {
    const stops = taskTags.map((tag, i) => {
      const rgb = hexToRgb(tag.color);
      if (!rgb) return null;
      const pct = Math.round((i / (taskTags.length - 1)) * 100);
      return `rgba(${rgb.r},${rgb.g},${rgb.b},0.13) ${pct}%`;
    }).filter(Boolean);
    if (stops.length > 1)
      cardBg = `linear-gradient(120deg, ${stops.join(', ')})`;
    else if (stops.length === 1)
      cardBg = `linear-gradient(135deg, ${stops[0]} 0%, #fff 100%)`;
  }

  return (
    <div
      ref={ref}
      className={`rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow mb-4 flex flex-col gap-2 min-h-[110px] ${isOver && canDrop ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}
      style={{ background: cardBg }}
    >
      {/* Top row: tags & menu */}
      <div className="flex items-center justify-between p-2">
        <div className="flex gap-1 flex-wrap items-center">
          {taskTags.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 text-xs font-medium rounded-full"
              style={{
                backgroundColor: tag.color,
                color: "#fff",
                opacity: 0.95,
              }}
            >
              {tag.name}
            </span>
          ))}
          {/* Plus button for tag popover */}
          <TagPopover taskId={task.id} tagIds={task.tagIds} />
        </div>
        {/* Edit icon button at top right */}
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogTrigger asChild>
            <button
              className="text-base p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600"
              title="Edit Task"
              aria-label="Edit Task"
            >
              <Pencil size={18} />
            </button>
          </DialogTrigger>
          <DialogContent>
            <h4 className="font-semibold mb-2">Edit Task</h4>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <Textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="mt-2"
            />
            <div className="mt-2 space-y-1">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center gap-1">
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={editTags.includes(tag.id)}
                    onCheckedChange={(checked) => {
                      if (checked) setEditTags([...editTags, tag.id]);
                      else setEditTags(editTags.filter((id) => id !== tag.id));
                    }}
                    className="size-4"
                  />
                  <Label htmlFor={`tag-${tag.id}`}>{tag.name}</Label>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button size="sm" onClick={onSave}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setOpenEdit(false)}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Title & description */}
      <div className="flex-1 p-2">
        <div className="font-semibold text-base leading-tight mb-1 text-gray-900 truncate">
          {task.title}
        </div>
        {task.description && (
          <div className="text-xs text-gray-600 leading-snug mb-1 line-clamp-3">
            {task.description}
          </div>
        )}
      </div>

      {/* Actions below the line - colored background, rounded bottom */}
      <div className="flex items-center justify-between border-t-1 px-3 py-3 bg-gray-50 rounded-b-xl text-xs">
        {/* Left: start/end time */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400">{formatShort(task.createdAt)}</span>
          {task.status === "done" && (
            <span className="text-green-600">
              {formatShort(task.completedAt)}
            </span>
          )}
        </div>
        {/* Center: duration */}
        <span className="text-gray-500 flex items-center gap-1">
          <Timer size={14} className="inline-block" /> {elapsed}
        </span>
        {/* Right: done checkbox */}
        <input
          type="checkbox"
          checked={task.status === "done"}
          onChange={toggleStatus}
          className="accent-blue-500 scale-110"
        />
      </div>
    </div>
  );
}

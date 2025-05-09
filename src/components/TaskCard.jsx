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
import { Pencil, Plus, Tags, Timer } from "lucide-react";

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
          className="ml-1 px-1.5 py-0.5 bg-gray-100 text-xs font-bold border border-gray-300 hover:bg-gray-200 flex items-center rounded-full"
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
  let h = hex.replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((x) => x + x)
      .join("");
  if (h.length !== 6) return null;
  const num = parseInt(h, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
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
    canDrop: (item) =>
      item.id !== task.id &&
      item.memberId === task.memberId &&
      task.status ===
        useKanbanStore.getState().tasks.find((t) => t.id === item.id)?.status,
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

  // Card background: blend colors if multiple tags, gradient if one
  let cardBg = "#fff";
  if (taskTags.length === 1) {
    const rgb = hexToRgb(taskTags[0].color);
    cardBg = rgb
      ? `linear-gradient(135deg, rgba(${rgb.r},${rgb.g},${rgb.b},0.85) 0%, rgba(${rgb.r},${rgb.g},${rgb.b},0.4) 100%)`
      : "#fff";
  } else if (taskTags.length > 1) {
    const stops = taskTags
      .map((tag, i) => {
        const rgb = hexToRgb(tag.color);
        if (!rgb) return null;
        const pct = Math.round((i / (taskTags.length - 1)) * 100);
        return `rgba(${rgb.r},${rgb.g},${rgb.b},0.75) ${pct}%`;
      })
      .filter(Boolean);
    if (stops.length > 1)
      cardBg = `linear-gradient(120deg, ${stops.join(", ")})`;
    else if (stops.length === 1)
      cardBg = `linear-gradient(135deg, ${stops[0]} 0%, #fff 100%)`;
  }

  // Generate a gradient for the outer card based on task tags
  let gradientColors = "bg-gradient-to-r from-blue-50 to-indigo-50";
  let tagGradientStyle = "";
  let borderColor = "rgba(96, 165, 250, 0.2)";

  if (taskTags.length > 0) {
    // If we have tags, use their colors for the gradient
    if (taskTags.length === 1) {
      // For a single tag, create a gradient from its color
      const rgb = hexToRgb(taskTags[0].color);
      borderColor = `${taskTags[0].color}40`; // 25% opacity version of tag color

      if (rgb) {
        const lightColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
        const lighterColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
        gradientColors = `custom-gradient-${task.id}`;
        tagGradientStyle = `linear-gradient(to top, ${lightColor}, ${lighterColor})`;
      }
    } else {
      // For multiple tags, blend their colors
      const stops = taskTags
        .map((tag, i) => {
          const rgb = hexToRgb(tag.color);
          if (!rgb) return null;
          const pct = Math.round((i / (taskTags.length - 1)) * 100);
          return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${
            i === 0 ? 0.5 : 0.2
          }) ${pct}%`;
        })
        .filter(Boolean);

      if (stops.length > 1) {
        gradientColors = `custom-gradient-${task.id}`;
        tagGradientStyle = `linear-gradient(120deg, ${stops.join(", ")})`;
        borderColor = `${taskTags[0].color}40`; // Use first tag for border
      }
    }

    // Add a style tag for the custom gradient if it doesn't exist
    if (
      tagGradientStyle &&
      !document.getElementById(`gradient-style-${task.id}`)
    ) {
      const style = document.createElement("style");
      style.id = `gradient-style-${task.id}`;
      style.innerHTML = `.custom-gradient-${task.id} { background: ${tagGradientStyle}; }`;
      document.head.appendChild(style);
    }
  }

  // Determine text color for footer based on tag color - darker shade of the background
  let footerTextColor = task.status === "done" ? "text-gray-500" : "text-gray-600";
  let footerTextStyle = {};
  
  if (taskTags.length > 0) {
    const tagColor = taskTags[0].color;
    const rgb = hexToRgb(tagColor);
    if (rgb) {
      // Create a darker, more saturated version of the tag color for the text
      // Reduce brightness but increase saturation for better contrast
      const r = Math.max(0, Math.floor(rgb.r * 0.6));
      const g = Math.max(0, Math.floor(rgb.g * 0.6));
      const b = Math.max(0, Math.floor(rgb.b * 0.6));
      
      // Apply color directly via style instead of Tailwind class
      footerTextStyle = { color: `rgb(${r}, ${g}, ${b})` };
      footerTextColor = ""; // Clear the Tailwind class
    }
  }

  return (
    <div
      ref={ref}
      className={`group mb-4 ${
        isOver && canDrop ? "transform scale-[1.01]" : ""
      }`}
    >
      {/* Outer card with gradient */}
      <div
        className={`rounded-3xl p-1 shadow-md hover:shadow-xl transition-all duration-300 ${gradientColors} ${
          task.status === "done" ? "opacity-85" : ""
        } ${
          isOver && canDrop
            ? "ring-2 ring-blue-400"
            : "hover:translate-y-[-2px]"
        }`}
        style={{
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Inner white card */}
        <div className="rounded-[20px] bg-white overflow-hidden shadow-2xl shadow-gray-700/20">
          {/* Top row: tags & menu */}
          <div className="flex items-center justify-between p-3">
            <div className="flex gap-1.5 flex-wrap items-center">
              {taskTags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2.5 py-0.5 text-xs font-medium rounded-full shadow-sm transform transition-transform duration-200 hover:scale-105 border"
                  style={{
                    backgroundColor: `${tag.color}E6`, // 90% opacity
                    color: "#fff",
                    borderColor: tag.color,
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
                  className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-all duration-200"
                  title="Edit Task"
                  aria-label="Edit Task"
                >
                  <Pencil size={16} />
                </button>
              </DialogTrigger>
              <DialogContent className="rounded-lg shadow-xl border-0">
                <h4 className="font-semibold text-lg mb-3 text-gray-800">
                  Edit Task
                </h4>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                />
                <Textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="mt-3 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  rows={3}
                />
                <div className="mt-4 bg-gray-50 p-3 rounded-md border border-gray-100">
                  <div className="text-sm font-medium mb-2 flex items-center gap-1.5 text-gray-700">
                    <Tags size={15} /> Tags
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        <input
                          type="checkbox"
                          checked={editTags.includes(tag.id)}
                          onChange={(e) => {
                            if (e.target.checked)
                              setEditTags([...editTags, tag.id]);
                            else
                              setEditTags(
                                editTags.filter((id) => id !== tag.id)
                              );
                          }}
                          className="accent-blue-500 w-4 h-4"
                        />
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium shadow-sm border"
                          style={{
                            backgroundColor: `${tag.color}E6`,
                            color: "#fff",
                            borderColor: tag.color,
                          }}
                        >
                          {tag.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <Button
                    size="sm"
                    onClick={onSave}
                    className="bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOpenEdit(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Title & description */}
          <div className="flex-1 px-3 pb-4 min-h-[80px]">
            <div
              className={`font-medium text-base leading-tight mb-1.5 ${
                task.status === "done"
                  ? "text-gray-500 line-through decoration-gray-400 decoration-1"
                  : "text-gray-800"
              } truncate`}
            >
              {task.title}
            </div>
            {task.description && (
              <div
                className={`text-sm ${
                  task.status === "done" ? "text-gray-500" : "text-gray-600"
                } leading-snug mb-2 line-clamp-3`}
              >
                {task.description}
              </div>
            )}
          </div>
        </div>

        {/* Footer with gradient background */}
        <div
          className={`flex items-center justify-between px-3.5 py-1.5 text-xs rounded-b-2xl font-medium`}
        >
          {/* Left: start/end time */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1" style={footerTextStyle}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {formatShort(task.createdAt)}
            </span>
            {task.status === "done" && (
              <span className="text-green-600 font-medium flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                {formatShort(task.completedAt)}
              </span>
            )}
          </div>
          {/* Center: duration */}
          <span
            className="flex items-center gap-1.5 font-medium"
            style={footerTextStyle}
          >
            <Timer size={14} className="inline-block" /> {elapsed}
          </span>
          {/* Custom toggle that matches the card design */}
          <button
            onClick={toggleStatus}
            className="relative flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full group p-1 hover:bg-gray-100 transition-colors"
            aria-label={task.status === "done" ? "Mark as todo" : "Mark as done"}
          >
            <div 
              className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center ${
                task.status === "done" 
                  ? "bg-opacity-100 shadow-inner" 
                  : "bg-gray-200 border border-gray-400 group-hover:border-gray-500"
              }`}
              style={{
                backgroundColor: task.status === "done" && taskTags.length > 0 
                  ? taskTags[0].color 
                  : task.status === "done" ? "#10b981" : undefined
              }}
            >
              <div 
                className={`transform transition-all duration-300 ${
                  task.status === "done" 
                    ? "translate-x-7 bg-white w-4 h-4 rounded-full shadow-md" 
                    : "translate-x-1 w-4 h-4 rounded-full shadow-md bg-white"
                }`}
              >
                {task.status !== "done" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 group-hover:bg-gray-600"></div>
                  </div>
                )}
              </div>
            </div>
            <span className="sr-only">{task.status === "done" ? "Mark as todo" : "Mark as done"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

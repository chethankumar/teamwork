// src/components/DraggableSwimlane.jsx
// Swimlane wrapper for drag-and-drop reordering of swimlanes (members)
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import useKanbanStore from "../lib/store";
import Swimlane from "./Swimlane";

/**
 * DraggableSwimlane wraps a Swimlane for drag-and-drop reordering
 * @param {object} props
 * @param {object} props.member - The member object
 * @param {string[]} props.filterTags - Array of tag IDs to filter by
 * @param {number} props.index - Swimlane index
 * @param {string[]} props.memberOrder - Array of member IDs in order
 */
export default function DraggableSwimlane({ member, filterTags, index, memberOrder }) {
  const ref = useRef(null);
  const moveSwimlane = useKanbanStore((s) => s.moveSwimlane);
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "SWIMLANE",
    canDrop: (item) => item.id !== member.id,
    drop: (item) => {
      if (item.id !== member.id) {
        moveSwimlane(item.id, member.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });
  const [{ isDragging }, drag] = useDrag({
    type: "SWIMLANE",
    item: { id: member.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drag(drop(ref));
  return (
    <div
      ref={ref}
      className={`transition-shadow ${isOver && canDrop ? "ring-2 ring-blue-400 bg-blue-50" : ""} ${isDragging ? "opacity-60" : ""}`}
      style={{ minWidth: 320, maxWidth: 320 }}
    >
      <Swimlane member={member} filterTags={filterTags} />
    </div>
  );
}

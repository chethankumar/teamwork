// src/lib/store.js
// Zustand store for Kanban board state with localStorage persistence

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * @typedef {Object} Member
 * @property {string} id - Unique member ID
 * @property {string} name - Member name
 *
 * @typedef {Object} Tag
 * @property {string} id - Unique tag ID
 * @property {string} name - Tag name
 * @property {string} color - Tag color in hex or CSS string
 *
 * @typedef {Object} Task
 * @property {string} id - Unique task ID
 * @property {string} memberId - ID of the member/swimlane
 * @property {string} title - Task title
 * @property {string} description - Task description
 * @property {string[]} tagIds - Associated tag IDs
 * @property {number} createdAt - Timestamp when created
 * @property {'todo'|'done'} status - Task status
 * @property {number|null} completedAt - Timestamp when marked done
 */

// Create Zustand store with persistence in localStorage under key 'kanban-storage'
const useKanbanStore = create(
  persist(
    (set, get) => ({
      // Swimlane members - default placeholders
      members: [
        { id: crypto.randomUUID(), name: 'Alice' },
        { id: crypto.randomUUID(), name: 'Bob' },
      ],

      /**
       * Add a new member to the board
       * @param {string} name - Member name
       */
      addMember: (name) => {
        const id = crypto.randomUUID();
        set((state) => ({
          members: [...state.members, { id, name }],
        }));
      },

      /**
       * Update a member's fields (e.g., rename)
       * @param {string} id - Member ID
       * @param {Partial<Member>} fields - Fields to update
       */
      updateMember: (id, fields) =>
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? { ...m, ...fields } : m)),
        })),

      /**
       * Remove a member and their tasks
       * @param {string} id - Member ID
       */
      deleteMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          tasks: state.tasks.filter((t) => t.memberId !== id),
        })),

      // Global tags
      tags: [],

      // Task list
      tasks: [],

      /**
       * Move a task within a swimlane (reorder)
       * @param {string} fromId - The ID of the dragged task
       * @param {string|null} toId - The ID of the target task (or null for end)
       */
      moveTaskInSwimlane: (fromId, toId) => set((state) => {
        const idx = state.tasks.findIndex(t => t.id === fromId);
        if (idx === -1) return {};
        const task = state.tasks[idx];
        // Only reorder within the same swimlane
        const swimlaneTasks = state.tasks.filter(t => t.memberId === task.memberId && t.status === task.status);
        const swimlaneIds = swimlaneTasks.map(t => t.id);
        const fromIdx = swimlaneIds.indexOf(fromId);
        let toIdx = toId ? swimlaneIds.indexOf(toId) : swimlaneIds.length - 1;
        if (fromIdx === -1 || fromIdx === toIdx) return {};
        // Remove from current position
        swimlaneIds.splice(fromIdx, 1);
        // Insert at new position
        if (toId) swimlaneIds.splice(toIdx, 0, fromId);
        else swimlaneIds.push(fromId);
        // Rebuild tasks array with new order in this swimlane
        const newTasks = [...state.tasks];
        let swimlaneCursor = 0;
        for (let i = 0; i < newTasks.length; i++) {
          if (newTasks[i].memberId === task.memberId && newTasks[i].status === task.status) {
            newTasks[i] = state.tasks.find(t => t.id === swimlaneIds[swimlaneCursor]);
            swimlaneCursor++;
          }
        }
        return { tasks: newTasks };
      }),

      /**
       * Move a swimlane (member) to a new position
       * @param {string} fromId - The ID of the dragged member
       * @param {string|null} toId - The ID of the target member (or null for end)
       */
      moveSwimlane: (fromId, toId) => set((state) => {
        const fromIdx = state.members.findIndex(m => m.id === fromId);
        if (fromIdx === -1) return {};
        const member = state.members[fromIdx];
        const ids = state.members.map(m => m.id);
        let toIdx = toId ? ids.indexOf(toId) : ids.length - 1;
        if (fromIdx === -1 || fromIdx === toIdx) return {};
        ids.splice(fromIdx, 1);
        if (toId) ids.splice(toIdx, 0, fromId);
        else ids.push(fromId);
        const newMembers = ids.map(id => state.members.find(m => m.id === id));
        return { members: newMembers };
      }),

      /**
       * Add a new task under a member
       * @param {string} memberId
       * @param {string} title
       * @param {string} [description]
       * @param {string[]} [tagIds]
       */
      addTask: (memberId, title, description = '', tagIds = []) => {
        const id = crypto.randomUUID()
        const createdAt = Date.now()
        set((state) => ({
          tasks: [
            ...state.tasks,
            { id, memberId, title, description, tagIds, createdAt, status: 'todo', completedAt: null },
          ],
        }))
      },

      /**
       * Update arbitrary fields on a task
       * @param {string} id
       * @param {Partial<Task>} fields
       */
      updateTask: (id, fields) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...fields } : t)),
        })),

      /**
       * Delete a task by ID
       * @param {string} id
       */
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      /**
       * Mark a task as done and record completion time
       * @param {string} id
       */
      markTaskDone: (id) => {
        const completedAt = Date.now()
        get().updateTask(id, { status: 'done', completedAt })
      },

      /**
       * Revert a task back to todo
       * @param {string} id
       */
      markTaskTodo: (id) => {
        get().updateTask(id, { status: 'todo', completedAt: null })
      },

      /**
       * Add a new global tag
       * @param {string} name
       * @param {string} color
       */
      addTag: (name, color) => {
        const id = crypto.randomUUID()
        set((state) => ({ tags: [...state.tags, { id, name, color }] }))
      },

      /**
       * Update a tag's fields
       * @param {string} id
       * @param {Partial<Tag>} fields
       */
      updateTag: (id, fields) =>
        set((state) => ({ tags: state.tags.map((tag) => (tag.id === id ? { ...tag, ...fields } : tag)) })),

      /**
       * Delete a tag by ID
       * @param {string} id
       */
      deleteTag: (id) => set((state) => ({ tags: state.tags.filter((tag) => tag.id !== id) })),
    }),
    { name: 'kanban-storage' }
  )
)

export default useKanbanStore

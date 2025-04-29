// src/components/TagManager.jsx
// Manages global tags: create, update, delete
import React, { useState } from 'react'
import useKanbanStore from '../lib/store'
import { Dialog, DialogTrigger, DialogContent } from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'

export default function TagManager() {
  const { tags, addTag, updateTag, deleteTag } = useKanbanStore()
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#000000')

  const onAdd = () => {
    if (!newName.trim()) return
    addTag(newName, newColor)
    setNewName('')
    setNewColor('#000000')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Manage Tags</Button>
      </DialogTrigger>
      <DialogContent>
        <h4 className="font-semibold mb-2">Global Tags</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {tags.map(tag => (
            <div key={tag.id} className="flex items-center gap-2">
              <Input
                value={tag.name}
                onChange={e => updateTag(tag.id, { name: e.target.value })}
                className="flex-1"
              />
              <Input
                type="color"
                value={tag.color}
                onChange={e => updateTag(tag.id, { color: e.target.value })}
                className="w-10 h-10 p-0 border-0"
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => deleteTag(tag.id)}
              >
                &times;
              </Button>
            </div>
          ))}
        </div>
        <h5 className="font-semibold mb-1">Add Tag</h5>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <Input
            type="color"
            value={newColor}
            onChange={e => setNewColor(e.target.value)}
            className="w-10 h-10 p-0 border-0"
          />
          <Button size="sm" onClick={onAdd}>Add</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

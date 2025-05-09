// src/components/TagManager.jsx
// Manages global tags: create, update, delete
import React, { useState, useRef } from 'react'
import useKanbanStore from '../lib/store'
import { Dialog, DialogTrigger, DialogContent } from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Tags, Plus, Trash2, Check } from 'lucide-react'

// Professional color palette organized by color families
// Each color has a unique value, name, and appropriate text color for contrast
const TAG_COLORS = {
  blue: [
    { name: 'Sky', value: '#0ea5e9', textColor: '#ffffff' },
    { name: 'Azure', value: '#3b82f6', textColor: '#ffffff' },
    { name: 'Indigo', value: '#4f46e5', textColor: '#ffffff' },
    { name: 'Navy', value: '#1e40af', textColor: '#ffffff' }
  ],
  green: [
    { name: 'Emerald', value: '#10b981', textColor: '#ffffff' },
    { name: 'Teal', value: '#14b8a6', textColor: '#ffffff' },
    { name: 'Lime', value: '#84cc16', textColor: '#000000' },
    { name: 'Forest', value: '#166534', textColor: '#ffffff' }
  ],
  warm: [
    { name: 'Yellow', value: '#eab308', textColor: '#000000' },
    { name: 'Orange', value: '#f97316', textColor: '#ffffff' },
    { name: 'Red', value: '#ef4444', textColor: '#ffffff' },
    { name: 'Rose', value: '#e11d48', textColor: '#ffffff' }
  ],
  neutral: [
    { name: 'Purple', value: '#8b5cf6', textColor: '#ffffff' },
    { name: 'Pink', value: '#ec4899', textColor: '#ffffff' },
    { name: 'Slate', value: '#475569', textColor: '#ffffff' },
    { name: 'Gray', value: '#6b7280', textColor: '#ffffff' }
  ]
}

export default function TagManager() {
  const { tags, addTag, updateTag, deleteTag } = useKanbanStore()
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(TAG_COLORS.blue[0].value)
  
  // References to close the dialogs
  const mainDialogRef = useRef(null)
  const colorDialogRefs = useRef({})

  const onAdd = () => {
    if (!newName.trim()) return
    addTag(newName, newColor)
    setNewName('')
    setNewColor(TAG_COLORS.blue[0].value)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1.5 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Tags size={15} />
          Manage Tags
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-lg shadow-xl border-0">
        <h4 className="font-semibold text-lg mb-4 text-gray-800 flex items-center gap-2">
          <Tags size={18} className="text-blue-600" /> 
          Manage Tags
        </h4>
        
        {tags.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100 mb-4">
            <p className="text-gray-500 mb-2">No tags created yet</p>
            <p className="text-sm text-gray-400">Tags help categorize and filter tasks</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto mb-5 pr-1">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 transition-colors group">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                ></div>
                <Input
                  value={tag.name}
                  onChange={e => updateTag(tag.id, { name: e.target.value })}
                  className="flex-1 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all rounded-md"
                />
                <div className="flex items-center gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button 
                        className="w-8 h-8 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                        aria-label="Change tag color"
                      >
                        <div 
                          className="w-5 h-5 rounded-full shadow-sm"
                          style={{ backgroundColor: tag.color }}
                        ></div>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="w-[340px] p-5" ref={el => colorDialogRefs.current[tag.id] = el}>
                      <h5 className="font-semibold text-base mb-4 text-gray-800">Select Tag Color</h5>
                      
                      {Object.entries(TAG_COLORS).map(([family, colors]) => (
                        <div key={family} className="mb-4">
                          <h6 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{family}</h6>
                          <div className="grid grid-cols-4 gap-2">
                            {colors.map(color => {
                              // Find if this color is selected
                              const isSelected = tag.color === color.value;
                              
                              return (
                                <button
                                  key={color.value}
                                  className={`group relative h-16 rounded-md flex flex-col items-center justify-center transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${isSelected ? 'ring-2 ring-white ring-opacity-70' : ''}`}
                                  style={{ backgroundColor: color.value }}
                                  onClick={() => {
                                    // Update the tag color
                                    updateTag(tag.id, { color: color.value });
                                    
                                    // Close the dialog using the ref
                                    const closeButton = colorDialogRefs.current[tag.id]?.querySelector('button[data-state]');
                                    if (closeButton) closeButton.click();
                                  }}
                                  title={color.name}
                                >
                                  <span 
                                    className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity" 
                                    style={{ color: color.textColor }}
                                  >
                                    {color.name}
                                  </span>
                                  {isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Check style={{ color: color.textColor }} size={18} />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </DialogContent>
                  </Dialog>
                  <button
                    className="w-8 h-8 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                    onClick={() => deleteTag(tag.id)}
                    aria-label="Delete tag"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
          <h5 className="font-medium text-sm mb-3 text-gray-700 flex items-center gap-1.5">
            <Plus size={15} className="text-blue-600" /> 
            Add New Tag
          </h5>
          <div className="flex items-center gap-2">
              <Dialog>
              <DialogTrigger asChild>
                <button 
                  className="w-8 h-8 rounded-md flex items-center justify-center border border-gray-300 hover:border-gray-400 transition-colors"
                  aria-label="Select tag color"
                >
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: newColor }}
                  ></div>
                </button>
              </DialogTrigger>
              <DialogContent className="w-[340px] p-5" ref={el => mainDialogRef.current = el}>
                <h5 className="font-semibold text-base mb-4 text-gray-800">Select Tag Color</h5>
                
                {Object.entries(TAG_COLORS).map(([family, colors]) => (
                  <div key={family} className="mb-4">
                    <h6 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{family}</h6>
                    <div className="grid grid-cols-4 gap-2">
                      {colors.map(color => {
                        // Find if this color is selected
                        const isSelected = newColor === color.value;
                        
                        return (
                          <button
                            key={color.value}
                            className={`group relative h-16 rounded-md flex flex-col items-center justify-center transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${isSelected ? 'ring-2 ring-white ring-opacity-70' : ''}`}
                            style={{ backgroundColor: color.value }}
                            onClick={() => {
                              // Set the new color
                              setNewColor(color.value);
                              
                              // Close the dialog using the ref
                              const closeButton = mainDialogRef.current?.querySelector('button[data-state]');
                              if (closeButton) closeButton.click();
                            }}
                            title={color.name}
                          >
                            <span 
                              className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity" 
                              style={{ color: color.textColor }}
                            >
                              {color.name}
                            </span>
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check style={{ color: color.textColor }} size={18} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </DialogContent>
            </Dialog>
            <Input
              placeholder="Tag name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="flex-1 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all rounded-md"
            />
            <Button 
              size="sm" 
              onClick={onAdd}
              disabled={!newName.trim()}
              className="bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

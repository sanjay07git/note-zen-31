import { useState, useEffect } from 'react'
import { X, Pin, Archive, Trash2, Palette, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Note } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface NoteEditorProps {
  note: Note | null
  isOpen: boolean
  onClose: () => void
  onSave: (note: Partial<Note>) => void
  onPin: () => void
  onArchive: () => void
  onDelete: () => void
}

const noteColors = [
  { name: 'default', class: 'note-color-default' },
  { name: 'yellow', class: 'note-color-yellow' },
  { name: 'orange', class: 'note-color-orange' },
  { name: 'red', class: 'note-color-red' },
  { name: 'purple', class: 'note-color-purple' },
  { name: 'blue', class: 'note-color-blue' },
  { name: 'teal', class: 'note-color-teal' },
  { name: 'green', class: 'note-color-green' },
  { name: 'brown', class: 'note-color-brown' },
  { name: 'gray', class: 'note-color-gray' },
  { name: 'pink', class: 'note-color-pink' },
]

export function NoteEditor({ note, isOpen, onClose, onSave, onPin, onArchive, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [color, setColor] = useState('default')
  const [labels, setLabels] = useState<string[]>([])
  const [newLabel, setNewLabel] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)

  useEffect(() => {
    if (note) {
      setTitle(note.title || '')
      setBody(note.body || '')
      setColor(note.color || 'default')
      setLabels(note.labels || [])
    } else {
      setTitle('')
      setBody('')
      setColor('default')
      setLabels([])
    }
    setNewLabel('')
  }, [note])

  const handleSave = () => {
    const hasContent = title.trim() || body.trim() || labels.length > 0
    
    if (hasContent) {
      onSave({
        title: title.trim(),
        body: body.trim(),
        color,
        labels: labels.filter(label => label.trim()),
      })
    }
    onClose()
  }

  const handleAddLabel = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newLabel.trim()) {
      const labelToAdd = newLabel.trim().replace(/^#/, '')
      if (!labels.includes(labelToAdd)) {
        setLabels([...labels, labelToAdd])
      }
      setNewLabel('')
    }
  }

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove))
  }

  const colorClass = noteColors.find(c => c.name === color)?.class || 'note-color-default'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-2xl max-h-[90vh] p-0 gap-0", colorClass)}>
        <DialogHeader className="flex flex-row items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2">
            {note && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onPin}
                  title={note.pinned ? "Unpin" : "Pin note"}
                >
                  <Pin className={cn("h-4 w-4", note.pinned && "fill-current")} />
                </Button>

                <DropdownMenu open={showColorPicker} onOpenChange={setShowColorPicker}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" title="Change color">
                      <Palette className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40">
                    <div className="grid grid-cols-5 gap-1 p-2">
                      {noteColors.map((noteColor) => (
                        <button
                          key={noteColor.name}
                          className={cn(
                            "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                            noteColor.class,
                            color === noteColor.name ? "border-ring" : "border-border"
                          )}
                          onClick={() => {
                            setColor(noteColor.name)
                            setShowColorPicker(false)
                          }}
                          title={noteColor.name}
                        />
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onArchive}
                  title={note.archived ? "Unarchive" : "Archive"}
                >
                  <Archive className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  title="Delete note"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4 pt-2">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium border-0 shadow-none px-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground"
          />

          <Textarea
            placeholder="Take a note..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[300px] resize-none border-0 shadow-none px-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground"
          />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Add label (press Enter)"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={handleAddLabel}
                className="border-0 shadow-none px-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground"
              />
            </div>

            {labels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {labels.map((label, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer">
                    #{label}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 hover:bg-transparent"
                      onClick={() => handleRemoveLabel(label)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
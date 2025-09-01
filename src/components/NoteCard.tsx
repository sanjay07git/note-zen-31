import { useState } from 'react'
import { MoreVertical, Pin, Archive, Trash2, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Note } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface NoteCardProps {
  note: Note
  onClick: () => void
  onPin: () => void
  onArchive: () => void
  onDelete: () => void
  onColorChange: (color: string) => void
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

export function NoteCard({ note, onClick, onPin, onArchive, onDelete, onColorChange }: NoteCardProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.note-actions')) {
      return
    }
    onClick()
  }

  const colorClass = noteColors.find(c => c.name === note.color)?.class || 'note-color-default'

  return (
    <Card 
      className={cn(
        "group relative cursor-pointer transition-all duration-200 hover:shadow-md border-0",
        colorClass
      )}
      onClick={handleCardClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-foreground line-clamp-2 flex-1">
            {note.title || 'Untitled'}
          </h3>
          {note.pinned && (
            <Pin className="h-4 w-4 text-muted-foreground fill-current" />
          )}
        </div>
        
        {note.body && (
          <p className="text-sm text-muted-foreground line-clamp-6 mb-3 whitespace-pre-wrap">
            {note.body}
          </p>
        )}
        
        {note.labels && note.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.labels.map((label, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
          </div>
        )}

        <div className="note-actions opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onPin()
              }}
              title={note.pinned ? "Unpin" : "Pin note"}
            >
              <Pin className={cn("h-4 w-4", note.pinned && "fill-current")} />
            </Button>

            <DropdownMenu open={showColorPicker} onOpenChange={setShowColorPicker}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                  title="Change color"
                >
                  <Palette className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <div className="grid grid-cols-5 gap-1 p-2">
                  {noteColors.map((color) => (
                    <button
                      key={color.name}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                        color.class,
                        note.color === color.name ? "border-ring" : "border-border"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        onColorChange(color.name)
                        setShowColorPicker(false)
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="h-4 w-4 mr-2" />
                {note.archived ? 'Unarchive' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  )
}
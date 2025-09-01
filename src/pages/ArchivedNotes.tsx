import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { NoteCard } from '@/components/NoteCard'
import { NoteEditor } from '@/components/NoteEditor'
import { Note, supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

export default function ArchivedNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchArchivedNotes()
    }
  }, [user])

  const fetchArchivedNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user?.id)
        .eq('archived', true)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch archived notes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditNote = (note: Note) => {
    setSelectedNote(note)
    setIsEditorOpen(true)
  }

  const handleSaveNote = async (noteData: Partial<Note>) => {
    try {
      if (selectedNote) {
        const { error } = await supabase
          .from('notes')
          .update({ ...noteData, updated_at: new Date().toISOString() })
          .eq('id', selectedNote.id)

        if (error) throw error
        await fetchArchivedNotes()
        toast({
          title: "Success",
          description: "Note updated",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      })
    }
  }

  const handlePinNote = async (note: Note) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ pinned: !note.pinned, updated_at: new Date().toISOString() })
        .eq('id', note.id)

      if (error) throw error
      await fetchArchivedNotes()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to pin note",
        variant: "destructive",
      })
    }
  }

  const handleArchiveNote = async (note: Note) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ archived: false, updated_at: new Date().toISOString() })
        .eq('id', note.id)

      if (error) throw error
      await fetchArchivedNotes()
      toast({
        title: "Success",
        description: "Note unarchived",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unarchive note",
        variant: "destructive",
      })
    }
  }

  const handleDeleteNote = async (note: Note) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', note.id)

      if (error) throw error
      await fetchArchivedNotes()
      setIsEditorOpen(false)
      toast({
        title: "Success",
        description: "Note deleted permanently",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      })
    }
  }

  const handleColorChange = async (note: Note, color: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ color, updated_at: new Date().toISOString() })
        .eq('id', note.id)

      if (error) throw error
      await fetchArchivedNotes()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change color",
        variant: "destructive",
      })
    }
  }

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    const titleMatch = note.title?.toLowerCase().includes(query)
    const bodyMatch = note.body?.toLowerCase().includes(query)
    const labelMatch = note.labels?.some(label => 
      label.toLowerCase().includes(query) || 
      query.startsWith('#') && label.toLowerCase().includes(query.slice(1))
    )
    
    return titleMatch || bodyMatch || labelMatch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-8">Archived Notes</h1>

        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => handleEditNote(note)}
                onPin={() => handlePinNote(note)}
                onArchive={() => handleArchiveNote(note)}
                onDelete={() => handleDeleteNote(note)}
                onColorChange={(color) => handleColorChange(note, color)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-medium text-foreground mb-2">
              {searchQuery ? 'No archived notes found' : 'No archived notes'}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Notes you archive will appear here'
              }
            </p>
          </div>
        )}
      </main>

      <NoteEditor
        note={selectedNote}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveNote}
        onPin={() => selectedNote && handlePinNote(selectedNote)}
        onArchive={() => selectedNote && handleArchiveNote(selectedNote)}
        onDelete={() => selectedNote && handleDeleteNote(selectedNote)}
      />
    </div>
  )
}
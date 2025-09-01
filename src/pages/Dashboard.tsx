import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/Navbar'
import { NoteCard } from '@/components/NoteCard'
import { NoteEditor } from '@/components/NoteEditor'
import { Note, supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [user])

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user?.id)
        .eq('archived', false)
        .order('pinned', { ascending: false })
        .order('updated_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNote = () => {
    setSelectedNote(null)
    setIsEditorOpen(true)
  }

  const handleEditNote = (note: Note) => {
    setSelectedNote(note)
    setIsEditorOpen(true)
  }

  const handleSaveNote = async (noteData: Partial<Note>) => {
    try {
      if (selectedNote) {
        // Update existing note
        const { error } = await supabase
          .from('notes')
          .update({ ...noteData, updated_at: new Date().toISOString() })
          .eq('id', selectedNote.id)

        if (error) throw error
      } else {
        // Create new note
        const { error } = await supabase
          .from('notes')
          .insert({
            ...noteData,
            user_id: user?.id,
            pinned: false,
            archived: false,
          })

        if (error) throw error
      }

      await fetchNotes()
      toast({
        title: "Success",
        description: selectedNote ? "Note updated" : "Note created",
      })
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
      await fetchNotes()
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
        .update({ archived: !note.archived, updated_at: new Date().toISOString() })
        .eq('id', note.id)

      if (error) throw error
      await fetchNotes()
      toast({
        title: "Success",
        description: note.archived ? "Note unarchived" : "Note archived",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive note",
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
      await fetchNotes()
      setIsEditorOpen(false)
      toast({
        title: "Success",
        description: "Note deleted",
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
      await fetchNotes()
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

  const pinnedNotes = filteredNotes.filter(note => note.pinned)
  const unpinnedNotes = filteredNotes.filter(note => !note.pinned)

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
        {pinnedNotes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Pinned
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {pinnedNotes.map((note) => (
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
          </section>
        )}

        {unpinnedNotes.length > 0 && (
          <section>
            {pinnedNotes.length > 0 && (
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Others
              </h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {unpinnedNotes.map((note) => (
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
          </section>
        )}

        {filteredNotes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium text-foreground mb-2">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Create your first note to get started'
              }
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateNote}>
                <Plus className="h-4 w-4 mr-2" />
                Create Note
              </Button>
            )}
          </div>
        )}
      </main>

      <Button
        onClick={handleCreateNote}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
      >
        <Plus className="h-6 w-6" />
      </Button>

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
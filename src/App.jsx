import React, { useState, useRef, useEffect } from "react";
import Split from "react-split";
import "./App.css";

/**
 * 
 * TODO
 * tags, add to list when created, show them when selected from list, shorthand and tag metadata, add # function to text input
 * Fonts, title, images, tables etc in note section 
 * add new folders
 * add move notes 
 * add title of folder to notes list 
 * option to select folder when creating a note (shift click? )
 * Nested folders 
 * Search function
 * Selected folder, show in folders list, filter notes by folders, show as title? 
 * Protection against no data, create a new note. On delete, if no notes or folders, create empty
 * Icons from HeroIcons
 */

export default function App() {
  // Left panel width in % (initial 30%)
  const [leftSize, setLeftSize] = useState(30);
  const previousLeftSize = useRef(leftSize);
  const isCollapsed = leftSize === 0;
  const [activeSection, setActiveSection] = useState("notes");
  // State setup
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const selectedFolder = folders.find(f => f.id === selectedFolderId) || { notes: [] }
  const [modal, setModal] = useState({ type: null, note: null });
  const [renameInput, setRenameInput] = useState('');
  const [forceUpdate, setForceUpdate] = useState(0); // Trigger re-renders manually if needed
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const [deleteConfirmNoteId, setDeleteConfirmNoteId] = useState(null);
  const deleteConfirmTimeoutRef = useRef(null);

  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  const [deleteConfirmFolderId, setDeleteConfirmFolderId] = useState(null);
  const deleteConfirmFolderTimeoutRef = useRef(null);


  const inputRef = useRef(null);

  useEffect(() => {
    if (!deleteConfirmNoteId) return;

    function handleClickOutside(e) {
      // If click is outside delete confirm icon, cancel
      if (!e.target.closest(".delete-button") && !e.target.closest(".tick-button")) {
        cancelDeleteConfirm();
      }
    }
    function handleEscape(e) {
      if (e.key === "Escape") {
        cancelDeleteConfirm();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [deleteConfirmNoteId]);

  // Cancel delete confirmation
  function cancelDeleteConfirm() {
    setDeleteConfirmNoteId(null);
    if (deleteConfirmTimeoutRef.current) {
      clearTimeout(deleteConfirmTimeoutRef.current);
      deleteConfirmTimeoutRef.current = null;
    }
  }

  // When user first clicks delete icon
  function onDeleteClick(noteId) {
    if (deleteConfirmNoteId === noteId) {
      // Second click on tick: confirm delete
      deleteNoteById(noteId);
      cancelDeleteConfirm();
    } else {
      // First click: show tick
      setDeleteConfirmNoteId(noteId);
      // Set 5 second timeout to cancel
      deleteConfirmTimeoutRef.current = setTimeout(() => {
        cancelDeleteConfirm();
      }, 5000);
    }
  }

  // Actual delete function by note id
  function deleteNoteById(noteId) {
    const updatedNotes = selectedFolder.notes.filter(n => n.id !== noteId);
    setFolders(prevFolders =>
      prevFolders.map(folder =>
        folder.id === selectedFolderId
          ? { ...folder, notes: updatedNotes }
          : folder
      )
    );
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
    setForceUpdate(prev => prev + 1);
  }

  useEffect(() => {
    if (editingNoteId && inputRef.current) {
      inputRef.current.select();
    }
  }, [editingNoteId]);

  useEffect(() => {
    
  const storedFolders = localStorage.getItem("folders");

  if (storedFolders) {
      const parsedFolders = JSON.parse(storedFolders);
      setFolders(parsedFolders);

      if (parsedFolders.length > 0) {
        setSelectedFolderId(parsedFolders[0].id);
        if (parsedFolders[0].notes.length > 0) {
          setSelectedNote(parsedFolders[0].notes[0]);
        }
      }
    } else {
      // Create default "Get Started" folder and note
      const defaultNote = {
        id: crypto.randomUUID(),
        title: "Get Started",
        content:
          "Welcome to your notes app!\n\n- Select or create a folder on the left.\n- Create a note and start writing.\n- Notes are saved automatically.\n\nEnjoy!",
        tags: ["#gettingstarted"],
        lastEdited: Date.now(),
      };

      const defaultFolder = {
        id: crypto.randomUUID(),
        name: "Welcome",
        notes: [defaultNote],
      };

      setFolders([defaultFolder]);
      setSelectedFolderId(defaultFolder.id);
      setSelectedNote(defaultNote);

      localStorage.setItem("folders", JSON.stringify([defaultFolder]));
    }
  }, []);

  const handleRename = (note, newTitle) => {
    if (note && newTitle.trim()) {
      const updatedNote = { ...note, title: newTitle.trim(), lastEdited: Date.now() };
      const updatedNotes = selectedFolder.notes.map((n) =>
        n.id === note.id ? updatedNote : n
      );

      setFolders((prevFolders) =>
        prevFolders.map((folder) =>
          folder.id === selectedFolderId
            ? { ...folder, notes: updatedNotes }
            : folder
        )
      );

      setSelectedNote((prev) => (prev?.id === updatedNote.id ? updatedNote : prev));
      setForceUpdate((prev) => prev + 1);
    }
  };

  useEffect(() => {
    localStorage.setItem("folders", JSON.stringify(folders));
  }, [folders]);

  // Add note to current folder
  const createNote = () => {
    const timestamp = Date.now();
    const newNote = {
      id: timestamp,
      title: "New Note",
      content: "",
      lastEdited: timestamp,
    };

    setFolders(folders.map(folder => {
      if (folder.id === selectedFolderId) {
        return {
          ...folder,
          notes: [...folder.notes, newNote],
        };
      }
      return folder;
    }));
    setSelectedNote(newNote);
  };

  const createFolder = () => {
    const newFolder = {
      id: crypto.randomUUID(),
      name: "New Folder",
      notes: [],
    };
    setFolders(prev => [...prev, newFolder]);
    setSelectedFolderId(newFolder.id);
    setSelectedNote(null);
  };

  const renameFolder = (folderId, newName) => {
    if (!newName.trim()) return;
    setFolders(prevFolders =>
      prevFolders.map(folder =>
        folder.id === folderId ? { ...folder, name: newName.trim() } : folder
      )
    );
  };

  function deleteFolderById(folderId) {
    const updatedFolders = folders.filter(f => f.id !== folderId);
    setFolders(updatedFolders);

    if (selectedFolderId === folderId) {
      const fallbackFolder = updatedFolders[0] || null;
      setSelectedFolderId(fallbackFolder?.id || null);
      setSelectedNote(fallbackFolder?.notes?.[0] || null);
    }
  }

  function cancelDeleteFolderConfirm() {
    setDeleteConfirmFolderId(null);
    if (deleteConfirmFolderTimeoutRef.current) {
      clearTimeout(deleteConfirmFolderTimeoutRef.current);
      deleteConfirmFolderTimeoutRef.current = null;
    }
  }

  function onDeleteFolderClick(folderId) {
    if (deleteConfirmFolderId === folderId) {
      deleteFolderById(folderId);
      cancelDeleteFolderConfirm();
    } else {
      setDeleteConfirmFolderId(folderId);
      deleteConfirmFolderTimeoutRef.current = setTimeout(() => {
        cancelDeleteFolderConfirm();
      }, 5000);
    }
  }

  function handleFolderRename(folder, newName) {
    if (folder && newName.trim()) {
      const updatedFolders = folders.map(f =>
        f.id === folder.id ? { ...f, name: newName.trim() } : f
      );
      setFolders(updatedFolders);
    }
  }

  // Handler to toggle collapse/expand
  const toggleLeftPanel = (state) => {
    if (state) {
      setLeftSize(previousLeftSize.current);
    } else {
      previousLeftSize.current = leftSize;
      setLeftSize(0);
    }
  };

  const sectionPress = (section) => {

    if (isCollapsed) { toggleLeftPanel(true); } 
    else if (section === activeSection) { toggleLeftPanel(false); }
    setActiveSection(section);
  };

  const renderSections = () => {
    if (activeSection === "notes") {
      return (
        <div className="notes-list" key={forceUpdate}>
          {[...selectedFolder?.notes]
            .sort((a, b) => (b.lastEdited || 0) - (a.lastEdited || 0))
            .map((note) => {
              const isSelected = selectedNote?.id === note.id;
              const isConfirmingDelete = deleteConfirmNoteId === note.id;

              return (
                <div
                  key={note.id}
                  className={`${isSelected ? "note-item selected" : "note-item"} cursor-pointer grow min-w-0 truncate ${
                    isSelected ? "selected bg-accent text-accent-foreground" : ""
                  }`}
                  onDoubleClick={() => {
                    setEditingNoteId(note.id);
                    setEditingTitle(note.title);
                  }}
                  onClick={() => setSelectedNote(note)}
                >
                  <div className={`${isSelected ? "note-title selected" : "note-title"}`}>
                    {editingNoteId === note.id ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editingTitle}
                        autoFocus
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => {
                          handleRename(note, editingTitle);
                          setEditingNoteId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRename(note, editingTitle);
                            setEditingNoteId(null);
                          } else if (e.key === "Escape") {
                            setEditingNoteId(null);
                          }
                        }}
                        className={`note-title w-full truncate bg-transparent border-none outline-none ${
                          isSelected ? "selected" : ""
                        }`}
                        style={{
                          font: "inherit",
                          backgroundColor: "transparent",
                          margin: "0px",
                          padding: "0px",
                          width: "100%",
                          border: "none",
                          outline: "none",
                          color: isSelected ? "#494e54" : "#cbd5e1",
                        }}
                      />
                    ) : (
                      note.title
                    )}
                  </div>

                  <div className="note-buttons flex items-center space-x-2 ">
                    <button
                      onClick={() => {
                        setEditingNoteId(note.id);
                        setEditingTitle(note.title);
                      }}
                      className="rename-button p-1"
                      aria-label="Rename"
                      title="Rename"
                    >
                      {/* Rename icon SVG (same as before) */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent note selection on click
                        onDeleteClick(note.id);
                      }}
                      className={isConfirmingDelete ? "tick-button p-1" : "delete-button p-1"}
                      aria-label={isConfirmingDelete ? "Confirm Delete" : "Delete"}
                      title={isConfirmingDelete ? "Click to confirm delete" : "Delete"}
                    >
                      {isConfirmingDelete ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      );
    }

    // Render folders list
    if (activeSection === "folders") {
      return (
        <div className="folder-list">
        {folders.map((folder) => {
          const isSelected = selectedFolderId === folder.id;
          const isConfirmingDelete = deleteConfirmFolderId === folder.id;

          return (
            <div
              key={folder.id}
              className={`folder-item ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedFolderId(folder.id)}
              onDoubleClick={() => {
                setEditingFolderId(folder.id);
                setEditingFolderName(folder.name);
              }}
            >
              {editingFolderId === folder.id ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editingFolderName}
                  autoFocus
                  onChange={(e) => setEditingFolderName(e.target.value)}
                  onBlur={() => {
                    handleFolderRename(folder, editingFolderName);
                    setEditingFolderId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleFolderRename(folder, editingFolderName);
                      setEditingFolderId(null);
                    } else if (e.key === "Escape") {
                      setEditingFolderId(null);
                    }
                  }}
                  className={`folder-title w-full truncate bg-transparent border-none outline-none ${
                    isSelected ? "selected" : ""
                  }`}
                  style={{
                    font: "inherit",
                    backgroundColor: "transparent",
                    margin: "0px",
                    padding: "0px",
                    width: "100%",
                    border: "none",
                    outline: "none",
                    color: isSelected ? "#494e54" : "#cbd5e1",
                  }}
                />
              ) : (
                <span className={`${isSelected ? 'folder-title selected' : 'folder-title'}`}>{folder.name}</span>
              )}

              <div className="folder-buttons flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingFolderId(folder.id);
                    setEditingFolderName(folder.name);
                  }}
                  className="rename-button p-1"
                  aria-label="Rename Folder"
                  title="Rename Folder"
                >
                  {/* Rename Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L16.862 4.487" />
                  </svg>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolderClick(folder.id);
                  }}
                  className={isConfirmingDelete ? "tick-button p-1" : "delete-button p-1"}
                  aria-label={isConfirmingDelete ? "Confirm Delete Folder" : "Delete Folder"}
                  title={isConfirmingDelete ? "Click to confirm delete" : "Delete Folder"}
                >
                  {isConfirmingDelete ? (
                    // Tick Icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    // Trash Icon
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          );
        })}
        <button onClick={createFolder}>+ New Folder</button>
      </div>
      );
    }

    return null;
  };


  return (
    <div className="app-container">
      {/* Left Navbar fixed width */}
      <nav className="left-navbar">
        <button
          onClick={() => {createNote()}}
          className={"create-button"}
          aria-label="newnote"
          title="newnote"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </button>
        <button
          onClick={() => {sectionPress("folders")}}
          className={activeSection === "folders" ? "open-button" : "collapse-button"}
          aria-label="folders"
          title="folders"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
          </svg>
        </button>
        <button
          onClick={() => {sectionPress("notes")}}
          className={activeSection === "notes" ? "open-button" : "collapse-button"}
          aria-label="notes"
          title="notes"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        </button>
        <button
          onClick={() => {sectionPress("tags")}}
          className={activeSection === "tags" ? "open-button" : "collapse-button"}
          aria-label="tags"
          title="tags"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
          </svg>
        </button>
      </nav>

      {/* Split container: left panel + right panel */}
      <div className="split-container">
        <Split
          className="split"
          sizes={[leftSize, 100 - leftSize]}
          minSize={[0, 100]}
          gutterSize={10}
          gutterClassName="gutter"
          direction="horizontal"
          onDragEnd={(newSizes) => setLeftSize(newSizes[0])}
          snapOffset={5}
          // Hide gutter if collapsed
          gutterAlign={isCollapsed ? "start" : "center"}
        >
          <div
            className="panel left-panel"
            style={{ display: isCollapsed ? "none" : "block" }}
          >
            {renderSections()}
          </div>
          <div className="panel right-panel">
            
            <textarea
              className="note-editor"
              style={{ marginLeft: isCollapsed ? 56 : 0 }}
              value={selectedNote?.content || ""}
              onChange={(e) => {
                if (!selectedNote) return;

                const updatedContent = e.target.value;
                const updatedNote = {
                  ...selectedNote,
                  content: updatedContent,
                  timeUpdated: Date.now(),
                  lastEdited: Date.now(),
                };

                setFolders(prevFolders => prevFolders.map(folder => {
                  if (folder.id !== selectedFolderId) return folder;

                  const updatedNotes = folder.notes
                    .map(note => note.id === updatedNote.id ? updatedNote : note)
                    .sort((a, b) => b.timeUpdated - a.timeUpdated);

                  return {
                    ...folder,
                    notes: updatedNotes,
                  };
                }));

                setSelectedNote(updatedNote);              
                setForceUpdate(prev => prev + 1);
              }}
            />
          </div>
        </Split>
      </div>
    </div>
  );
}

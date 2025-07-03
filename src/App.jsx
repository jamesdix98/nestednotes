import React, { useState, useRef } from "react";
import Split from "react-split";
import "./App.css";

/**
 * 
 * TODO
 * tags, add to list when created, show them when selected from list, shorthand and tag metadata, add # function to text input
 * Fonts, title, images, tables etc in note section 
 * add new folders
 * work from local files 
 * add title of folder to notes list 
 * option to select folder when creating a note (shift click? )
 * styling
 */

export default function App() {
  // Left panel width in % (initial 30%)
  const [leftSize, setLeftSize] = useState(30);
  const previousLeftSize = useRef(leftSize);
  const isCollapsed = leftSize === 0;
  const [activeSection, setActiveSection] = useState("notes");
  // State setup
  const [folders, setFolders] = useState([
    {
      id: 1,
      name: "Personal",
      notes: [
        { id: 1, title: "First Note", content: "This is the first note." },
        { id: 2, title: "Second Note", content: "Second note content." },
      ],
    },
    {
      id: 2,
      name: "Work",
      notes: [
        { id: 3, title: "Third Note", content: "Work note content." },
      ],
    },
  ]);

  const [selectedFolderId, setSelectedFolderId] = useState(folders[0].id);
  const selectedFolder = folders.find(f => f.id === selectedFolderId);
  const [selectedNote, setSelectedNote] = useState(selectedFolder.notes[0]);

  // Add note to current folder
  const createNote = () => {
    const newNote = {
      id: Date.now(),
      title: "New Note",
      content: "",
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
    // Render folders list
    if (activeSection === "folders") {
      return (
        <div className="folders-list">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className={`folder-item ${selectedFolderId === folder.id ? "selected" : ""}`}
              onClick={() => {
                setSelectedFolderId(folder.id);
                setSelectedNote(folders.find(f => f.id === folder.id).notes[0]);
              }}
            >
              {folder.name}
            </div>
          ))}
        </div>
      );
    }

    // Render notes list
    if (activeSection === "notes") {
      return (
        <div className="notes-list">
          {selectedFolder?.notes.map((note) => (
            <div
              key={note.id}
              className={`note-item ${selectedNote?.id === note.id ? "selected" : ""}`}
              onClick={() => setSelectedNote(note)}
            >
              {note.title}
            </div>
          ))}
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
              value={selectedNote?.content}
              onChange={(e) =>
                setSelectedNote({ ...selectedNote, content: e.target.value })
              }
            />

          </div>
        </Split>
      </div>
    </div>
  );
}

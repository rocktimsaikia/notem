import { NOTES_DB } from "@/constants";
import { JSONFilePreset } from "lowdb/node";

export interface INote {
	title: string;
	fileName: string;
	createdAt: string;
}

interface IDatabase {
	notes: INote[];
}

// Initialize the database
const db = await JSONFilePreset<IDatabase>(NOTES_DB, {
	notes: [],
});

// Get all notes
export const allNotes = db.data.notes;

// Get all notes count
export const allNotesCount = db.data.notes.length;

// Get a note by index
export const getNoteByIndex = (index: number): INote => db.data.notes[index];

// Add a new note
export const addNewNote = async (note: INote) => {
	db.data.notes.push(note);
	await db.write();
};

// Delete a note
export const deleteNote = async (index: number): Promise<INote> => {
	const note = db.data.notes[index];
	db.data.notes.splice(index, 1);
	await db.write();
	return note;
};

// Delete all notes
export const deleteAllNotes = async () => {
	db.data.notes = [];
	await db.write();
};

#!/usr/bin/env node

import os from "node:os";
import path from "node:path";
import { parse } from "@bomb.sh/args";
import inquirer from "inquirer";
import Keyv from "keyv";
import { KeyvFile } from "keyv-file";
import { checkFolderExists, createFile, createFolder, openFileInVim } from "./utils";

const argv = process.argv.slice(2);
const args = parse(argv, {
	alias: { h: "help", v: "version" },
	boolean: ["help", "version"],
	array: ["add", "remove"],
});

const NOTES_DIR = path.join(os.homedir(), ".notes");

// Check if the notes dir exists, create it if not.
if (!checkFolderExists(NOTES_DIR)) {
	createFolder(NOTES_DIR);
}

// Initialize Keyv with a file store
const keyv = new Keyv({
	store: new KeyvFile({
		filename: path.join(NOTES_DIR, "db.json"),
	}),
});
const totalNotesKey = "total";

const formatDateTime = (date: string) =>
	new Date(date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

(async () => {
	if (args._.length === 0) {
		const totalNotes = await keyv.get(totalNotesKey);
		const allNoteKeys = totalNotes
			? Array.from({ length: totalNotes }, (_, i) => `note_${i + 1}`)
			: [];
		const allNotes = await keyv.getMany([...allNoteKeys]);

		const answers = await inquirer.prompt([
			{
				type: "list",
				name: "selectedNote",
				message: "Enter the number to open a note:",
				choices: allNotes.map((note, index) => ({
					name: `${index + 1}. ${note.fileName} | ${formatDateTime(note.createdAt)}`,
					value: `note_${JSON.stringify(index + 1)}`,
				})),
				loop: false,
			},
		]);

		let selectedNote = answers.selectedNote;
		selectedNote = await keyv.get(selectedNote);
		openFileInVim(path.join(NOTES_DIR, selectedNote.fileName));
	} else {
		const firstArg = args._[0];

		switch (firstArg) {
			case "add":
				// Consider rest of args as note name
				const rest_args = args._.slice(1).filter(Boolean);

				const now = new Date().toISOString();
				let noteName;
				let fileName;

				if (rest_args.length) {
					noteName = rest_args.join(" ");
					fileName = rest_args.join("_").toLowerCase();
				} else {
					noteName = `Untitled Note - ${now}`;
					fileName = `new_note_${now}`;
				}

				// Create the file
				noteName = `# ${noteName}\n\n\nWrite your note here...`;
				fileName = `${fileName}.md`;

				// Update the keyv store with the new note
				let totalNotes = await keyv.get<number>(totalNotesKey);
				if (!totalNotes) {
					totalNotes = 1;
					await keyv.set(totalNotesKey, totalNotes);
				} else {
					totalNotes += 1;
					await keyv.set(totalNotesKey, totalNotes);
				}

				const noteKey = `note_${totalNotes}`;
				const keyvData = {
					createdAt: now,
					note: noteName,
					noteName: noteName,
					fileName: fileName,
				};
				await keyv.set(noteKey, keyvData);

				const filePath = path.join(NOTES_DIR, fileName);
				createFile(filePath, noteName);
				openFileInVim(filePath);
				break;
			case "remove":
				break;
			default:
				break;
		}
	}
})();

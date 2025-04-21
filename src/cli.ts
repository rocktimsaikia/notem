#!/usr/bin/env node

import path from "node:path";
import { stdout } from "node:process";
import { NOTES_DIR } from "@/constants";
import {
	addNewNote,
	allNotes,
	allNotesCount,
	deleteAllNotes,
	deleteNote,
	getNoteByIndex,
} from "@/db";
import {
	checkFolderExists,
	clearFolder,
	createFile,
	createFolder,
	deleteFile,
	openFileInVim,
} from "@/file";
import { parse } from "@bomb.sh/args";
import chalk from "chalk";
import SimpleTable from "cli-simple-table";
import dedent from "dedent";
import matter from "gray-matter";
import inquirer from "inquirer";
import { titleCase } from "title-case";
import updateNotifier from "update-notifier";
import packageJson from "../package.json";

// Update notifier
updateNotifier({ pkg: packageJson }).notify();

// Initialize arguments
const argv = process.argv.slice(2);
const args = parse(argv, {
	alias: { h: "help", v: "version" },
	boolean: ["help", "version", "--delete-all"],
});

// Check if the notes directory exists.
if (!checkFolderExists(NOTES_DIR)) {
	createFolder(NOTES_DIR);
}

// Initialize the table
const table = new SimpleTable({ columnPadding: 12 });
table.header("#", "Title", "Created At");

const formatDateTime = (date: string) =>
	new Date(date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

(async () => {
	// --version
	if (args.version) {
		return stdout.write(`${packageJson.version}\n`);
	}

	// --help
	if (args.help) {
		return stdout.write(dedent`
            Usage: notem [options]

            Commands:
              notem [note index]         open a note
              notem new [note title]     create a new note
              notem delete [note index]  delete a note

            Options:
              -h, --help         display this help message.
              -v, --version      display version number.
              --delete-all       delete all notes.
        `);
	}

	// --delete-all | DELETE ALL NOTES
	if (args["delete-all"]) {
		const answer = await inquirer.prompt([
			{
				type: "confirm",
				name: "confirm",
				message: `You are about to delete all ${allNotesCount} notes. Are you sure?`,
			},
		]);
		if (!answer.confirm) {
			return stdout.write("\nDeletion cancelled.\n");
		}
		await deleteAllNotes();
		clearFolder(NOTES_DIR);

		return stdout.write("\nAll notes deleted.\n");
	}

	// LIST ALL NOTES
	if (args._.length === 0) {
		if (!allNotesCount) {
			return stdout.write("No notes found.\n");
		}

		// Generate the table
		allNotes.map((note, index) => {
			table.row(
				chalk.gray(index + 1),
				chalk.green(note.fileName),
				chalk.gray(formatDateTime(note.createdAt)),
			);
		});

		console.log(table.toString());
	}

	// COMMANDS
	if (args._.length > 0) {
		const firstArg = args._[0];

		// OPEN A NOTE
		if (typeof firstArg === "number") {
			const note = getNoteByIndex(firstArg - 1);
			if (!note) {
				return stdout.write("Note not found!\n");
			}

			openFileInVim(path.join(NOTES_DIR, note.fileName));
			return;
		}

		switch (firstArg) {
			// ADD A NEW NOTE
			case "new": {
				// Consider rest of args as note name
				const rest_args = args._.slice(1).filter(Boolean);

				const now = new Date().toISOString();
				let noteName;
				let fileName;

				if (rest_args.length) {
					noteName = rest_args.join(" ");
					fileName = rest_args.join("_").toLowerCase();
				} else {
					noteName = "Untitled Note";
					fileName = `new_note_${now}`;
				}

				noteName = titleCase(noteName);
				fileName = `${fileName}.md`;

				// Update db with new note
				const noteData = {
					title: noteName,
					fileName: fileName,
					createdAt: now,
				};
				await addNewNote(noteData);

				// Prepare the frontmatter
				const noteContent = `\n# ${noteName}\n\nWrite your note here...`;
				const frontmatter = matter.stringify(noteContent, {
					title: noteName,
					date: now,
				});

				// Create a new file and open in Vim
				const filePath = path.join(NOTES_DIR, fileName);
				createFile(filePath, frontmatter);
				openFileInVim(filePath);
				break;
			}

			// DELETE A NOTE
			case "delete": {
				const targetIndex = args._[1];
				if (typeof targetIndex !== "number") {
					return stdout.write("Invalid note number.\n");
				}

				// Delete from DB
				const deletedNote = await deleteNote(targetIndex - 1);

				// Delete from file system
				const filePathToDelete = path.join(NOTES_DIR, deletedNote.fileName);
				deleteFile(filePathToDelete);

				stdout.write(`Note "${deletedNote.title}" deleted.\n`);
				break;
			}

			default:
				stdout.write("Unknown command!\n");
				break;
		}
	}
})();

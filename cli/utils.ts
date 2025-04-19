import child_process from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export function createFile(filePath: string, content: string): void {
	const absolutePath = path.resolve(filePath);
	fs.writeFileSync(absolutePath, content);
}

export function checkFolderExists(folderPath: string): boolean {
	const absolutePath = path.resolve(folderPath);
	return fs.existsSync(absolutePath) && fs.lstatSync(absolutePath).isDirectory();
}

export function createFolder(folderPath: string): void {
	const absolutePath = path.resolve(folderPath);
	fs.mkdirSync(absolutePath, { recursive: true });
}

export function clearFolder(folderPath: string): void {
	const absolutePath = path.resolve(folderPath);

	// Remove the folder and its contents
	fs.rmSync(absolutePath, { recursive: true, force: true });

	// Recreate the empty folder
	fs.mkdirSync(absolutePath, { recursive: true });
}

export function openFileInVim(filePath: string): void {
	const absolutePath = path.resolve(filePath);
	const vimProcess = child_process.spawn("vim", [absolutePath], {
		stdio: "inherit", // Inherit parent process's stdin, stdout, stderr
	});

	vimProcess.on("error", (err) => {
		console.error(`Failed to open Vim: ${err.message}`);
	});

	vimProcess.on("exit", (code) => {
		if (code !== 0) {
			console.error(`Vim exited with code ${code}`);
		}
	});
}

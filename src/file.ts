import child_process from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import which from "which";

// Create a new file
export function createFile(filePath: string, content: string): void {
	const absolutePath = path.resolve(filePath);
	fs.writeFileSync(absolutePath, content);
}

// Create a new folder
export function createFolder(folderPath: string): void {
	const absolutePath = path.resolve(folderPath);
	fs.mkdirSync(absolutePath, { recursive: true });
}

// Check if a folder exists
export function checkFolderExists(folderPath: string): boolean {
	const absolutePath = path.resolve(folderPath);
	return fs.existsSync(absolutePath) && fs.lstatSync(absolutePath).isDirectory();
}

// Clear a folder
export function clearFolder(folderPath: string): void {
	const absolutePath = path.resolve(folderPath);
	fs.rmSync(absolutePath, { recursive: true, force: true });
	fs.mkdirSync(absolutePath, { recursive: true });
}

// Delete a file
export function deleteFile(filePath: string): void {
	const absolutePath = path.resolve(filePath);
	fs.unlinkSync(absolutePath);
}

// Open a file in Vim
export function openFileInVim(filePath: string): void {
	const absolutePath = path.resolve(filePath);

	// Check if Neovim (nvim) is available, otherwise fall back to Vim
	const editor =
		which.sync("nvim", { nothrow: true }) || which.sync("vim", { nothrow: true });

	if (!editor) {
		console.error(
			"Neither Neovim (nvim) nor Vim (vim) is installed or available in PATH.",
		);
		process.exit(1);
	}

	const vimProcess = child_process.spawn(editor, [absolutePath], {
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

import os from "node:os";
import path from "node:path";

// Path to the notes directory
export const NOTES_DIR = path.join(os.homedir(), ".notes");

// Path to the notes database
export const NOTES_DB = path.join(NOTES_DIR, "db.json");

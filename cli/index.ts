import { parse } from "@bomb.sh/args";

const argv = process.argv.slice(2);
const args = parse(argv, {
	alias: { h: "help", v: "version" },
	boolean: ["help", "version"],
	array: [""],
});

if (args._.length === 0) {
	// TODO: Show interactive prompt
	console.error("Missing command");
	process.exit(1);
}

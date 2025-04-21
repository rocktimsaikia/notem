# Notem

A lightweight command-line tool for managing notes. 
> Still currently in development 🚧 but usable.

[![Release](https://github.com/rocktimsaikia/notem/actions/workflows/release.yaml/badge.svg)](https://github.com/rocktimsaikia/notem/actions/workflows/release.yaml) [![npm](https://img.shields.io/npm/v/notem?color=brightgreen)](https://www.npmjs.com/package/notem)

[![notem-demo](https://github.com/user-attachments/assets/e7da7373-9327-4ee4-bd6e-8969342d472f)](https://github.com/user-attachments/assets/a6f82686-1cf9-4714-8852-edd35fa1a248)

## Features

Notem comes with clean and simple to terminal interface. Below is a list of features:

- [x] Manage notes with simple commands. (`notem`, `notem new`, `notem delete`)
- [x] Store notes in the `~/.notes` directory.
- [ ] Open notes in the preferred text editor. (Currently only supports `nvim`, `vim`)
- [ ] Configure behaviour with `.notem-config.json` file. (TODO)

## Installation

Install globally via npm:

```sh
npm install -g notem
```

## Usage

Run commands with the following syntax:

```sh
Usage: notem [options]

Commands:
  notem [note index]         open a note
  notem new [note title]     create a new note
  notem delete [note index]  delete a note

Options:
  -h, --help         display this help message.
  -v, --version      display version number.
  --delete-all       delete all notes.
```

All the notes are stored in the `~/.notes` directory.

## License

MIT License &copy; [Rocktim Saikia](https://github.com/rocktimsaikia)

# MCP Anki Connect (`mcp-anki-connect`)

A Model Context Protocol (MCP) server that provides seamless, high-performance integration with [Anki](https://apps.ankiweb.net/) via the [AnkiConnect](https://ankiweb.net/shared/info/2055492159) add-on.

Enables AI agents (Antigravity, Claude, etc.) to inspect collections, create notes, manage decks, analyze tag hierarchies, and organize study cards programmatically.

---

## Prerequisites

1. **Install AnkiConnect Add-on in Anki**:
   - Open Anki.
   - Go to **Tools** → **Add-ons** → **Get Add-ons...**
   - Enter code: `2055492159`
   - Click **OK** and restart Anki.
2. Keep Anki running when using the MCP server.

---

## Installation & Build

```bash
# Install dependencies
npm install

# Build TypeScript to dist/
npm run build
```

---

## MCP Configuration

### 1. Antigravity IDE (Workspace Configuration)
Add to `.agents/mcp_config.json` in your workspace:

```json
{
  "mcpServers": {
    "mcp-anki-connect": {
      "command": "node",
      "args": [
        "dist/index.js"
      ]
    }
  }
}
```

### 2. Claude Desktop
Add to your Claude configuration (`%APPDATA%\Claude\claude_desktop_config.json` on Windows, `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "mcp-anki-connect": {
      "command": "node",
      "args": [
        "/path/to/mcp-anki-connect/dist/index.js"
      ]
    }
  }
}
```

---

## Tools

### Analysis & Batch Organization
* `deck_summary` – Get card counts, total notes, and subdeck distribution in a single token-efficient call.
* `tag_summary` – Inspect note and card counts per tag (supports optional prefix filtering like `ict`).
* `batch_tag_by_deck` – Automatically migrate notes from subdecks to hierarchical tags (`::`).

### Flashcard & Note Management
* `create_flashcard` – Create quick front/back flashcards in the default deck.
* `add_note` – Create custom notes with specified deck, model, fields, and tags.
* `add_notes` – Bulk create multiple notes.
* `update_note_fields` – Edit fields on existing notes.
* `find_notes` – Search notes using Anki search syntax.
* `notes_info` – Retrieve detailed note fields and tags.
* `add_tags` / `remove_tags` – Manage note tags.

### Deck Operations
* `deck_names` – List all decks in collection.
* `deck_names_and_ids` – List deck names with internal IDs.
* `change_deck` – Move cards to another deck.
* `delete_decks` – Delete specified decks.
* `get_deck_config` / `save_deck_config` – Manage deck review configurations.

### Card Operations
* `find_cards` – Search cards with query syntax.
* `cards_info` – Inspect card review history and states.
* `cards_to_notes` – Resolve note IDs from card IDs.
* `suspend` / `unsuspend` – Change card suspension status.
* `are_suspended` / `are_due` – Check card states.
* `get_intervals` – Inspect card scheduling intervals.

### GUI Control
* `gui_browse` – Open Anki card browser with pre-filled search.
* `gui_deck_browser` – Jump to deck selection screen.
* `gui_deck_review` – Start review session for a deck.
* `gui_add_cards` – Open card creation modal in Anki.

---

## Acknowledgements

Based on the original implementation by [spacholski1225/anki-connect-mcp](https://github.com/spacholski1225/anki-connect-mcp), providing structured Model Context Protocol (MCP) integration for AnkiConnect.

---

## License
MIT


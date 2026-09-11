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

### Deck Operations & Presets
* `deck_names` – List all decks in collection.
* `deck_names_and_ids` – List deck names with internal IDs.
* `change_deck` – Move cards to another deck.
* `delete_decks` – Delete specified decks.
* `deck_presets_summary` – Inspect all unique deck configuration presets across the collection with daily limits, retention targets, review orders, and FSRS stats in a single call.
* `get_deck_config` – Retrieve the full configuration group object for a specific deck.
* `save_deck_config` – Save and update deck configuration settings and presets.
* `set_deck_config_id` – Assign decks to a configuration preset ID.
* `clone_deck_config_id` – Clone an existing configuration preset with a new name.
* `remove_deck_config_id` – Delete an unused configuration preset by ID.

### Note Types & Card Templates (Card Types)
* `model_names` – List all note type/model names in the collection.
* `model_names_and_ids` – Map model names to their unique internal IDs.
* `model_field_names` – Retrieve field names for a specific note type.
* `model_fields_on_templates` – Inspect field mappings on template question and answer sides.
* `model_templates` – Retrieve all card templates (Card Types) with front/back HTML for a model.
* `model_template_rename` – Rename a card template (card type) within a model.
* `update_model_templates` – Bulk update front/back HTML templates on an existing model.
* `model_styling` – Get CSS styling rules for a note model.
* `remove_empty_models` – Safely purge unused note types/models that have 0 notes.

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


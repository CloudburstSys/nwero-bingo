# Prompt system

Nwero Bingo uses a prompt bucket system for storing and building bingo sheets, as well as a schedule system for queuing upcoming streams.

## `schedule.json` format

```jsonc
{
  "0000-00-00": {
    // Date in YYYY-MM-DD format. The website will recognise a card with this date from 12pm UTC and until 12pm UTC the next day
    "name": "", // The name of the stream, appears above the bingo card
    "customBuckets": {
      // Defines custom buckets to pull from for this stream
      // format "name": "prompt source path from /data/boards/
      "collab": "collabs/lucy-pyre_neuro.json",
    },
    "weights": {
      // Weights define how many prompts from a bucket are used. The maximum amount of prompts is always (boardWidth * boardHeight) - unique freeSpace positions
      "collab": 20, // You can refer to the name defined in the customBucket to pull from the custom bucket that was added
      "chat": 4, // Or use a predefined bucket (neuro, evil, chat, vedal, or partner)
    },
    "boardWidth": 5, // The width of the board in spaces
    "boardHeight": 5, // The height of the board in spaces
    "multipleFreeSpacesBehaviour": "theme", // How free spaces are handled if there's more than 1 for a single position. For theme, first free space is light (nwero) mode, and 2nd free space is dark (ewiv) mode.
    "freeSpaces": [
      // An array of free spaces.
      {
        "pos": [2, 2], // The position on the board.
        "src": "/assets/neuro_pirate.jpg", // The source from where to pull the image for display
        "alt": "Neuro-sama dressed in a pirate outfit, looking upset, while holding a dead fish.", // Alt-text for visually impaired
        "srcMarked": "/assets/artworks/neuro_evil_times_square_on.png", // The artwork displayed when the free space is marked.
        "useMarkedAsReal": true, // Whether to use the marked src as the "actual" artwork (displayed in explanation modal) or not.
        "credit": {
          // Credit MUST be provided for a free space image.
          "name": "PTITSA (commissioned by nicoGG)", // The name of the artist (if it's a commission piece, credit the commissoner too)
          "source": "https://discord.com/channels/574720535888396288/1261935581756391494/1261935581756391494", // The source of the artwork, where you can find the artwork OUTSIDE of the bingo site.
        },
        "streched": false, // Whether to stretch the artwork to match the size of the space.
        "overrideReminder": "" // Overrides the "don't bait neuro/evil" reminder to be a Dev Note. Use for funny little messages.
      },
    ],
  },
}
```

## prompt bucket format

```jsonc
{
  // name: Defines the short explanation which appears directly on the bingo card. This should easily explain the prompt without further detail, such as "evil speaks a different language"
  // description: Defines the long explanation available by right clicking (or holding) a prompt. Use this to define the marking requirements with more detail, such as explaining what exactly counts as Evil speaking in a different language ("evil speaking fluently in a different language for at least a single sentence")
  "name": "description",
}
```

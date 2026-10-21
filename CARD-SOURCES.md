# Card reference and implementation

The 272 public card names, category/rarity facts and functional mechanics were
observed in the DECK library, piece encyclopedia, tooltips and rules at
https://augmentchess.org/ and https://augmentchess.org/rules/ on 2026-10-21.

Counts: RULE 27, OPENING 42, MIDDLE 97, PIECE 43, END 63.
The current release is a separate implementation, with independently worded
summaries in `original-cards.js`. No source code, illustrations, logo, audio or
other original game assets were copied. Piece silhouettes remain this project's
own SVGs, with text labels for additional piece types.

`variant-core.js`, `variant-effects.js` and `variant-engine.js` implement the new
card rules. `game-engine.js` dispatches restored older games to the original
16-card engine. The UI exposes all 272 cards, filters and individual AI practice.

This is not an official port and exact parity with every original ruling is not
asserted. In particular wizard spell choices/mana costs and merchant prices are
local implementations; rare interactions among several cards are still subject
to differences. Automated coverage includes every effect handler, all initial
passive effects, targeted scenario assertions and seeded mixed games, rather than
an exhaustive proof of all card combinations.

Online transport remains the pre-existing PeerJS/WebRTC connection in this
release. Its cross-network connection problem is not fixed by the card update.
The experimental HTTPS relay client is not enabled or published with this release.

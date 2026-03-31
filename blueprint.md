
# Blueprint: Rockin' Voca

## Overview

This project is an interactive web application for learning English vocabulary, inspired by the "말해보카" (Speak-a-Voca) app. The user interface and experience are designed with a "rocker" or "punk rock" aesthetic, creating a bold, edgy, and engaging learning environment. The core gameplay loop combines a vocabulary quiz with a Tetris-style game, where correct answers are rewarded with new Tetris pieces.

## Design & Features

### Implemented

*   **Rocker Aesthetic:**
    *   **Color Palette:** Dark theme with vibrant, rebellious accent colors (electric blue, fiery orange-red).
    *   **Typography:** "Black Ops One" for a strong, stencil/military feel.
    *   **Layout:** A clean, centered layout for the core quiz functionality.
*   **Core Functionality: Vocabulary Quiz**
    *   Presents a Korean word for the user to translate into English.
    *   Provides instant feedback on the user's answer.

### Current Plan: Tetris Integration & Audio Feedback

The goal is to evolve the application into a more engaging game by integrating Tetris and adding audio feedback. Correctly answering a vocabulary question will be the trigger to receive a new piece in the Tetris game.

1.  **Update Layout & Structure (`index.html`):**
    *   Modify the layout to a two-column design to display the quiz and the Tetris game side-by-side.
    *   Add a `<canvas>` element which will be used to render the Tetris game.
    *   Add an `<audio>` element for the success sound that will play on correct answers. The audio data will be embedded using a Base64 Data URL to keep the project self-contained.
    *   The "Submit" button's text will be changed to "Check", and a "Next Word" button will be added to allow the user to control when a new word is presented.

2.  **Update Styling (`style.css`):**
    *   Implement a `flexbox`-based two-column layout.
    *   Add styling for the new game container, ensuring it fits the overall rocker aesthetic.
    *   Ensure the design is responsive and functional on different screen sizes.

3.  **Integrate Tetris Logic (`tetris.js` - New File):**
    *   Create a new file, `tetris.js`, to encapsulate all the logic for the Tetris game.
    *   The game will be rendered on the `<canvas>` element.
    *   The Tetris module will include functions for:
        *   Initializing the game board.
        *   Drawing the board, the falling pieces, and the score.
        *   Handling user input (arrow keys) for piece movement and rotation.
        *   Spawning new random Tetris pieces. This function will be called from the main script upon a correct answer.
        *   Detecting and clearing completed lines.
        *   Handling the game-over state.

4.  **Update Main Logic (`main.js`):**
    *   **Import Tetris:** Import and initialize the Tetris game from `tetris.js`.
    *   **Modify `checkAnswer()`:**
        *   When an answer is **correct**:
            1.  Play the success sound.
            2.  Call the function in `tetris.js` to spawn a new Tetris piece.
            3.  Hide the "Check" button and the answer input, and show the "Next Word" button.
        *   When an answer is **incorrect**, display the correct answer and wait for the user to click "Next Word".
    *   **Event Handling:**
        *   Add an event listener to the "Next Word" button to call `nextWord()`.
        *   Modify the `nextWord()` function to reset the UI for the next question (hide "Next Word" button, show "Check" button and input).

5.  **Add Audio (`success.mp3`):**
    *   A short, royalty-free rock guitar riff will be sourced and converted to a Base64 Data URL to be embedded directly in the `index.html` file. This avoids external file dependencies.

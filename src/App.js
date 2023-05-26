import React, { useState, useEffect } from "react";
import { calculateAITurn } from "./AI";
import "./styles.css";

const GAME_STATE = {
  PLAYER_TURN: "player_turn",
  AI_TURN: "ai_turn",
  PLAYER_WON: "player_won",
  AI_WON: "player_o_won",
  DRAW: "game_draw",
  ERROR: "game_error"
};

export const SPACE_STATE = {
  PLAYER: "player_filled",
  AI: "ai_filled",
  EMPTY: "empty_space"
};

export const GRID_LENGTH = 9;
const MAX_MOVES = 10;

const getGameStatus = (gameState) => {
  switch (gameState) {
    case GAME_STATE.PLAYER_TURN: {
      return "Your Turn";
    }
    case GAME_STATE.AI_TURN: {
      return "AI Turn";
    }
    case GAME_STATE.PLAYER_WON: {
      return "You Won!";
    }
    case GAME_STATE.AI_WON: {
      return "AI WON!";
    }
    case GAME_STATE.DRAW: {
      return "Draw";
    }
    case GAME_STATE.ERROR: {
      return "Error";
    }
    default: {
      return "Unknown game state " + gameState;
    }
  }
};

const getSquareSymbol = (spaceStatus) => {
  switch (spaceStatus) {
    case SPACE_STATE.PLAYER: {
      return "X";
    }
    case SPACE_STATE.AI: {
      return "O";
    }
    case SPACE_STATE.EMPTY: {
      return "";
    }
    default: {
      return "";
    }
  }
};

const createEmptyGrid = () => {
  return Array(GRID_LENGTH).fill(SPACE_STATE.EMPTY);
};

const getSpaceStateClass = (spaceState, gameState, winSpaces, spaceIndex) => {
  let space = "";

  if (spaceState === SPACE_STATE.AI) {
    space += "o-player";

    if (gameState === GAME_STATE.AI_WON && winSpaces.includes(spaceIndex)) {
      space += " o-winner";
    }
  }

  if (spaceState === SPACE_STATE.PLAYER) {
    space += "x-player";

    if (gameState === GAME_STATE.PLAYER_WON && winSpaces.includes(spaceIndex)) {
      space += " x-winner";
    }
  }

  return space;
};

const isDraw = (moveCount) => {
  return moveCount === MAX_MOVES;
};

const checkWinner = (grid, moveCount) => {
  const winnerSpaces = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  if (isDraw(moveCount)) {
    return {
      winner: GAME_STATE.DRAW,
      winSpaces: []
    };
  }

  for (let i = 0; i < winnerSpaces.length; i++) {
    const [a, b, c] = winnerSpaces[i];

    if (
      grid[a] === SPACE_STATE.EMPTY &&
      grid[b] === SPACE_STATE.EMPTY &&
      grid[c] === SPACE_STATE.EMPTY
    ) {
      continue;
    }

    if (grid[a] && grid[a] === grid[b] && grid[a] === grid[c]) {
      let winner = null;

      if (grid[a] === SPACE_STATE.PLAYER) {
        winner = GAME_STATE.PLAYER_WON;
      } else {
        winner = GAME_STATE.AI_WON;
      }

      return {
        winner: winner,
        winSpaces: [a, b, c]
      };
    }
  }

  return null;
};

export default function App() {
  // Grid State
  const [grid, setGrid] = useState(createEmptyGrid());
  // Count of all moves made
  const [moveCount, setMoveCount] = useState(0);
  // Spaces used to get a win
  const [winSpaces, setWinSpaces] = useState([]);
  // Current game state
  const [gameState, setGameState] = useState(GAME_STATE.PLAYER_TURN);

  // Whenever the game state changes
  // from player interaction,
  // we handle logic flow in
  // here.
  useEffect(() => {
    // Player took turn,
    // check if game still running.
    let winner = checkWinner(grid, moveCount);

    // If the player won, update state to reflect.
    if (winner) {
      setGameState(winner.winner);
      setWinSpaces(winner.winSpaces);
      return;
    }

    // Run AI turn
    if (gameState === GAME_STATE.AI_TURN && moveCount < 10) {
      const aiSpace = calculateAITurn(grid, moveCount);
      setMoveCount((oldMoves) => {
        return oldMoves + 1;
      });
      fillGridSpace(aiSpace, SPACE_STATE.AI);
      winner = checkWinner(grid, moveCount);
    }

    // If AI won, update state to reflect, else
    // go back to player turn.
    if (winner) {
      setGameState(winner.winner);
      setWinSpaces(winner.winSpaces);
    } else {
      setGameState(GAME_STATE.PLAYER_TURN);
    }
  }, [gameState, grid]);

  // Reset state to default values
  const reset = () => {
    setGrid(createEmptyGrid());
    setGameState(GAME_STATE.PLAYER_TURN);
    setMoveCount(0);
    setWinSpaces([]);
  };

  // Fill in a grid box with status
  const fillGridSpace = (gridIndex, spaceStatus) => {
    setGrid((oldGrid) => {
      oldGrid[gridIndex] = spaceStatus;
      return [...oldGrid];
    });
  };

  // Fill in the grid array with the player space state.
  const handlePlayerClick = (gridIndex) => {
    if (gameState !== GAME_STATE.PLAYER_TURN) {
      return;
    }

    if (grid[gridIndex] === SPACE_STATE.EMPTY) {
      fillGridSpace(gridIndex, SPACE_STATE.PLAYER);
      setGameState(GAME_STATE.AI_TURN);
      setMoveCount((oldMoves) => {
        return oldMoves + 1;
      });
    }
  };

  const Square = (props) => {
    return (
      <div
        className={
          "shadow-md h-24 w-24 rounded-lg bg-white text-7xl text-center cursor-default font-light flex items-center justify-center " +
          getSpaceStateClass(
            grid[props.squareIndex],
            gameState,
            winSpaces,
            props.squareIndex
          )
        }
        onClick={() => {
          handlePlayerClick(props.squareIndex);
        }}
      >
        {getSquareSymbol(grid[props.squareIndex])}
      </div>
    );
  };

  return (
    <>
      <div className="text-center py-2 shadow-sm text-gray-400 z-50 sticky">
        {getGameStatus(gameState)}
      </div>
      <section className="game-board py-10">
        <div className="max-w-md mx-auto">
          <div className="max-w-lg flex flex-col gap-5 mx-auto">
            <div className="flex gap-5 mx-auto">
              <Square squareIndex={0} />
              <Square squareIndex={1} />
              <Square squareIndex={2} />
            </div>
            <div className="flex gap-5 mx-auto">
              <Square squareIndex={3} />
              <Square squareIndex={4} />
              <Square squareIndex={5} />
            </div>
            <div className="flex gap-5 mx-auto">
              <Square squareIndex={6} />
              <Square squareIndex={7} />
              <Square squareIndex={8} />
            </div>
          </div>

          <div className="text-center">
            <button
              className="bg-blue-500 text-white w-full py-2 font-semibold mt-10 rounded-md shadow-lg"
              onClick={() => {
                reset();
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

import React, { Component } from "react";
import "./index.css";

// Size of the board
const totalBoardRows = 25;
const totalBoardColumns = 25;

// The function’s parameter defaults to less than 40% chance of being alive
const newBoardStatus = (cellStatus = () => Math.random() < 0.4) => {
  const grid = [];
  // The number of arrays within the main array will match the number of rows
  for (let row = 0; row < totalBoardRows; row++) {
    grid[row] = [];
    // the number of values within each of these arrays will match the number of columns
    for (let column = 0; column < totalBoardColumns; column++) {
      // Each boolean value will represent the state of each cell: “alive” or “dead”
      grid[row][column] = cellStatus();
    }
  }
  return grid;
};

// Function that receives the state of the whole board status and toggle method
const BoardGrid = ({ boardStatus, onToggleCellStatus }) => {
  // Method that allows users to toggle the status of individual cells as props
  const handleClick = (row, column) => onToggleCellStatus(row, column);

  // Each cell is represented by a table’s <td>
  const tr = [];
  for (let row = 0; row < totalBoardRows; row++) {
    const td = [];
    for (let column = 0; column < totalBoardColumns; column++) {
      // Clicking on a cell results in the method being called with the cell’s row and column location as arguments
      td.push(
        <td
          key={`${row},${column}`}
          // className attribute whose value depends on the boolean value of the corresponding board cell
          className={boardStatus[row][column] ? "alive" : "dead"}
          onClick={() => handleClick(row, column)}
        />
      );
    }
    tr.push(<tr key={row}>{td}</tr>);
  }
  return (
    <table>
      <tbody>{tr}</tbody>
    </table>
  );
};

// Function component that creates a slider to allow players to change the speed of iterations
const Slider = ({ speed, onSpeedChange }) => {
  const handleChange = (e) => onSpeedChange(e.target.value);

  return (
    <input
      type="range"
      min="0"
      max="1000"
      step="50"
      // current speed state
      value={speed}
      // method to handle the speed change as props
      onChange={handleChange}
    />
  );
};

class App extends Component {
  state = {
    // When the game starts, the board’s cells status will be returned by the function that generates a new board status
    boardStatus: newBoardStatus(),
    // Generation starts at 0
    generation: 0,
    // Game runs when player decides
    isGameRunning: false,
    // Default speed is 300ms
    speed: 300,
  };

  // Clears the board sets the state for all cells to false, allowing for toggling individual cell status
  handleClearBoard = () => {
    this.setState({
      boardStatus: newBoardStatus(() => false),
      generation: 0,
    });
  };

  // Clears the board and the status of each cell becomes by default a random boolean value
  handleNewBoard = () => {
    this.setState({
      boardStatus: newBoardStatus(),
      generation: 0,
    });
  };

  // Method to handle player requests to toggle individual cell status
  handleToggleCellStatus = (row, column) => {
    // Sets the states of the board status by calling a function and passing it the previous state as argument
    const toggleBoardStatus = (prevState) => {
      // Deep clones the previous board’s status to avoid modifying it by reference when updating an individual cell
      const clonedBoardStatus = JSON.parse(
        JSON.stringify(prevState.boardStatus)
      );
      // Updates an individual cell
      clonedBoardStatus[row][column] = !clonedBoardStatus[row][column];
      // returns the updated cloned board status, effectively updating the status of the board
      return clonedBoardStatus;
    };

    // Calls toggleBoardStatus
    this.setState((prevState) => ({
      boardStatus: toggleBoardStatus(prevState),
    }));
  };
  // Handles the games progress, gets called on when making the next move
  handleStep = () => {
    const nextStep = (prevState) => {
      const boardStatus = prevState.boardStatus;
      const clonedBoardStatus = JSON.parse(JSON.stringify(boardStatus));

      // eight possible neighbors
      const amountTrueNeighbors = (row, column) => {
        const neighbors = [
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [0, 1],
          [1, 1],
          [1, 0],
          [1, -1],
          [0, -1],
        ];
        // reduce neighbors, return new array of neighbors
        return neighbors.reduce((trueNeighbors, neighbor) => {
          const x = row + neighbor[0];
          const y = column + neighbor[1];
          // Calculates the amount of neighbors within the board with value true for an individual cell
          const isNeighborOnBoard =
            x >= 0 && x < totalBoardRows && y >= 0 && y < totalBoardColumns;
          // No need to count more than 4 alive neighbors
          if (trueNeighbors < 4 && isNeighborOnBoard && boardStatus[x][y]) {
            return trueNeighbors + 1;
          } else {
            return trueNeighbors;
          }
        }, 0);
      };

      // Updates the cloned board’s individual cell status and returns the cloned board status
      for (let row = 0; row < totalBoardRows; row++) {
        for (let column = 0; column < totalBoardColumns; column++) {
          const totalTrueNeighbors = amountTrueNeighbors(row, column);
          if (!boardStatus[row][column]) {
            if (totalTrueNeighbors === 3) clonedBoardStatus[row][column] = true;
          } else {
            if (totalTrueNeighbors < 2 || totalTrueNeighbors > 3)
              clonedBoardStatus[row][column] = false;
          }
        }
      }

      return clonedBoardStatus;
    };

    // Sets the updated cloned board status to state
    this.setState((prevState) => ({
      boardStatus: nextStep(prevState),
      // Adds one to the generation’s state to inform the player how many iterations have been produced so far
      generation: prevState.generation + 1,
    }));
  };
  // Handles changing the game's speed
  handleSpeedChange = (newSpeed) => {
    this.setState({ speed: newSpeed });
  };

  // Handles starting the game
  handleStart = () => {
    this.setState({ isGameRunning: true });
  };

  // Handles stopping the game
  handleStop = () => {
    this.setState({ isGameRunning: false });
  };

  // Stop or set a timer depending on different combinations of values
  componentDidUpdate(prevProps, prevState) {
    const { isGameRunning, speed } = this.state;
    const speedChanged = prevState.speed !== speed;
    const gameStarted = !prevState.isGameRunning && isGameRunning;
    const gameStopped = prevState.isGameRunning && !isGameRunning;

    // Stops or starts timer
    if ((isGameRunning && speedChanged) || gameStopped) {
      clearInterval(this.timerID);
    }

    // The timer schedules a call to the handleStep method at the specified speed intervals
    if ((isGameRunning && speedChanged) || gameStarted) {
      this.timerID = setInterval(() => {
        this.handleStep();
      }, speed);
    }
  }

  // Render method
  render() {
    const { boardStatus, isGameRunning, generation, speed } = this.state;

    return (
      <div>
        <h1>Jerry Conway's Game of Life</h1>
        <div className="container">
          <div className="left">
            <h3>{`Generation: ${generation}`}</h3>
            <BoardGrid
              boardStatus={boardStatus}
              onToggleCellStatus={this.handleToggleCellStatus}
            />
          </div>
          <div className="middle">
            <span className="speedometer">
              <h3>Game Speed</h3>
              {"Max "}
              <Slider speed={speed} onSpeedChange={this.handleSpeedChange} />
              {" Min"}
            </span>
            <div className="buttons">
              <button type="button" onClick={this.handleStart}>
                Start
              </button>
              <button type="button" onClick={this.handleStop}>
                Stop
              </button>
              <button
                type="button"
                disabled={isGameRunning}
                onClick={this.handleStep}
              >
                Next
              </button>
              <button type="button" onClick={this.handleClearBoard}>
                Clear
              </button>
              <button type="button" onClick={this.handleNewBoard}>
                Reset
              </button>
            </div>
          </div>
          <div className="right">
            <h2>Rules</h2>
            <p>
              Any live cell with fewer than two live neighbours dies, as if by
              underpopulation
            </p>
            <p>
              Any live cell with two or three live neighbours lives on to the
              next generation
            </p>
            <p>
              Any live cell with more than three live neighbours dies, as if by
              overpopulation
            </p>
            <p>
              Any dead cell with exactly three live neighbours becomes a live
              cell, as if by reproduction
            </p>
          </div>
          <div className="bottom">
            <h2>About the Algorithm</h2>
            <p>
              The Game of Life, also known simply as Life, is a cellular
              automaton devised by the British mathematician John Horton Conway
              in 1970. It is a zero-player game, meaning that its evolution is
              determined by its initial state, requiring no further input. One
              interacts with the Game of Life by creating an initial
              configuration and observing how it evolves. It is Turing complete
              and can simulate a universal constructor or any other Turing
              machine.
            </p>
            <p>
              A cellular automaton consists of a regular grid of cells, each in
              one of a finite number of states, such as on and off (in contrast
              to a coupled map lattice). The grid can be in any finite number of
              dimensions. For each cell, a set of cells called its neighborhood
              is defined relative to the specified cell. An initial state (time
              t = 0) is selected by assigning a state for each cell. A new
              generation is created (advancing t by 1), according to some fixed
              rule (generally, a mathematical function) that determines the new
              state of each cell in terms of the current state of the cell and
              the states of the cells in its neighborhood. Typically, the rule
              for updating the state of cells is the same for each cell and does
              not change over time, and is applied to the whole grid
              simultaneously, though exceptions are known, such as the
              stochastic cellular automaton and asynchronous cellular automaton.
            </p>
            <p>
              In computability theory, a system of data-manipulation rules (such
              as a computer's instruction set, a programming language, or a
              cellular automaton) is said to be Turing-complete or
              computationally universal if it can be used to simulate any Turing
              machine. This means that this system is able to recognize or
              decide other data-manipulation rule sets. Turing completeness is
              used as a way to express the power of such a data-manipulation
              rule set. Virtually all programming languages today are
              Turing-complete. The concept is named after English mathematician
              and computer scientist Alan Turing.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

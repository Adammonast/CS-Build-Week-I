import React, { Component } from "react";

// Size of the board
const totalBoardRows = 50;
const totalBoardColumns = 50;

// The function’s parameter defaults to less than 30% chance of being alive
const newBoardStatus = (cellStatus = () => Math.random() < 0.3) => {
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

// Function that receives the state of the whole board status
// Method that allows users to toggle the status of individual cells as props
const BoardGrid = ({ boardStatus, onToggleCellStatus }) => {
  const handleClick = (row, column) => onToggleCellStatus(row, column);

  // Each cell is represented by a table’s <td>
  // className attribute whose value depends on the boolean value of the corresponding board cell
  const tr = [];
  for (let row = 0; row < totalBoardRows; row++) {
    const td = [];
    for (let column = 0; column < totalBoardColumns; column++) {
      // Clicking on a cell results in the method being called with the cell’s row and column location as arguments
      td.push(
        <td
          key={`${r},${c}`}
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
      min="50"
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
  render() {
    return <div></div>;
  }
}

export default App;

import "./App.css";
import { Routes, Route } from "react-router-dom";
import Lobby from "./Screens/Lobby";
import Room from "./Screens/Room";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </div>
  );
}

export default App;

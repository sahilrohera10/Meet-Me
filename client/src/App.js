import "./App.css";
import { Routes, Route } from "react-router-dom";
import Lobby from "./Screens/Lobby";
import Room from "./Screens/Room";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";

function App() {
  return (
    <Provider store={appStore}>
    <div className="App">
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </div>
    </Provider>
  );
}

export default App;

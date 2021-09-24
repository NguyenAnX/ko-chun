import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import NewMatch from "./components/guest-mode/NewMatch";
import PlayingMatch from "./components/guest-mode/PlayingMatch";
import Ranking from "./components/guest-mode/Ranking";
import URI from "./constants/uri";

function App() {
  return (
    <Router>
      <Switch>
        <div style={{ padding: 12 }}>
          <Route exact path={`${URI.ROOT}`}>
            <NewMatch></NewMatch>
          </Route>
          <Route exact path={`${URI.PLAYING}:matchId`}>
            <PlayingMatch></PlayingMatch>
          </Route>
          <Route exact path={`${URI.RANKING}:matchId`}>
            <Ranking></Ranking>
          </Route>
        </div>
      </Switch>
    </Router>
  );
}

export default App;

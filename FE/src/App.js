import "./App.css";
import Homepage from "./Pages/Homepage";
import { Route, Switch } from "react-router-dom";
import Chatpage from "./Pages/Chatpage";
import "./fontawasome.js"
import setup from "./services/interceptor";
import { RequireAuth } from '../src/Context/AuthProvider'
import "./components/communication/css/app.scss"

setup()
function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/" component={Homepage} exact />
        <Route path="/chats"
          component={()=>
            <RequireAuth>
              <Chatpage />
            </RequireAuth>
          } 
          exact
          />
      </Switch>
    </div>
    
  );
}

export default App;

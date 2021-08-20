import './App.css';
import Form from './LoginAndSignup/Form.jsx';
import Profile from './Profile/Profile.jsx';
import {BrowserRouter as Router, Route, Switch, Redirect} from "react-router-dom"


function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/form" component={()=><Form/>} />
        <Route exact path="/profile/:id"  component={()=><Profile/>}/>
        <Route exact path="/">
          <Redirect to="/form"></Redirect>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

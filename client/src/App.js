import './App.css';
import Form from './LoginAndSignup/Form.jsx';
import Profile from './Profile/Profile.jsx';
import {BrowserRouter as Router, Route, Switch, Redirect} from "react-router-dom"
import {useState} from "react"
import socketClient from "socket.io-client"


function App() {
  const id = window.location.href.slice(30)
  return (
    <Router>
      <Switch>
        <Route exact path="/form" component={()=><Form/>} />
        <Route exact path="/profile/:id"  component={()=><Profile userId={id}/>}/>
        <Route exact path="/">
          <Redirect to="/form"></Redirect>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

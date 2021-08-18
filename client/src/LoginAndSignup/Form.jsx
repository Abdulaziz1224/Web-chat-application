import React from 'react'
import "./form.css"
import facebook from "../assets/facebook.svg"
import google from "../assets/google.svg"
import linkedin from "../assets/linkedin.svg"
import lock from "../assets/lock.png"
import {useState, useEffect} from "react"
import axios from "axios"
import {useHistory} from "react-router-dom"
import {io, Socket} from "socket.io-client"

function Form({sendId}) {
  const socket = io("http://localhost:5000",{
    path:"",
  })

  const [disable,
    setDisable] = useState(false)

  let history = useHistory()
  const [signinEmail,
    setSigninEmail] = useState("")
  const [signinPassword,
    setSigninPassword] = useState("")

  let enter = (Email, Password) => {
  
    socket.on("signinres", (e) => {
      if (e.authenticated) {
        history.push(`/profile/${e._id}`)
        console.log(e)
      }  
    })
    console.log("aaaaa")
    socket.emit("signinreq", {
      email: signinEmail,
      password: signinPassword
    })
    
  }

  

  const [regName,
    setRegName] = useState("")
  const [regEmail,
    setRegEmail] = useState("")
  const [regPassword,
    setregPassword] = useState("")
  let register = () => {
    axios
      .post("http://localhost:5000/signup", {
      imageUrl: "",
      Name: regName,
      email: regEmail,
      password: regPassword
    })
      .then((e) => {
        if (e.data === "register completed") {}
      })
  }

  const [signin,
    setSignin] = useState(null)
  var moving = "movingWindow"
  var btnAnime = ""
  var h1Anime = ""
  var pAnime = ""

  if (signin) {
    moving = "movingWindow signinAnime1"
    btnAnime = "btnAnime1 btnAnimeAfter1"
    h1Anime = "h1Anime1"
    pAnime = "pAnime1"
  }
  if (signin === false) {
    moving = "movingWindow signinAnime2";
    btnAnime = "btnAnime2 btnAnimeAfter2";
    h1Anime = "h1Anime2"
    pAnime = "pAnime2"
  }

  return (
    <div className="Page">
      <div className="bg-image"></div>
      <div className="FormContainer">

        <div className={signin
          ? "signin"
          : "signin signinAnime"}>
          <h1>Sign in to Chat app</h1>
          <div className="BtnGroup">
            <button className="btn"><img src={facebook} alt="" className="icons"/></button>
            <button className="btn"><img src={google} alt="" className="icons"/></button>
            <button className="btn"><img src={linkedin} alt="" className="icons"/></button>
          </div>
          <p className="textOfForm">or use your email account:</p>
          <div className="inputText">
            <i className="far fa-envelope"></i>
            <input
              type="email"
              placeholder="Email"
              onChange={(e) => setSigninEmail(e.target.value)}
              value={signinEmail}/>
          </div>
          <div className="inputText">
            <img src={lock} alt=""/>
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setSigninPassword(e.target.value)}
              value={signinPassword}/>
          </div>
          <h4>Forgot your password?</h4>
          <span className="shadow"></span>
          <button className="signBtn" onClick={enter}>SIGN IN</button>
        </div>

        <div className="signup">
          <h1>Create Account</h1>
          <div className="BtnGroup">
            <button className="btn"><img src={facebook} alt="" className="icons"/></button>
            <button className="btn"><img src={google} alt="" className="icons"/></button>
            <button className="btn"><img src={linkedin} alt="" className="icons"/></button>
          </div>
          <p className="textOfForm">or use your email for registration:</p>
          <div className="inputText">
            <i className="far fa-user"></i><input
              type="email"
              placeholder="Name"
              onChange={(e) => setRegName(e.target.value)}
              value={regName}/>
          </div>
          <div className="inputText">
            <i className="far fa-envelope"></i>
            <input
              type="email"
              placeholder="Email"
              onChange={(e) => setRegEmail(e.target.value)}
              value={regEmail}/>
          </div>
          <div className="inputText">
            <img src={lock} alt=""/>
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setregPassword(e.target.value)}
              value={regPassword}/>
          </div>
          <button className="signBtn" onClick={register}>SIGN UP</button>
        </div>

        <div className={moving}>
          <h1 className={h1Anime}></h1>
          <p id={pAnime} className="textOfForm"></p>
          <button className={btnAnime} onClick={() => setSignin(!signin)}></button>
        </div>
      </div>

    </div>

  )
}

export default Form

import React from 'react'
import {useState, useEffect} from 'react'
import socketClient from "socket.io-client"
import {v4 as uid} from "uuid"

import "./Profile.css"
import userImg from "../assets/user.png"
import peopleIcon from "../assets/peopleIcon.svg"
import searchIcon from "../assets/searchIcon.svg"
import attachmentIcon from "../assets/attachmentIcon.svg"
import voiceIcon from "../assets/voiceIcon.svg"
import sendIcon from "../assets/sendIcon.svg"
import groupIcon from "../assets/groupIcon.svg"
import favoriteIcon from "../assets/favoriteIcon.svg"
let transientImg = "https://picsum.photos/200"

function Profile({userId}) { 

  const [search,
    setSearch] = useState({display: "none"})
  const [itemSelector,
    setItemSelector] = useState({left: "1.3vw", selected: "friends"})
  const [user,
    setUser] = useState({})
  const [status,
    setStatus] = useState("")
  const [searchFriend,
    setSearchFriend] = useState({Name: ""})
  const [foundList,
    setfoundList] = useState([])
  const [foundSelect,
    setFoundSelect] = useState(0)
  const [friendList,
    setFriendList] = useState([])
  const [friendSelect,
    setFriendSelect] = useState(-1)
  const [messages,
    setMessages] = useState([])
  const [messagesFetched,
    setMessagesFetched] = useState(false)
  const [message,
    setMessage] = useState("")
  // const [friendListFetched,   setFriendListFetched] = useState(false)
  const [socket] = useState(socketClient("https://web-chat-application-1.herokuapp.com/profile", {path: ""}))
  const [id] = useState(window.location.href.slice(-24))
  const [msgCount, setMsgCount] = useState(0)

  const gradients = [
    "linear-gradient(white, white), linear-gradient(to right, #c6ffdd, #fbd786, #f7797d)",
    "linear-gradient(white, white), linear-gradient(to right, #12c2e9, #c471ed, #f64f59)",
    "linear-gradient(white, white), linear-gradient(to right, #b92b27, #1565c0)",
    "linear-gradient(white, white), linear-gradient(to right, #2980b9, #6dd5fa, #ffffff)",
    "linear-gradient(white, white), linear-gradient(to right, #ff0099, #493240)",
    "linear-gradient(white, white), linear-gradient(to right, #8e2de2, #4a00e0)",
    "linear-gradient(white, white), linear-gradient(to right, #f953c6, #b91d73)",
    "linear-gradient(white, white), linear-gradient(to right, #7f7fd5, #86a8e7, #91eae4)",
    "linear-gradient(white, white), linear-gradient(to right, #c31432, #240b36)",
    "linear-gradient(white, white), linear-gradient(to right, #f12711, #f5af19)",
  ]

  // const socket =
  // socketClient("https://web-chat-application-1.herokuapp.com/profile",{
  // path:"", })
  socket.on("connect", () => {
    console.log("2222222222")
    console.log(socket.id)
  })

  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.disconnected)
    })
    console.log(socket.id)
    socket.emit("user", {userId: id})
    socket.on("profiledata", (data) => {
      setUser(data.userData)
      setStatus(data.status)
      console.log(data)
    })

    socket.emit("friends", id)
    socket.on("getFriends", (data) => {
      setFriendList(data)
      // setFriendListFetched(true)
    })

  }, [id, socket])


  useEffect(()=>{
    if (friendList.length !== 0 && friendSelect !== -1) {
      socket.emit("allMessages", {
        user_id: user._id,
        friend_id: friendList[friendSelect]._id
      })
      socket.on("reciveAllMessages", data => {
        setMessages(data)
        setMessagesFetched(true)
        console.log(messages)
      })    
    }
  },[friendSelect])
  

  //  ################## data fetching with socket.io ###############

  useEffect(() => {

    // axios.post("https://web-chat-application-1.herokuapp.com" + "/search", {Name:
    // searchFriend.Name}).then((res) => {   console.log(searchFriend.Name)
    // setfoundList(res.data) })
    socket.emit("search", {Name: searchFriend.Name})
    socket.on("searchRes", (data) => {
      console.log(data)

      setfoundList(data)
    })

    if (searchFriend.Name === "") {
      setfoundList([])
    }

  }, [searchFriend.Name, socket])

  let sendMessage = () => {
    setMessage("")
    setMsgCount(msgCount+1)
    console.log(foundList)
    if (foundList.length > 0) {
      console.log("hbckjhdsbckjhdsbcjh")
      let friend_id;
      if (itemSelector.selected === "search" && foundList.length !== 0) {
        friend_id = foundList[foundSelect]._id
        socket.emit("sendmsg", {
          message: {
            user_id: friend_id,
            text: {
              author_id: id,
              value: message,
              date: new Date()
            }
          }
        })
        console.log("dhbjhcbdnmc")
      }

    }
    if (friendList.length !== 0 && friendSelect !== -1) {
      let friend_id;
      if (itemSelector.selected === "friends" && friendList.length !== 0) {
        friend_id = friendList[friendSelect]._id
        socket.emit("sendmsg", {
          message: {
            user_id: friend_id,
            text: {
              author_id: id,
              value: message,
              date: new Date()
            }
          }
        })
        let newMsg = messages
        newMsg.push({
          author_id: id,
          value: message,
          date: new Date()
        })
        setMessages(newMsg)
      }
    }
  }

  useEffect(() => {
    scrollTo()
  }, [messages])

  function scrollTo() {
    const div = document.getElementById("messageField")
    div.scrollTop = div.scrollHeight
  }

  function randomGradient() {
    // return {backgroundImage: "linear-gradient(white, white), linear-gradient(to right, #7f7fd5, #86a8e7, #91eae4)"}
    return {backgroundImage: gradients[Math.floor(Math.random()*10)]}
  }

  // useEffect(() => {   if (friendList.length !== 0) {     const user_id = userId
  //     const friend_id = friendList[friendSelect]._id
  // socket.on("reciveAllMessages", data => {       console.log(data);
  // socket.emit("allMessages", {         user_id: user._id,         friend_id:
  // friendList[friendSelect]._id       })     })   } }, [friendSelect])
  // ************************ data fetch end ******************

  return (
    <div className="container">
      <div className="listContainer">
        <section className="user">
          <div className="nameAndStatus">
            <img src={transientImg} alt="" className="profileImg" style={randomGradient()}/>
            <h3 className="name">{user.Name}</h3>
            <div className="statusView">
              <span className="statusDot"></span>
              <p className="statusText">{status}</p>
            </div>
          </div>
          <div className="expendmore">
            <span className="expendmoreDot"></span>
            <span className="expendmoreDot"></span>
            <span className="expendmoreDot"></span>
          </div>
        </section>

        <section className="friendList" id="friendListScrollbar">
          {friendList.map((obj) => {
            return (
              <div
                className={friendSelect === friendList.indexOf(obj)
                ? "selected"
                : ""}
                key={friendList.indexOf(obj)}
                id="friends"
                onClick={() => {
                setFriendSelect(friendList.indexOf(obj))
              }}>
                <div className="nameAndStatus">
                  <img src={transientImg} alt="Profile Img" className="profileImg" style={randomGradient()}/>
                  <h3 className="name">{obj.Name}</h3>
                  <p className="lastMessage"></p>
                </div>
                <div className="dateAndUnread">
                  <p className="date">24/12/2000</p>
                  <div className="unread">
                    <span className="greenDot"></span>
                    <span className="greenDot"></span>
                  </div>
                </div>
              </div>
            )
          })}
        </section>
        <div className="searchField" style={search} id="searchScrollbar">
          <input
            type="text"
            className="searchFriend"
            value={searchFriend.Name}
            onChange={(e) => setSearchFriend({Name: e.target.value})}/> {foundList.map((obj) => {
            if (obj._id !== user._id) {
              return (
                <div
                  id="friends"
                  key={obj._id}
                  className={foundSelect === foundList.indexOf(obj)
                  ? "selected"
                  : ""}
                  onClick={() => {
                  setFoundSelect(foundList.indexOf(obj))
                }}>
                  <img src={obj.imageUrl} alt="Profile Img" className="profileImg" style={randomGradient()}/> 
                  <div className="nameAndStatus">
                    <h3 className="name">{obj.Name}</h3>
                    <p className="lastMessage"></p>
                  </div>
                  <div className="dateAndUnread">
                    <p className="date">24/12/2000</p>
                    <div className="unread">
                      <span className="greenDot"></span>
                      <span className="greenDot"></span>
                    </div>
                  </div>
                </div>
              )
            }
            return ("")
          })
}
        </div>
        <div className="nav">
          <div className="itemsOfNav">
            <div
              className="item people"
              onClick={() => {
              setSearch({display: "none"});
              setItemSelector({left: "1.3vw", selected: "friends"})
            }}>
              <img src={peopleIcon} alt=""/>
            </div>
            <div className="item group">
              <img src={groupIcon} alt=""/>
            </div>
            <div className="item favorite">
              <img src={favoriteIcon} alt=""/>
            </div>
            <div
              className="item search"
              onClick={() => {
              setSearch({display: "flex"});
              setItemSelector({left: "14.8vw", selected: "search"})
            }}>
              <img src={searchIcon} alt=""/>
            </div>
          </div>
          <span className="selectorOfItems" style={itemSelector}></span>
        </div>
      </div>


      <section className="chatSpace">
        <div className="chatSpaceTop">
          <div className="chatAndMedia">
            <button className="chatBtn">Chat</button>
            <button className="mediaBtn">Media</button>
            <span className="chatAndMediaSelector"></span>
          </div>
        </div>
        <section className="messageField" id="messageField">
          {!messagesFetched
            ? ""
            : messages.map((obj) => {
              if (obj.author_id === user._id && messagesFetched) {
                return (messages.indexOf(obj) === 0
                  ? <div className="myMessage" id="myItems" key={uid()}>
                      <h4 className="myName">
                        {user.Name}
                        <div className="myNameRight"></div>
                      </h4>
                      <div className="imgAndMsgBox">
                        <div className="msgContainer" id="msgContainer">
                          <div className="msgBox">
                            <p className="msg">
                              {obj.value}
                            </p>
                            <p className="msgDate">15:30</p>
                          </div>
                        </div>
                        <div className="imgBox">
                          <img src={userImg} alt=""/>
                        </div>
                      </div>
                    </div>

                  : (messages[(messages.indexOf(obj)) - 1].author_id === obj.author_id)
                    ? <div id="nextMsg" key={uid()}>
                        <div className="msgContainer">
                          <div className="msgBox">
                            <p className="msg">
                              {obj.value}
                            </p>
                            <p className="msgDate">15:30</p>
                          </div>
                        </div>
                      </div>

                    : <div className="myMessage" id="myItems" key={uid()}>
                      <h4 className="myName">
                        {user.Name}
                        <div className="myNameRight"></div>
                      </h4>
                      <div className="imgAndMsgBox">
                        <div className="msgContainer" id="msgContainer">
                          <div className="msgBox">
                            <p className="msg">
                              {obj.value}
                            </p>
                            <p className="msgDate">15:30</p>
                          </div>
                        </div>
                        <div className="imgBox">
                          <img src={userImg} alt=""/>
                        </div>
                      </div>
                    </div>)

              } else {
                if (messagesFetched && messages.length > 0) {

                  return (messages.indexOf(obj) === 0
                    ? ""
                    : messages[messages.indexOf(obj) - 1].author_id === obj.author_id
                      ? <div className="msgContainer" id='friendNextMsg' key={obj._id}>
                          <div className="msgBox">
                            <p className="msg">
                              {obj.value}
                            </p>
                            <p className="msgDate">15:30</p>
                          </div>
                        </div>
                      : <div className="friendMessage" key={obj._id}>
                        <h4 className="friendsName">
                          <div className="friendNameLeft"></div>
                          {friendList[friendSelect].Name}
                        </h4>
                        <div className="imgAndMsgBox">
                          <div className="imgBox">
                            <img src={userImg} alt=""/>
                          </div>
                          <div className="msgContainer">
                            <div className="msgBox">
                              <p className="msg">
                                {obj.value}
                              </p>
                              <p className="msgDate">15:30</p>
                            </div>
                          </div>
                        </div>
                      </div>)
                }

              }
              return ("")
            })}

        </section>
        <section className="inputBox">
          <div className="expendmoreOfField">
            <span className="expendmoreDot"></span>
            <span className="expendmoreDot"></span>
            <span className="expendmoreDot"></span>
          </div>
          <div className="inputField">
            <button className="attachmentIcon"><img src={attachmentIcon} alt=""/></button>
            <button className="voiceIcon"><img src={voiceIcon} alt=""/></button>
            <input
              type="text"
              placeholder="Type a new message"
              className="inputElement"
              value={message}
              onChange={(e) => {
              setMessage(e.target.value)
            }}/>
            <button className="sendBtn" onClick={sendMessage}>
              <p>Send</p><img src={sendIcon} alt=""/></button>
          </div>
        </section>
      </section>
    </div>
  )
}

export default Profile

import React from 'react'
import {useState, useEffect} from 'react'
import axios from 'axios'
import socketClient from "socket.io-client"

import "./Profile.css"
import userImg from "../assets/user.png"
import peopleIcon from "../assets/peopleIcon.svg"
import searchIcon from "../assets/searchIcon.svg"
import attachmentIcon from "../assets/attachmentIcon.svg"
import voiceIcon from "../assets/voiceIcon.svg"
import sendIcon from "../assets/sendIcon.svg"
import groupIcon from "../assets/groupIcon.svg"
import favoriteIcon from "../assets/favoriteIcon.svg"

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
  const [friendListFetched,
    setFriendListFetched] = useState(false)
  const getUrl = window.location.href
  const [msgCount, setMsgCount] = useState(0)

  const id = window.location.href.slice(30)

  
  const socket = socketClient("http://localhost:5000/profile",{
      path:""
    })

  useEffect(() => {
    socket.emit("profile", {userId: id})
    socket.on("profiledata",(data)=>{
      setUser(data.userData)
      setStatus(data.status)
    })

    socket.emit("friends",id)
    socket.on("getFriends", (data)=>{
      setFriendList(data)
      setFriendListFetched(true)
    })
    
  }, [])

  useEffect(() => {

    if (friendList.length !== 0 && friendSelect!=-1) {
      const user_id = userId
      const friend_id = friendList[friendSelect]._id
      socket.emit("allMessages", {
        user_id: user._id,
        friend_id: friendList[friendSelect]._id
      })
      socket.on("reciveAllMessages", data => {
        console.log(data);
        setMessages(data)
        setMessagesFetched(true)
      })
    }
    
  }, [friendSelect,msgCount])

//  ################## data fetching with socket.io ###############


  useEffect(() => {

    axios.post(getUrl.replace("3000", "5000") + "/search", {Name: searchFriend.Name}).then((res) => {
      console.log(searchFriend.Name)
      setfoundList(res.data)
    })

    if (searchFriend.Name === "") {
      setfoundList([])
    }

  }, [searchFriend.Name])

  const [message,
    setMessage] = useState("")
  let sendMessage = () => {
    setMsgCount(msgCount+1)
    if (foundList && friendSelect != -1) {
      console.log("clicked")
      let friend_id;
      if (itemSelector.selected === "search" && foundList.length !== 0) {
        friend_id = foundList[foundSelect]._id
        socket.emit("sendmsg", {
          message: {
            user_id: friend_id,
            text: {
              author_id: id,
              value: message,
              date: new Date
            }
          }
        })
      }

    }
    if (friendList.length !== 0 && friendSelect!=-1) {
      let friend_id;
      if (itemSelector.selected === "friends" && friendList.length !== 0) {
        friend_id = friendList[friendSelect]._id
        socket.emit("sendmsg", {
          message: {
            user_id: friend_id,
            text: {
              author_id: id,
              value: message,
              date: new Date
            }
          }
        })

      }
    }
    socket.on("msgSent", (res)=>{
      let msg = messages
      msg.push(res.message.text[0])
      setMessages(msg)
      console.log(res) 
    })
    console.log(messages)
  }

  

  
  

  // useEffect(() => {
    
  //   if (friendList.length !== 0) {
  //     const user_id = userId
  //     const friend_id = friendList[friendSelect]._id
  //     socket.on("reciveAllMessages", data => {
  //       console.log(data);
  //       socket.emit("allMessages", {
  //         user_id: user._id,
  //         friend_id: friendList[friendSelect]._id
  //       })

  //     })
  //   }

  // }, [friendSelect])


// ************************ data fetch end ****************** 

  return (
    <div className="container">
      <div className="listContainer">
        <section className="user">
          <img src={userImg} alt="" className="profileImg"/>
          <div className="nameAndStatus">
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
                <img src={userImg} alt="Profile Img" className="profileImg"/>
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
                  <img src={obj.imageUrl} alt="Profile Img" className="profileImg"/>
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

      <div className="chatAndMedia">
        <button className="chatBtn">Chat</button>
        <button className="mediaBtn">Media</button>
        <span className="chatAndMediaSelector"></span>
      </div>

      <section className="chatSpace">
        <div className="chatSpaceTop"></div>
        <section className="messageField">
          {!messagesFetched
            ? ""
            : messages.map((obj) => {
              if (obj.author_id === user._id) {
                console.log("aaa");
                if (messagesFetched) {
                  return (messages.indexOf(obj) === 0
                    ? <div className="myMessage" id="myItems">
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
                      ? <div id="nextMsg">
                          <div className="msgContainer">
                            <div className="msgBox">
                              <p className="msg">
                                {obj.value}
                              </p>
                              <p className="msgDate">15:30</p>
                            </div>
                          </div>
                        </div>

                      : <div className="myMessage" id="myItems">
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
                }

              } else {
                if (messagesFetched && messages.length > 0) {

                  return (messages.indexOf(obj) === 0
                    ? ""
                    : messages[messages.indexOf(obj) - 1].author_id === obj.author_id
                      ? <div className="msgContainer" id='friendNextMsg'>
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

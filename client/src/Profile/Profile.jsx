import React from 'react'
import {useState, useEffect} from 'react'
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
  const [message,
    setMessage] = useState("")
  // const [friendListFetched,
  //   setFriendListFetched] = useState(false)
  const [msgCount, setMsgCount] = useState(0)
  const [socket] = useState(socketClient("https://web-chat-application-1.herokuapp.com/profile",{
    path:"",
  }))
  const [id] = useState(window.location.href.slice(-24))
 
  // const socket = socketClient("https://web-chat-application-1.herokuapp.com/profile",{
  //   path:"",
  // })
  socket.on("connect",()=>{
    console.log("2222222222")
  }) 
  
  useEffect(() => {
    socket.on("connect",()=>{
      console.log(socket.disconnected)
    })
    socket.emit("user", {userId: id})
    socket.on("profiledata",(data)=>{
      setUser(data.userData)
      setStatus(data.status)
      console.log(data)
    })

    socket.emit("friends",id)
    socket.on("getFriends", (data)=>{
      setFriendList(data)
      // setFriendListFetched(true)
    })    
    
  },[id,socket]) 

 
  useEffect(() => {
    if (friendList.length !== 0 && friendSelect!==-1) {
      socket.emit("allMessages", {
        user_id: user._id,
        friend_id: friendList[friendSelect]._id
      })
      socket.on("reciveAllMessages", data => {
        setMessages(data)
        setMessagesFetched(true)
      })
      console.log(messages)  
    }
  }, [friendSelect,msgCount,friendList,socket,message,messages,user._id]) 

  function selectFriend(index){
    setFriendSelect(index)
  }
  
//  ################## data fetching with socket.io ###############


  useEffect(() => {

    // axios.post("https://web-chat-application-1.herokuapp.com" + "/search", {Name: searchFriend.Name}).then((res) => {
    //   console.log(searchFriend.Name)
    //   setfoundList(res.data)
    // })
    socket.emit("search", {Name: searchFriend.Name})
    socket.on("searchRes",(data)=>{
      console.log(data)

      setfoundList(data)
    })

    if (searchFriend.Name === "") {
      setfoundList([])
    }

  }, [searchFriend.Name,socket])

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
    if (friendList.length !== 0 && friendSelect!==-1) {
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

      }
    }
    socket.on("msgSent", (res)=>{
      let msg = messages
      msg.push(res.message.text)
      setMessages(msg)
      console.log(res) 
    })
    scrollTo()
  }

  function scrollTo(){
    const div = document.getElementById("messageField")
    div.scrollTop = div.scrollHeight
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
                  selectFriend(friendList.indexOf(obj))
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
            return("")
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
        <section className="messageField" id="messageField">
          {!messagesFetched
            ? ""
            : messages.map((obj) => {
              if (obj.author_id === user._id && messagesFetched) {
                  return (messages.indexOf(obj) === 0
                    ? <div className="myMessage" id="myItems" key={obj._id}>
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
                      ? <div id="nextMsg" key={obj._id}>
                          <div className="msgContainer">
                            <div className="msgBox">
                              <p className="msg">
                                {obj.value}
                              </p>
                              <p className="msgDate">15:30</p>
                            </div>
                          </div>
                        </div>

                      : <div className="myMessage" id="myItems"  key={obj._id}>
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
                  )

              } else {
                if (messagesFetched && messages.length > 0) {

                  return (messages.indexOf(obj) === 0
                    ? ""
                    : messages[messages.indexOf(obj) - 1].author_id === obj.author_id
                      ? <div className="msgContainer" id='friendNextMsg'  key={obj._id}>
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
              return("")
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

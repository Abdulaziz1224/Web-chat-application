const express = require("express")
const app = express()
const cors = require("cors")
const bodyParser = require("body-parser")
const {user,messages} = require("./database/db")
const httpServer = require("http").createServer(app)
const session = require("express-session")
const io = require("socket.io")(httpServer, {
    cors:{
        origin:"http://localhost:3000"
    },
    path:""
})

const sessionMiddleware = session({ secret: 'keyboard cat',resave:true,saveUninitialized:true})
app.use(sessionMiddleware);
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});
io.setMaxListeners(1);




app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(cors());

app.post("/signup",function (req, res){
    let reqInfo = req.body;
    let newUser = new user(reqInfo)
    user.findOne({email:reqInfo.email},function(err,data){
        if(err){
            console.log(err)
        }else{
            if(data){
                res.send("email already registered")
            }else{
                if(reqInfo.Name==="" || reqInfo.email==="" || reqInfo.password===""){
                    res.send("all fields required")
                }else{
                    newUser.save(function(err){
                        if(err) return handleError(err);
                        console.log("Schema has been save.")
                        res.send("register completed")
                    })
                }
            }
        }
    })
})



app.post("/profile/:id/search", function(req,res){
    let Name = req.body.Name
    user.find({Name: {$regex: new RegExp(Name,"i")}}, function (err, data){
        if(err){
            console.log(req.body.Name) 
            res.send(err)
        }else{
            const cookie = "SameSite = none; secure"
            res.setHeader("set-cookie",[cookie])
            if(Name !="")
            res.send(data)
        }
    })

})

app.post("/profile/:id/sendMsg", function(req,res){
    messages.findOne({"message.user1_id": req.params.id,"message.user2_id": req.body.message.user_id}, function(err,data){
        if(err){
            console.log(err)
        }else{
            if(data){
                messages.findOneAndUpdate({"message.user1_id": req.params.id, "message.user2_id": req.body.message.user_id},{$push: {"message.text":req.body.message.text}},{new:true}, function(err,success){
                    if(err){
                        
                        console.log("xatooo :", err)
                    }else{
                        if(success){
                            console.log(req.body.message.text)   
                        }
                    }
                })
            }else{
                messages.findOne({"message.user2_id": req.params.id,"message.user1_id": req.body.message.user_id}, function(err,data){
                    if(err){
                        console.log(err)
                    }else{
                        if(data){
                            messages.findOneAndUpdate({"message.user2_id": req.params.id,"message.user1_id": req.body.message.user_id},{$push:{"message.text":[req.body.message.text]}},{new:true}, function(err,success){
                                if(err){
                                    console.log("xatoo2222")
                                }else{
                                    console.log(data)
                                    if(success){
                                        console.log(req.body.message.text)   
                                    }
                                }
                            })
                        }else{
                            console.log("bazaga saqlandi")
                            let msg = new messages({
                                message:{
                                    user1_id: req.params.id,
                                    user2_id: req.body.message.user_id,
                                    text:[
                                        {
                                            author_id: req.params.id,
                                            value: req.body.message.text.value,
                                            date: new Date,
                                        }                                            
                                    ],
                                }
                            })
                            msg.save()
                            user.findOneAndUpdate({_id: req.params.id},{$push: {friends:{id:req.body.message.user_id}}}, function(err,success){
                                if(err){
                                    console.log(err)
                                }else{
                                    if(success){
                                        console.log("friend joined")
                                    }
                                }
                            })
                            user.findOneAndUpdate({_id: req.body.message.user_id},{$push: {friends:{id:req.params.id}}}, function(err,success){
                                if(err){
                                    console.log(err)
                                }else{
                                    if(success){
                                        console.log("friend joined")
                                    }
                                }
                            })
                        }
                    }
                })
            }
        }
    })

})



io.of("profile").on("connection", (socket)=>{
    
    socket.on("allMessages", (req)=>{
        console.log("1111111111111111")
        messages.findOne({$or:[{"message.user1_id":req.user_id, "message.user2_id": req.friend_id},{"message.user2_id":req.user_id, "message.user1_id": req.friend_id}]}, function(err,data){
            if(err){
                console.log(err)
            }else{
                console.log(data)
                if(data){
                    console.log(data)
                    io.of("profile").emit("reciveAllMessages",data.message.text)
                }
            }
        })
    })

    socket.on("profile", function (Udata){
        let id = Udata.userId
        console.log(id)
        user.findOne({_id: id}, (err, data)=>{
            console.log(data)
            if(err){
                io.of("profile").emit(err)
            }else{
                io.of("profile").emit("profiledata",{
                    userData: data,
                    status: "online",
                })
                console.log(data)
                if(!data){
                    console.log("topilmadi")
                }
            }
        })
    })
    socket.on("friends", function(id){
        user.findOne({_id: id}, function(err,data){
            if(err){
                console.log(err)
            }else{
                if(data){
                    const idArray = data.friends
                    let friends_data = []
                    idArray.map((obj)=>{
                        user.findOne({_id: obj.id}, function(err, data){
                            if(err){
                                console.log(err)
                            }else{
                               friends_data.push(data)
                               if(idArray.length-1 == idArray.indexOf(obj)){
                                   let neededInfo = friends_data.map((info)=>{
                                       return (
                                           {
                                            _id: info._id,
                                            imageUrl: info.imageUrl,
                                            Name: info.Name
                                           }
                                        )
                                   })
                                   io.of("profile").emit("getFriends", neededInfo)
                               }
                            }
                        })
                    })
                }
                
            }
        })
    })

    socket.on("sendmsg", (req)=>{
        messages.findOne({"message.user1_id": req.message.text.author_id,"message.user2_id": req.message.user_id}, function(err,data){
            if(err){
                console.log(err)
            }else{
                if(data){
                    messages.findOneAndUpdate({"message.user1_id": req.message.text.author_id, "message.user2_id": req.message.user_id},{$push: {"message.text":req.message.text}},{new:true}, function(err,success){
                        if(err){
                            
                            console.log("xatooo :", err)
                        }else{
                            if(success){
                                console.log(req)
                                // io.of("profile").emit("msgSent", {
                                //     message:{
                                //         user1_id: req.message.text.author_id,
                                //         user2_id: req.message.user_id,
                                //         text:[
                                //             {
                                //                 author_id: req.message.text.author_id,
                                //                 value: req.message.text.value,
                                //                 date: req.message.text.date,
                                //             }                                            
                                //         ],
                                //     }
                                // })   
                            }
                        }
                    })
                }else{
                    messages.findOne({"message.user2_id": req.message.text.author_id,"message.user1_id": req.message.user_id}, function(err,data){
                        if(err){
                            console.log(err)
                        }else{
                            if(data){
                                messages.findOneAndUpdate({"message.user2_id": req.message.text.author_id,"message.user1_id": req.message.user_id},{$push:{"message.text":[req.message.text]}},{new:true}, function(err,success){
                                    if(err){
                                        console.log("xatoo2222")
                                    }else{
                                        console.log(data)
                                        if(success){
                                            console.log(req)
                                            // io.of("profile").emit("msgSent", {
                                            //     message:{
                                            //         user1_id: req.message.text.author_id,
                                            //         user2_id: req.message.user_id,
                                            //         text:[
                                            //             {
                                            //                 author_id: req.message.text.author_id,
                                            //                 value: req.message.text.value,
                                            //                 date: req.message.text.date,
                                            //             }                                            
                                            //         ],
                                            //     }
                                            // })   
                                        }
                                        

                                    }
                                })
                            }else{
                                // io.of("profile").emit("msgSent", {
                                //     message:{
                                //         user1_id: req.message.text.author_id,
                                //         user2_id: req.message.user_id,
                                //         text:[
                                //             {
                                //                 author_id: req.message.text.author_id,
                                //                 value: req.message.text.value,
                                //                 date: req.message.text.date,
                                //             }                                            
                                //         ],
                                //     }
                                // })
                                console.log(req)
                                let msg = new messages({
                                    message:{
                                        user1_id: req.message.text.author_id,
                                        user2_id: req.message.user_id,
                                        text:[
                                            {
                                                author_id: req.message.text.author_id,
                                                value: req.message.text.value,
                                                date: req.message.text.date,
                                            }                                            
                                        ],
                                    }
                                })
                                msg.save()
                                user.findOneAndUpdate({_id: req.message.text.author_id},{$push: {friends:{id:req.message.user_id}}}, function(err,success){
                                    if(err){
                                        console.log(err)
                                    }else{
                                        if(success){
                                            console.log(req)
                                            // io.of("profile").emit("msgSent", {
                                            //     message:{
                                            //         user1_id: req.message.text.author_id,
                                            //         user2_id: req.message.user_id,
                                            //         text:
                                            //             {
                                            //                 author_id: req.message.text.author_id,
                                            //                 value: req.message.text.value,
                                            //                 date: req.message.text.date,
                                            //             }                                            
                                            //     }
                                            // })
                                        }
                                    }
                                })
                                // user.findOneAndUpdate({_id: req.message.user_id},{$push: {friends:{id:req.message.text.author_id}}}, function(err,success){
                                //     if(err){
                                //         console.log(err)
                                //     }else{
                                //         if(success){
                                //             console.log("friend joined")
                                //         }
                                //     }
                                // })
                            }
                        }
                    })
                }
            }
        })
    })
})

io.on("connection", (socket)=>{

    socket.on("signinreq", (res)=>{
        const email = res.email
        const password = res.password
    user.findOne({email: email}, function(err, data){
        if(err){
            res.send(err)
        }else{
            if(email ==="" || password === ""){
                io.emit("siginres","all fields required")
            }else{
                if(data){
                    if(password){
                        if(password === data.password){
                            io.emit("signinres",{
                                _id: data._id,
                                authenticated : true
                            })
                        }else{
                            io.emit("siginres","Incorrect password")
                        }
                    }else{
                        io.emit("siginres","please type password")
                    }
                }else{
                    io.emit("siginres","Incorrect email")
                }
            }
        }
    })
    })
    
})





httpServer.listen(5000,function (){
    console.log("server running on port 5000")
})

/* eslint-disable no-unused-vars */
import React, { useState, useRef, useContext, useEffect } from 'react'
import {MdSend, MdAttachFile} from 'react-icons/md'
import toast, { Toaster } from 'react-hot-toast'
import useChatContext from '../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import { baseURL } from '../config/AxiosHelper';
import SockJS from 'sockjs-client'
import {Stomp} from '@stomp/stompjs'
import { getMessages } from '../service/RoomService';
import { timeAgo } from '../config/helper';
const ChatPage = () => {

    const navigate = useNavigate()
    const {roomId, currentUser, connected, setConnected,setRoomId} = useChatContext();
    useEffect(() =>{
        if(!connected){
            navigate("/")
        }
    }
    ,
    [connected, roomId, currentUser]);
    
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const inputRef = useRef(null);
    const chatBoxRef = useRef(null);
    
    //page init
    //load message
     //load message
     useEffect(()=>{
        async function loadMessage() {
            try {
                const messages = await getMessages(roomId);
                //console.log(messages);
                setMessages(messages)
            } catch (error) {
                console.log(error);
            }
        }
        if(connected){
        loadMessage()}
    }, [roomId])

    //stompClient init
        //subscribe and get real time message

        //SockJS = road
        //STOMP = traffic rules
        //Client = vehicle
        useEffect(()=>{
            const connectWebSocket=()=>{
                //sockJS
                //SockJS sends an HTTP request to backend
                //Backend: Accepts WebSocket
                //If WebSocket not supported → SockJS falls back to HTTP polling
                //sock now holds a live connection object to backend
                const sock = new SockJS(`${baseURL}/chat`);    

                //sock only handles low-level transport
                //STOMP adds: subscribe, send, disconnect, messaging protocol
                //client becomes a STOMP client
                const client =Stomp.over(sock)
                
                client.debug = () => {}; // 🔥 disable stomp logs

                //Client sends CONNECT frame to backend
                client.connect({}, () => {
                    //Store connected client in state. This allows: sending messages later, disconnecting when component unmounts. Without this, you cannot send messages later
                    setStompClient(client);  
                    toast.success("connected")
                    //Backend sends messages to this topic. Whenever a message arrives: Callback function runs .This is real-time listening
                    client.subscribe(`/topic/room/${roomId}`, (message)=>{
                        //console.log(message);
                        const newMessage = JSON.parse(message.body);    //Convert it into JavaScript object
                        setMessages((prev)=>[...prev, newMessage]);     //prev contains old messages Spread operator copies old messages New message is added at end React re-renders UI Chat UI updates instantly
                        //rest of the work after success receiving the message
                    })
                });
            };
            if(connected){
            connectWebSocket()}
            console.log("stompClient: "+stompClient , "/n", "connected: "+connected);
        },[roomId])


    //send message handle
    const sendMessage = async()=>{
        if(stompClient && connected && input.trim()){
            const message ={
                sender:currentUser,
                content:input,
                roomId:roomId
            }
            stompClient.send(`/app/sendMessage/${roomId}`,
                {},
                JSON.stringify(message));
            setInput("");
        }
    }

   
    //scroll
    useEffect(()=>{
        if(chatBoxRef.current){
            chatBoxRef.current.scroll({
                top:chatBoxRef.current.scrollHeight,
                behavior:'smooth',
            })
        }
    },[messages])

    function handleLogout(){
        stompClient.disconnect();
        setConnected(false);
        setRoomId("")
        navigate("/");
    }
  return (
    <div className="h-screen flex flex-col relative">

        {/* Header */}
        <header className="w-full flex justify-between px-20 py-3 items-center dark:bg-gray-800">
            <h3 className="font-semibold text-xl">
            Room: <span>{roomId}</span>
            </h3>
            <h3 className="font-semibold text-xl">
            User: <span>{currentUser}</span>
            </h3>
            <button onClick={handleLogout} className="dark:bg-red-700 p-2 rounded-lg hover:dark:bg-red-600">
            Leave Room
            </button>
        </header>

        <main ref={chatBoxRef} className='pt-2 mb-20 px-4 w-2/3 dark:bg-slate-800 mx-auto h-screen overflow-auto'>
            {
                messages.map((message, index)=>(
                    <div key={index} className={`flex ${message.sender===currentUser? 'justify-end':"justify-start"}`}>
                        <div className={`my-2 ${message.sender===currentUser? 'bg-blue-400' : 'bg-green-400'} p-2 rounded max-w-xs`}>
                            <div className='flex flex-row gap-2'>
                                <img className="h-10 w-10" src="https://avatar.iran.liara.run/public/43" alt=""/>
                                <div className='px-4 flex flex-col gap-1'>
                                    <p className='text-sm text-white font-semibold'>{message.sender}</p>
                                    <p className='text-md text-white font-semibold'>{message.content}</p>
                                    <p className='text-[12px] text-gray-200'>{timeAgo(message.timeStamp)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            }
        </main>

        <div className='fixed bottom-2 w-full h-16'>
            <div className='h-full px-3 gap-4 flex items-center justify-between rounded-full w-2/3 mx-auto dark:bg-gray-900'>
                <input className='w-full dark:bg-gray-700 px-3 py-2 dark:border-gray-900 rounded-full focus:outline-none focus:ring-gray-200 focus:ring-1' type='text' id='Message' placeholder='Type a Message' value={input} onChange={(e)=>setInput(e.target.value)} 
                onKeyDown={(e)=>{
                    if(e.key==="Enter"){
                        sendMessage()
                    }
                }}/>
                
                <div className='flex gap-4 justify-center items-center'>
                    <button className='p-[2px] cursor-pointer dark:bg-blue-600 rounded-full justify-center items-center'> 
                        <MdAttachFile size={32}/> 
                    </button>
                    <button className='p-2 rounded-full h-10 w-10 hover:dark:bg-green-500 dark:bg-green-600' onClick={sendMessage}>
                        <MdSend size={25}/>
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ChatPage
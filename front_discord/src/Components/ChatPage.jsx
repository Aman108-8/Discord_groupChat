/* eslint-disable no-unused-vars */
import React, { useState, useRef, useContext, useEffect } from 'react'
import {MdSend, MdAttachFile, MdClose} from 'react-icons/md'
import toast, { Toaster } from 'react-hot-toast'
import useChatContext from '../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import { baseURL } from '../config/AxiosHelper';
import SockJS from 'sockjs-client'
import {Stomp} from '@stomp/stompjs'
import { getMessages } from '../service/RoomService';
import { timeAgo } from '../config/helper';
import axios from 'axios';
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
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const inputRef = useRef(null);
    const chatBoxRef = useRef(null);
    const fileInputRef = useRef(null);
    
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
    }, [roomId, connected])

    // Generate avatar URL with fallback
    const getAvatarUrl = (username) => {
        // Using DiceBear API as a reliable alternative
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || 'user'}`;
    };

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
                    });
                }, (error) => {
                    console.error("WebSocket connection error:", error);
                    toast.error("Connection lost. Reconnecting...");
                    setTimeout(connectWebSocket, 3000);
                });
            };
            if(connected){
                connectWebSocket()
            }
            //console.log("stompClient: "+stompClient , "/n", "connected: "+connected);
            return () => {
                if (stompClient) {
                    stompClient.disconnect();
                }
            };
            
        },[roomId, connected])


    //send message handle
    const sendMessage = async()=>{
        if(stompClient && connected && input.trim()){
            const message ={
                sender:currentUser,
                content:input,
                roomId:roomId,
                
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

    // Handle image selection with preview
    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file");
            return;
        }

        setSelectedImage(file);
        
        // Create preview
        //Browser cannot render raw File object so, Converts binary → Base64 URL
        //➡️ <img src="data:image/png;base64,..."></img>
        // Used only for preview. NOT sent to backend. Removed after upload
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        
        // Clear file input
        //If you select same file again
        //onChange will NOT fire
        event.target.value = '';
    }

    // Upload and send image
    const uploadAndSendImage = async () => {
        if (!selectedImage) return;
        
        setIsUploading(true);
        
        //Why FormData?
        //Binary safe
        //Browser sets multipart boundaries
        //Required for file upload
        const formData = new FormData();
        formData.append("image", selectedImage);
        formData.append("roomId", roomId);
        formData.append("sender", currentUser);

        try {
            const response = await axios.post(
                `${baseURL}/api/v1/rooms/upload`,
                formData,
                { 
                    //Multipart means: Request body split into parts 1st is binary data and 2nd is text(roomId) and HTTP JSON cannot send files that's why multipart
                    headers: { 
                        "Content-Type": "multipart/form-data" 
                    } 
                }
            );

            // The backend should already send the message via WebSocket
            // So we don't need to call sendImageMessage here
            
            // Clear image
            setSelectedImage(null);
            setImagePreview(null);
            toast.success("Image sent!");
            
        } catch (error) {
            console.error("Image upload error:", error);
            toast.error("Failed to send image");
        } finally {
            setIsUploading(false);
        }
    }

    // Cancel image selection
    const cancelImageSelection = () => {
        setSelectedImage(null);
        setImagePreview(null);
    }


    // Handle Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (selectedImage) {
                uploadAndSendImage();
            } else {
                sendMessage();
            }
        }
    }
    
    return(
    <div className="h-screen flex flex-col relative bg-gray-50 dark:bg-gray-900">
                <Toaster position="top-right" />

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

                {/* Image Preview Modal */}
                {imagePreview && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Send Image</h3>
                                <button 
                                    onClick={cancelImageSelection}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                                >
                                    <MdClose size={24} />
                                </button>
                            </div>
                            
                            <div className="mb-6">
                                <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="max-h-96 w-full object-contain rounded-lg"
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={cancelImageSelection}
                                    className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={uploadAndSendImage}
                                    disabled={isUploading}
                                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <MdSend />
                                            Send Image
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chat Messages */}
                <main 
                    ref={chatBoxRef} 
                    className='flex-1 pt-4 pb-24 px-4 md:px-6 lg:px-20 overflow-auto'
                >
                    <div className='max-w-3xl mx-auto space-y-4'>
                        {messages.map((message, index) => (
                            <div 
                                key={index} 
                                className={`flex ${message.sender === currentUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div 
                                    className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl p-3 ${message.sender === currentUser 
                                        ? 'bg-blue-500 text-white rounded-br-none' 
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                                    }`}
                                >
                                    <div className='flex items-start gap-3'>
                                        <img 
                                            className="h-8 w-8 rounded-full" 
                                            src={getAvatarUrl(message.sender)} 
                                            alt="avatar"
                                        />
                                        <div className='flex-1'>
                                            <div className='flex items-center gap-2 mb-1'>
                                                <p className='font-bold text-sm'>{message.sender}</p>
                                                <span className='text-xs opacity-75'>
                                                    {timeAgo(message.timeStamp)}
                                                </span>
                                            </div>
                                            
                                            {message.type === "IMAGE" ? (
                                                <div className="mt-2">
                                                    <img
                                                        src={message.content}
                                                        className="max-w-full rounded-lg border border-gray-300 dark:border-gray-600"
                                                        alt="Shared image"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                                                        }}
                                                    />
                                                    {message.caption && (
                                                        <p className="mt-2 text-sm">{message.caption}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className='text-base whitespace-pre-wrap break-words'>
                                                    {message.content}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>

                {/* Input Area */}
                <div className='fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700'>
                    {/* Image Preview Bar */}
                    {selectedImage && (
                        <div className='px-4 py-2 bg-gray-100 dark:bg-gray-900 border-b flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className='h-12 w-12 object-cover rounded'
                                />
                                <span className='text-sm truncate max-w-xs'>
                                    {selectedImage.name}
                                </span>
                            </div>
                            <div className='flex gap-2'>
                                <button
                                    onClick={cancelImageSelection}
                                    className='p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full'
                                >
                                    <MdClose size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className='px-4 py-3'>
                        <div className='max-w-3xl mx-auto flex items-center gap-3'>
                            {/* File Attachment */}
                            <button 
                                className='p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition'
                                onClick={() => fileInputRef.current.click()}
                                title="Attach image"
                            >
                                <MdAttachFile size={24} className="text-gray-600 dark:text-gray-400" />
                            </button>
                            
                            {/* Hidden file input */}
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleImageSelect}
                            />
                            
                            {/* Text Input */}
                            <div className='flex-1 relative'>
                                <input 
                                    className='w-full bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
                                    type='text' 
                                    placeholder='Type a message...'
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isUploading}
                                    ref={inputRef}
                                />
                            </div>
                            
                            {/* Send Button */}
                            <button 
                                className={`p-3 rounded-full flex items-center justify-center transition ${selectedImage || input.trim()
                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                                onClick={selectedImage ? uploadAndSendImage : sendMessage}
                                disabled={isUploading || (!selectedImage && !input.trim())}
                                title={selectedImage ? "Send image" : "Send message"}
                            >
                                {isUploading ? (
                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <MdSend size={24} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

export default ChatPage
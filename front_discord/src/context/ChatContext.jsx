//this is GLOBAL STORAGE for chat data
//It lets you:
//Store roomId
//Store currentUser
//Access & update them from any component
//WITHOUT passing props again and again

//WebRoutes is inside <ChatProvider> so ALL pages can access chat data

import { createContext, useContext, useState } from "react";

const ChatContext = createContext()

export const ChatProvider = ({children}) =>{
    const [roomId, setRoomId] =useState('')
    const[currentUser, setCurrentUser] = useState('');
    const[connected, setConnected] = useState(false);

    return <ChatContext.Provider value={
        {roomId,currentUser,connected,setRoomId,setCurrentUser, setConnected}
    }>
        {children}
    </ChatContext.Provider>
}

const useChatContext=()=> useContext(ChatContext);
export default useChatContext;
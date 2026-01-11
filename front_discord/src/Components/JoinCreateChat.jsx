/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import chatIcon from '../assets/chat.png'
import toast, { Toaster } from 'react-hot-toast'
import {createRoomApi, JoinRoomAPi } from '../service/RoomService'
import useChatContext from '../context/ChatContext'
import { useNavigate } from 'react-router-dom'

const JoinCreateChat = () => {

    const [detail, setDetail] = useState({
        roomId:'',
        userName:''
    })

    const {roomId, currentUser, connected, setRoomId, setCurrentUser, setConnected} = useChatContext();
    
    const navigate = useNavigate()
    
    function handleFormInputChange(event)   //first get the event
    { 
        setDetail({
            ...detail,  //copy all previous details
            //get name of deatils : then set the value
            [event.target.name]: event.target.value,
        });
    }

    function validate(){
        if(detail.roomId === "" || detail.userName === ""){
            toast.error("Invalid Input");
            return false;
        }
        return true;
    }

    async function joinChat(){
        if(validate()){
            try {
                const room = await JoinRoomAPi(detail.roomId);
                console.log("room: "+room);
                toast.success("Room Created Successfully !!");
                setCurrentUser(detail.userName);
                setRoomId(detail.roomId);
                setConnected(true)
                navigate('/chat')
           } 
           catch (error) {
                //console.log(error);
                if(error.status==400){
                    toast.error(error.response.data);
                }
                toast.error("Room don't Exist");
            }
         }
    }

    async function CreateRoom(){
        if(validate()){
            //create Room
            //console.log(detail);
            try {
                const response = await createRoomApi(detail.roomId);
                console.log("response: "+response);
                toast.success("Room Created Successfully !!");
                setCurrentUser(detail.userName);
                setRoomId(detail.roomId);
                setConnected(true)
                navigate('/chat')
                //forward to chaat page
            } catch (error) {
                //console.log(error);
                if(error.status==400){
                    toast.error("Room Id already Exist");
                }
                else{
                        toast.error("Error in Creating From");
                }
            }
        }
    }

  return (
    <div className='min-h-screen flex justify-center items-center'>
        <div className='p-8 w-full max-w-md rounded-md dark:bg-gray-900'>
            
            <div>
                <img src={chatIcon} className='w-24 mx-auto mb-5'/>
            </div>

            <h1 className='font-semibold text-2xl text-center mb-6'>Join Room / Creaate Room ...</h1>
        
            <div className='flex flex-col gap-2 mb-6'>
                <label htmlFor='' className='font-medium text-left'>Your Name</label>
                <input className="w-full dark:bg-gray-600 px-4 py-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700" type='text' id='name' placeholder='Enter your name' onChange={handleFormInputChange} value={detail.userName} name="userName"/>
            </div>
            <div className='flex flex-col gap-2'>
                <label htmlFor='' className='font-medium text-left'>Room ID</label>
                <input className='w-full dark:bg-gray-600 px-4 py-2 border border-gray-500 rounded-md focus:outline-none focus:ring-blue-700 focus:ring-2' type='text' id='roomId' placeholder='Enter Room ID' onChange={handleFormInputChange} value={detail.roomId} name='roomId'/>
            </div>

            <div className='flex justify-between'>
                <button onClick={joinChat} className='bg-blue-600 hover:bg-blue-800 py-2 px-6 rounded-xl mt-8'>
                    Join Room
                </button>
                <button onClick={CreateRoom} className='bg-orange-600 hover:bg-orange-800 py-2 px-3 rounded-xl mt-8'>
                    Create Room
                </button>
            </div>
        </div>
    </div>
  )
}

export default JoinCreateChat
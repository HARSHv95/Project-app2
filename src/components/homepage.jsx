import { nanoid } from "nanoid"
import { useEffect, useState, useContext } from "react";
import { SocketContext } from "./socketConnection";

export default function HomePage({setopenPrompt, RoomID, setRoomID, setMain, setRoomSize, setRoomState, Name, setRoomMembers}){

    const {socket, connectSocket, disconnectSocket} = useContext(SocketContext);

    useEffect(()=>{
        console.log(RoomID);
    }, [RoomID]);

    function handleRandom(){
        const userID = nanoid(6);
        const socketConnection = connectSocket();
        if(socketConnection){
            socketConnection.emit("random", userID, 2, Name);
            socketConnection.on("randomroomFound", (ID, size, members)=>{
                setRoomMembers(members);
                setRoomID(ID);
                setRoomSize(size);
                setRoomState("join");
                setopenPrompt(true);
            })
            socketConnection.on("randomFound", (ID, members)=>{
                setRoomMembers(members);
                setRoomID(ID);
                setMain("game");
            })
        }
    }

    const handleFriend = () => {
        if(socket){
            disconnectSocket();
        }
        setopenPrompt(true);
    }

    return(
        <div>
            <h1>Welcome to the Game!!!!</h1>
            <button onClick={handleFriend}>Join with Friend</button>
            <button onClick={handleRandom}>Join with Random</button>
        </div>
    )
}


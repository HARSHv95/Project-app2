import { createContext, useState} from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const SocketProvider = ({children})=>{
    const [socket, setsocket] = useState(null);

    const connectSocket = ()=>{
        if(!socket){
            const newSocket = io("https://project-server-3a91.onrender.com");
            setsocket(newSocket);
            return newSocket;
        }
        else return socket;
    };

    const disconnectSocket = ()=>{
        if(socket){
            socket.disconnect();
            setsocket(null);
        }
    };

    return(
        <SocketContext.Provider value={{socket, connectSocket, disconnectSocket}}>
            {children}
        </SocketContext.Provider>
    )
}

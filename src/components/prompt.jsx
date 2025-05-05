import { Fragment, useState, useContext, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { nanoid } from "nanoid";
import { SocketContext } from "./socketConnection";
import ToggleSwitch from "./ToggleSwitch";
import "./prompt.css";


export default function RenderPrompt({ setMain, setopenPrompt, openPrompt, RoomID, setRoomID, RoomSize, setRoomSize, RoomState, setRoomState, Host, setHost, Name, RoomMembers, setRoomMembers }) {

    const { socket, connectSocket, disconnectSocket } = useContext(SocketContext);
    const [OpenRoom, setOpenRoom] = useState(false);
    const [EnterId, setEnterId] = useState("");
    const [JoinedRoom, setJoinedRoom] = useState(false);

    useEffect(() => {
        if (socket) {
            socket.on("Gamestart", (ID) => {
                setMain("game");
                setopenPrompt(false);
            });
        }
    }, [socket]);



    useEffect(() => {
        if (RoomState === "join") {
            if (socket) {
                console.log("Socket disconnected");
                if (RoomID) {
                    socket.emit("PlayerLeft", RoomID);
                }
                disconnectSocket();
            }
        }

    }, [RoomState]);

    useEffect(() => {
        if (RoomID && socket) {
            if (OpenRoom) {
                socket.emit("openparty", RoomID);
            }
            else {
                socket.emit("closeparty", RoomID);
            }
        }
    }, [OpenRoom, socket]);


    const handleCreateClick = () => {
        if (RoomState != "create") {
            if(RoomID && socket && RoomSize > 0){
                socket.emit("PlayerLeft", RoomID, Name);
                setRoomMembers([]);
                setRoomID("");
                setRoomSize(0);
            }
            const userID = nanoid(6);
            setRoomState("create");
            console.log(RoomState);
            const SocketConnection = connectSocket();
            if (SocketConnection) {
                SocketConnection.emit("create", userID, 2, OpenRoom, Name);
                SocketConnection.on("roomCreated", (ID, members) => {
                    console.log("Room Created!!!");
                    setRoomMembers(members);
                    setHost(true);
                    setRoomID(ID);
                    setRoomSize(1);
                    console.log(RoomMembers);
                })
                SocketConnection.on("roomupdate", (ID, size, members) => {
                    setRoomMembers(members);
                    console.log(ID, size);
                    setRoomSize(size);
                })
            }
        }
    }


    const handleStartClick = () => {
        if (RoomSize > 1) {
            socket.emit("gamestart", RoomID);
            setMain("game");
            setopenPrompt(false);
        }
        else {
            alert("Not enough players to start the game. Please wait for more players to join.");
        }
    }

    const handleJoinClick = () => {
        if (EnterId === "") {
            alert("Enter a valid Room Id!!!");
        }
        else {
            console.log("Joining room with ID:", EnterId);
            const SocketConnection = connectSocket();
            if (SocketConnection) {
                SocketConnection.emit("FindRoom", EnterId, Name);
                SocketConnection.on("roomFound", (ID, roomSize, members) => {
                    console.log("Room Found", ID, roomSize);
                    setRoomMembers(members);
                    setRoomID(ID);
                    setRoomSize(roomSize);
                });
                SocketConnection.on("RoomClosed", () => {
                    setRoomID("");
                    setRoomSize(0);
                    setRoomState("join");
                    setRoomMembers([]);
                    setHost(false);
                    setOpenRoom(false);
                    disconnectSocket();
                })
                SocketConnection.on("Gamestart", (ID) => {
                    setMain("game");
                    setopenPrompt(false);
                })

            }
        }
    };

    const handleJoinRoomClick = () => {
        if (RoomState === "create" && Host) {
            console.log("Hello");
            if (socket) {
                console.log("Socket disconnected");
                socket.emit("HostLeft", RoomID);
                socket.on("RoomClosed", () => {
                    setRoomID("");
                    setRoomSize(0);
                    setRoomState("join");
                    setRoomMembers([]);
                    setHost(false);
                    setOpenRoom(false);
                    disconnectSocket();
                })
            }
        }
        else {
            setRoomState("join");
            if (socket) {
                console.log("Socket disconnected");
                socket.emit("PlayerLeft", RoomID, Name);
                disconnectSocket();
            }
            setEnterId("");
            setRoomID(null);
            setRoomSize(0);
        }
    }

    const handleClose = () => {
        if(socket){
            disconnectSocket();
        }
        setRoomID("");
        setRoomSize(0);
        setRoomState("join");
        setRoomMembers([]);
        setHost(false);
        setOpenRoom(false);
        setEnterId("");
        setopenPrompt(false);
        setMain("home");
    }
    return (
        <Fragment>
            <Dialog open={openPrompt} onClose={handleClose}>
                <DialogTitle>
                    <div className="prompt-header">
                        <button className={`tab-button ${RoomState === "create" ? "active" : ""}`} onClick={handleCreateClick}>Create Room</button>
                        <button className={`tab-button ${RoomState === "join" ? "active" : ""}`} onClick={handleJoinRoomClick}>Join Room</button>
                    </div>
                </DialogTitle>
                <DialogContent>
                    {RoomState === "join" ? (
                        RoomID && RoomSize > 0 ? (
                            // When joined and RoomID exists, display the joined room window
                            <>
                                <div className="room-info">
                                    <div className="room-id">Room ID: {RoomID}</div>
                                    {/* If you have a member list from the server, render it here */}
                                    <div className="member-list-container">
                                        <div className="member-list-title">Members in Room:</div>
                                        <ul className="member-list">
                                            {RoomMembers?.map((member, index) => {
                                                console.log(member, Host);
                                                return (
                                                    <li key={index}>
                                                        {member} {Host && Name === member ? "(HOST)" : ""}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // If no RoomID yet, allow entering a Room ID
                            <>
                                <div className="input-label">Enter Room ID</div>
                                <div>
                                    <input
                                        type="text"
                                        className="input-field small-input"
                                        onChange={(e) => setEnterId(e.target.value)}
                                    />
                                </div>
                            </>
                        )
                    ) : (
                        // Create Room branch remains the same
                        <>

                            <div className="room-toggle-container">
                                <div className="room-id">Room ID: {RoomID}</div>
                                <ToggleSwitch OpenRoom={OpenRoom} setOpenRoom={setOpenRoom} />
                            </div>
                            <div className="open-party-label">
                                {OpenRoom ? <>Open Party</> : <>Closed Party</>}
                            </div>
                            <div className="member-list-container">
                                <div className="member-list-title">Members in Room:</div>
                                <ul className="member-list">
                                    {RoomMembers?.map((member, index) => {
                                        console.log(member, Host);
                                        return (
                                            <li key={index}>
                                                {member} {Host && Name === member ? "(HOST)" : ""}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    {RoomState === "join" ? (
                        RoomID && RoomSize > 0 ? (
                            <button className="action-button" onClick={handleJoinRoomClick}>Exit</button>
                        ) : (
                            <button className="action-button" onClick={handleJoinClick}>Join</button>
                        )
                    ) : (
                        <button className="action-button" onClick={handleStartClick}>Start</button>
                    )}
                </DialogActions>
            </Dialog>

        </Fragment>
    )
}
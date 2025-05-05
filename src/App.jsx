import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import DotGrid from './components/grid';
import HomePage from './components/homepage';
import RenderPrompt from './components/prompt';
import RenderNamePrompt from './components/nameprompt';

function App() {
  const [count, setCount] = useState(0);
  const [main, setMain] = useState("home");
  const [openPrompt, setopenPrompt] = useState(false);
  const [RoomID, setRoomID] = useState([]); 
  const [RoomSize, setRoomSize] = useState(0);
  const [RoomState, setRoomState] = useState("join");
  const [Host, setHost] = useState(false);
  const [Name, setName] = useState("");
  const [openNamePrompt, setopenNamePrompt1] = useState(true);
  const [RoomMembers, setRoomMembers] = useState([]);

  return (
    <div>
      {main === "home" 
        ? <HomePage setopenPrompt={setopenPrompt} RoomID={RoomID} setRoomID={setRoomID} setMain={setMain} setRoomSize={setRoomSize} setRoomState={setRoomState} Name={Name} setRoomMembers={setRoomMembers}/>
        : <DotGrid setMain={setMain} main={main} RoomID={RoomID} Host={Host} setopenPrompt={setopenPrompt} RoomMembers={RoomMembers}/> 
      }
      <RenderPrompt setMain={setMain} setopenPrompt={setopenPrompt} openPrompt={openPrompt} RoomID={RoomID} setRoomID={setRoomID} RoomSize={RoomSize} setRoomSize={setRoomSize} RoomState={RoomState} setRoomState={setRoomState} Host={Host} setHost={setHost} Name={Name} RoomMembers={RoomMembers} setRoomMembers={setRoomMembers}/>
      <RenderNamePrompt Name={Name} setName={setName} openNamePrompt={openNamePrompt} setOpenNamePrompt={setopenNamePrompt1}/>
    </div>
  );
}

export default App;

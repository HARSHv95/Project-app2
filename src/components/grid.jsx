import { useState, useRef, useEffect, useContext } from "react";
import { Fragment } from "react";
import { SocketContext } from "./socketConnection";


export default function DotGrid({setMain, main, RoomID, Host, setopenPrompt}) {
  const canvasRef = useRef(null);
  const [dots, setDots] = useState([]);
  const [lines, setLines] = useState([]);
  const [selectedDot, setSelectedDot] = useState(null);
  const [Turn , setTurn] = useState(null);
  const {socket, disconnectSocket} = useContext(SocketContext);
  const [CompletedSquares, setCompletedSquares] = useState([]);
  const [MySquares, setMySquares] = useState(0);
  const [OpponentSquares, setOpponentSquares] = useState(0);
  
  const gridSize = 5;
  const dotSpacing = 100; 

  useEffect(() => {
    const handleUnload = () => {
      socket.emit("leave", RoomID);
      disconnectSocket();
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  useEffect(() => {
    const newDots = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        newDots.push({ x: j * dotSpacing + 50, y: i * dotSpacing + 50 });
      }
    }
    setDots(newDots);
    drawGrid(newDots, []);

    socket.emit("TurnDecide", RoomID);

    socket.on("YourTurn", ()=>{
      setTurn(true);
      console.log("hey");
    })

    socket.on("OpponentTurn", ()=>{
      setTurn(false);
      console.log("hi");
    })

    socket.on("PlayerLeft", ()=>{
      disconnectSocket();
      setMain("home");
    })

    socket.on("oppositeMove", (updateLines, turn)=>{
      console.log("Update lines received:- ", updateLines);
      setLines(updateLines);
      setTurn(!turn);
      console.log("Lines and turn updated:- ", updateLines, !turn);
    })
  }, []);

  useEffect(()=>{
    drawGrid(dots, lines, CompletedSquares);
    console.log("Lines: ", lines);
  }, [dots, lines, CompletedSquares]);

  useEffect(()=>{
    console.log(CompletedSquares);
  },[CompletedSquares]);

  useEffect(() => {
    if (!Turn) {
      checkForSquare(lines, false);
    }
  }, [lines]);

  useEffect(() => {
    let count1 = 0;
    let count2 = 0;
    CompletedSquares.forEach((square) => {
      if (square.owner === "Y") {
        count1++;
      }
      else if (square.owner === "O") {
        count2++;
      };
    });
    setMySquares(count1);
    setOpponentSquares(count2);
  },[lines, CompletedSquares]);

  useEffect(() => {
    if(CompletedSquares.length === (gridSize-1)*(gridSize-1)){
      if(MySquares > OpponentSquares){
        alert("You Won!! 🎉");
      }
      else if(MySquares < OpponentSquares){
        alert("You Lost!! 😢");
      }
      else {
        alert("It's a Tie!! 🤝");

      }
      if(Host){
        socket.emit("GameOver",RoomID);
      }
      socket.on("gameresult",()=>{
        setopenPrompt(true);
        setMain("home");
      })
    }
  },[MySquares, OpponentSquares]);

  useEffect(() => {
    console.log("My Squares: ", MySquares);
    console.log("Opponent Squares: ", OpponentSquares);
  }
, [MySquares, OpponentSquares]);

useEffect(() => {
  drawGrid(dots, lines, CompletedSquares);
},[selectedDot])

  const checkForSquare = (newLines, isMyMove) => {

    if(newLines.length === 0)return;

    const newSquares = [];
    let squareDetect = false;

    for (let i = 0; i < dots.length; i++) {
      for (let j = 0; j < dots.length; j++) {
        if (i === j) continue;
  
        const dotA = dots[i];
        const dotB = dots[j];
  
        
        if ((dotA.x - dotB.x) === -100 && dotA.y === dotB.y) {
          const dotC = dots.find((d) => d.x === dotA.x && d.y === dotA.y + 100);
          const dotD = dots.find((d) => d.x === dotB.x && d.y === dotB.y + 100);
  
          if (dotC && dotD) {
            const hasAllSides = [
              { start: dotA, end: dotB },
              { start: dotA, end: dotC },
              { start: dotB, end: dotD },
              { start: dotC, end: dotD }
            ].every(({ start, end }) =>
              newLines.some(line =>
                (line.start.x === start.x && line.start.y === start.y &&
                 line.end.x === end.x && line.end.y === end.y) ||
                (line.start.x === end.x && line.start.y === end.y &&
                 line.end.x === start.x && line.end.y === start.y)
              )
              
            );

            const alreadyExists = CompletedSquares.some(
              (s) => s.x === dotA.x + dotSpacing / 2 && s.y === dotA.y + dotSpacing / 2
            );
  
            if (hasAllSides  && !alreadyExists) {
              console.log("🎉 Square Detected!");
              newSquares.push({
              x: dotA.x + dotSpacing / 2,
              y: dotA.y + dotSpacing / 2,
              owner: isMyMove ? "Y" : "O",
              });
              squareDetect = true;
            }
          }
        }
      }
    }

    console.log("New Squares: ", newSquares);

    if(newSquares.length > 0){
      setCompletedSquares(prev => [...prev, ...newSquares])
    }

    return squareDetect;
  };

  const drawGrid = (dots, lines, CompletedSquares) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dots.forEach((dot) => {
      ctx.beginPath();
      // If the dot is selected, give it a glowing effect
      if (selectedDot && dot.x === selectedDot.x && dot.y === selectedDot.y) {
        ctx.shadowColor = "yellow";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "yellow";
        ctx.arc(dot.x, dot.y, 8, 0, Math.PI * 2); // Slightly larger dot
      } else {
        ctx.shadowBlur = 0;
        ctx.fillStyle = "black";
        ctx.arc(dot.x, dot.y, 5, 0, Math.PI * 2);
      }
      ctx.fill();
    });

    lines?.forEach(({ start, end }) => {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.stroke();

    });

    CompletedSquares?.forEach(({ x, y, owner }) => {
      ctx.fillStyle = owner === "Y" ? "green" : "red";
      ctx.font = "30px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(owner, x, y);
      console.log("Square drawn at: ", x, y);
    });
  };

  const handleCanvasClick = (event) => {
    if(!Turn){
      console.log("Not your Turn!!");
      return;
    }
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    let clickedDot = null;
    dots.forEach((dot) => {
      const distance = Math.sqrt((clickX - dot.x) ** 2 + (clickY - dot.y) ** 2);
      if (distance < 10) {
        clickedDot = dot;
      }
    });

    if (clickedDot) {
      if (selectedDot) {
        const distance = Math.sqrt((clickedDot.x - selectedDot.x)**2 + (clickedDot.y-selectedDot.y)**2);
        if((selectedDot.x === clickedDot.x || selectedDot.y === clickedDot.y) && distance === 100){
            const newLines = [...lines, { start: selectedDot, end: clickedDot }];
            setLines(newLines);

            const formSquare = checkForSquare(newLines, true);

            socket.emit("move", newLines, formSquare ? true : false, RoomID);

            console.log("New Lines :-", newLines, formSquare); 

            if(!formSquare){
              setTurn(false);
            }
        }
        else console.log("Can't draw a line like that!!!");
        setSelectedDot(null);
      } else {
        setSelectedDot(clickedDot);
        console.log("Selected Dot: ", clickedDot);
      }
    }
  };

  const handleButton = ()=>{
    socket.emit("leave", RoomID);
    disconnectSocket();
    setMain("home")
  }

  return (
    <Fragment>
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 space-y-6">
    <canvas
      ref={canvasRef}
      width={600}
      height={600}
      className="border-4 border-blue-500 rounded-lg shadow-lg bg-white cursor-pointer"
      onClick={handleCanvasClick}
    ></canvas>

    <div className="text-xl font-semibold text-gray-700">
      {Turn ? "🎯 Your Turn" : "⏳ Opponent's Turn"}
    </div>

    <button
      onClick={handleButton}
      className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium shadow-md transition duration-300"
    >
      Leave the Game
    </button>
  </div>
</Fragment>

    
  );
}

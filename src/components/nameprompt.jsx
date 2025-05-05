import { Fragment, useState, useContext, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

export default function RenderNamePrompt({Name, setName, openNamePrompt, setOpenNamePrompt}){

    const handleClose = () => {
        if(Name.length > 0){
            setOpenNamePrompt(false);
        }
    }

    return(
        <Dialog open={openNamePrompt} onClose={handleClose}>
            <DialogTitle>Enter your name</DialogTitle>
            <DialogContent>
                <input type="text" value={Name} onChange={(e) => {setName(e.target.value);}}/>
            </DialogContent>
            <DialogActions>
                <button onClick={handleClose}>Submit</button>
            </DialogActions>
        </Dialog>
    )
}

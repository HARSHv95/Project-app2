import React, { useState } from "react";
import "./ToggleSwitch.css"; // (Link the CSS I gave earlier)

export default function ToggleSwitch({ OpenRoom, setOpenRoom }) {

  const handleToggle = () => {
    setOpenRoom(!OpenRoom);
  };

  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={OpenRoom} onChange={handleToggle} />
      <span className="slider"></span>
    </label>
  );
}

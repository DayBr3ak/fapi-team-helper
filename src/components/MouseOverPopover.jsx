import { Box } from "@mui/material";
import Popover from "@mui/material/Popover";
import { useState } from "react";

export default function MouseOverPopover({ tooltip, children }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  return (
    <Box>
      <Box
        aria-owns={open ? "mouse-over-popover" : undefined}
        aria-haspopup="true"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        sx={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </Box>
      <Popover
        disableScrollLock
        sx={{
          pointerEvents: "none",
          zIndex: 10000,
          opacity: 0.8,
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        {tooltip}
      </Popover>
    </Box>
  );
}

import React from "react";
import "./RepoLink.css";
import { Button, ButtonGroup } from "@mui/material";

export default function RepoLink() {
  return (
    <ButtonGroup
      sx={{ position: "fixed", top: "10px", right: "10px" }}
      variant="outlined"
      aria-label="outlined primary button group"
    >
      <Button
        href="https://erik434.github.io/fapi-pets/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Link to Pets Gallery
      </Button>
      <Button
        href="https://github.com/DayBr3ak/fapi-team-helper"
        target="_blank"
        rel="noopener noreferrer"
      >
        View on GitHub
      </Button>
    </ButtonGroup>
  );
}

import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { petNamesById } from "../../utils/itemMapping";
import { useGameSave } from "../../utils/GameSaveAtom";

const comboBonuses = {
  5001: "SPAWNMOREPOTATOES",
  5002: "FEWERPOTATOES",
  5003: "POTATOESSPAWNSPEED",
  5004: "MINIMUMRARITY",
  5005: "BASERESIDUE",
  5006: "DROPBONUSESCAP",
  5007: "EXPEREWARD",
  5008: "COMBOPETDAMAGE",
  5009: "BREEDINGTIMER",
  5010: "MILKTIMER",
  5011: "ATKSPEED",
  5012: "WHACKBUFFTIMER",
  5013: "BREEDINGANDMILKTIMER",
  5014: "FASTERCHARGETICK",
};

function PetComboDisplay({ petCombos }) {
  const comboBonusLabel = comboBonuses[petCombos[0]?.BonusID] || "";
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>{comboBonusLabel}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {petCombos &&
          petCombos.map((petCombo, i) => {
            const PetIDArray = petCombo.PetID;
            return (
              <Grid container key={i}>
                {PetIDArray.map((petId, j) => {
                  return (
                    <Grid item xs={3} key={petId}>
                      <img
                        src={petNamesById[petId].img}
                        alt={petNamesById[petId]?.name}
                        key={j}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            );
          })}
      </AccordionDetails>
    </Accordion>
  );
}
export default function PetComboList() {
  const [data] = useGameSave();
  const comboList = data.PetsSpecial;
  const comboByBonusId = comboList.reduce((accum, combo, i) => {
    if (i === 0) return accum;
    accum[combo.BonusID] = accum[combo.BonusID]
      ? [...accum[combo.BonusID], combo]
      : [combo];
    return accum;
  }, {});
  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography variant={"h2"}>Card Combo List</Typography>
      </Grid>
      <Grid item xs={12}>
        {comboByBonusId &&
          Object.values(comboByBonusId).map((comboArray, i) => {
            return <PetComboDisplay petCombos={comboArray} key={i} />;
          })}
      </Grid>
    </Grid>
  );
}

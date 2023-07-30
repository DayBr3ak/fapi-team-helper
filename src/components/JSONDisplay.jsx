import React from "react";
import Grid from "@mui/material/Grid";

import "./JSONDisplay.css"; // Add this line to import the CSS file
import { petNameArray } from "../utils/itemMapping";
import PetItem from "./PetItem";
import ItemSelection from "./ItemSelection";
import MouseOverPopover from "./MouseOverPopover";
import Typography from "@mui/material/Typography";
import {
  EXP_DMG_MOD,
  EXP_TIME_MOD,
  calculateGroupScore,
  calculatePetBaseDamage,
} from "../utils/utils";
import { Backdrop, Box, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import { selectGameSaveData, selectLoadingState } from "../utils/uiSlice";

function ScoreSection({ data, group, totalScore, usePetRank }) {
  const {
    baseGroupScore,
    dmgCount,
    timeCount,
    synergyBonus,
    baseGroupScoreNoRank,
  } = calculateGroupScore(group);
  return (
    <>
      <ul>
        {/* <li>{Number(totalScore).toExponential(2)}&nbsp;~=&nbsp; 5 *</li> */}
        <li>
          Gr BaseDmg:{" "}
          <b>
            {Number(
              usePetRank ? baseGroupScore : baseGroupScoreNoRank
            ).toExponential(2)}
          </b>
        </li>
        <li>
          Dmg Bonus: <b>{Number(1 + dmgCount * EXP_DMG_MOD).toFixed(2)}x</b>
        </li>
        <li>
          Time Bonus: <b>{Number(1 + timeCount * EXP_TIME_MOD).toFixed(2)}x</b>
        </li>
        <li>
          Synergy: <b>{Number(synergyBonus).toFixed(2)}x</b>
        </li>
        <li>
          PetDmgMod: <b>{Number(data?.PetDamageBonuses).toExponential(2)}</b>
        </li>
      </ul>
    </>
  );
}

export default function JSONDisplay({ groups, usePetRank, setUsePetRank }) {
  const data = useSelector(selectGameSaveData);
  const loading = useSelector(selectLoadingState);

  if (!!data === false || !!data.PetsCollection === false) {
    return <div>Loading...</div>; // You can replace this with null or another element if you prefer
  }
  return (
    <div className="grid-container">
      <div className="grid-left">
        <Typography variant={"h5"}>Best Teams</Typography>
        <div>
          <input
            type="checkbox"
            id="usePetRank"
            onChange={setUsePetRank}
            checked={!usePetRank}
            disabled={loading}
          />
          <label htmlFor={"usePetRank"}>Ignore Pet Rank</label>
          <Backdrop open={loading} sx={{ color: "#fff" }}>
            <CircularProgress color="secondary" />
          </Backdrop>
        </div>
        {groups.reduce((accum, group, index) => {
          const gs = calculateGroupScore(group);
          const score = usePetRank ? gs.groupScore : gs.groupScoreNoRank;
          const displayedDamage = group
            .map(
              (pet) =>
                calculatePetBaseDamage(pet, usePetRank) *
                5 *
                data?.PetDamageBonuses
            )
            .reduce((accum, dmg) => (accum += dmg), Number(0))
            .toExponential(2);
          const totalScore = Number(
            Number(data?.PetDamageBonuses) * score * 5
          ).toExponential(2);
          const groupTooltip = (
            <Box sx={{ padding: 1 }}>
              <h3>Group Score ({totalScore})</h3>
              <ScoreSection
                data={data}
                group={group}
                totalScore={totalScore}
                usePetRank={usePetRank}
              />
            </Box>
          );
          accum.push(
            <MouseOverPopover tooltip={groupTooltip} key={(1 + index) * 9001}>
              Group {index + 1} Damage: {displayedDamage}
            </MouseOverPopover>
          );
          accum.push(
            <Grid container spacing={1} key={index}>
              {!!group &&
                group.map((petData, idx) => {
                  const { ID } = petData;
                  const staticPetData = petNameArray.find(
                    (staticPetDatum) => staticPetDatum.petId === ID
                  );

                  if (staticPetData === undefined) {
                    console.info({ petData, petNameArray });
                    throw new Error(
                      `Could not find petId ${ID} in array "petNameArray" did the game update and add pets?`
                    );
                  }

                  return (
                    <Grid item xs={3} key={idx}>
                      <PetItem
                        key={ID}
                        petData={staticPetData}
                        data={data}
                        isSelected={true}
                        onClick={() => {}}
                      />
                    </Grid>
                  );
                })}
            </Grid>
          );
          return accum;
        }, [])}
      </div>
      <div className="grid-right">
        <Typography variant={"h5"}>
          Highlighted: &gt;0 rank pets (clickable)
        </Typography>
        <ItemSelection />
      </div>
    </div>
  );
}

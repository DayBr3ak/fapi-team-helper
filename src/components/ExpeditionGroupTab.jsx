import React, { useMemo } from "react";
import Grid from "@mui/material/Grid";

import { petNameArray } from "../utils/itemMapping";
import PetItem from "./PetItem";
import ItemSelection from "./ItemSelection";
import MouseOverPopover from "./MouseOverPopover";
import Typography from "@mui/material/Typography";
import {
  EXP_DMG_MOD,
  EXP_TIME_MOD,
  MAX_EXPED_TEAMS,
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

function EmptyGroupSection({ index }) {
  return (
    <Box>
      Group {index + 1} Damage: NA
      <Grid container spacing={1}>
        <Grid item xs={3}>
          x
        </Grid>
        <Grid item xs={3}>
          x
        </Grid>
        <Grid item xs={3}>
          x
        </Grid>
        <Grid item xs={3}>
          x
        </Grid>
      </Grid>
    </Box>
  );
}

function GroupSection({ group, index }) {
  const data = useSelector(selectGameSaveData);
  const gs = calculateGroupScore(group);
  const score = usePetRank ? gs.groupScore : gs.groupScoreNoRank;
  const displayedDamage = group
    .map(
      (pet) =>
        calculatePetBaseDamage(pet, usePetRank) * 5 * data?.PetDamageBonuses
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

  return (
    <>
      <MouseOverPopover tooltip={groupTooltip}>
        Group {index + 1} Damage: {displayedDamage}
      </MouseOverPopover>
      <Grid container spacing={1}>
        {group.map((petData) => {
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
            <Grid item xs={3} key={ID}>
              <PetItem
                petData={staticPetData}
                data={data}
                isSelected={true}
                onClick={() => {}}
              />
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}

export default function ExpeditionGroupTab({
  groups,
  usePetRank,
  setUsePetRank,

  useMaxTokens,
  setUseMaxTokens,
}) {
  const data = useSelector(selectGameSaveData);
  const loading = useSelector(selectLoadingState);

  const paddedGroups = useMemo(() => {
    const n = groups.slice();
    while (n.length < MAX_EXPED_TEAMS) {
      n.push(null);
    }
    return n;
  }, [groups]);

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

          <input
            type="checkbox"
            id="sortBy"
            onChange={setUseMaxTokens}
            checked={useMaxTokens}
            disabled={loading}
          />
          <label htmlFor={"sortBy"}>Maximize tokens</label>
        </div>
        {paddedGroups.map((group, index) => {
          if (group) {
            return <GroupSection group={group} index={index} key={index} />;
          }
          return <EmptyGroupSection index={index} key={index} />;
        })}
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

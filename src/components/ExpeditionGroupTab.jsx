// @ts-check
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
  EXP_TOKEN_MOD,
  MAX_EXPED_TEAMS,
  calculateGroupScore,
  calculatePetBaseDamage,
  findBestHours,
  makeUniqStrGroup,
} from "../utils/utils";
import { Backdrop, Box, CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import uiSlice, {
  selectComboValue,
  selectGameSaveData,
  selectLoadingState,
  selectUsePetRank,
} from "../utils/uiSlice";

function ScoreSection({ data, group, usePetRank }) {
  const {
    baseGroupScore,
    dmgCount,
    timeCount,
    synergyBonus,
    baseGroupScoreNoRank,
    tokenRewardCount,
  } = calculateGroupScore(group);
  return (
    <>
      <ul>
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
          Total Token Gain: <b>{tokenRewardCount * EXP_TOKEN_MOD}</b>
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
  const usePetRank = useSelector(selectUsePetRank);
  const data = useSelector(selectGameSaveData);
  const gs = calculateGroupScore(group);
  const score = usePetRank ? gs.groupScore : gs.groupScoreNoRank;
  const baseScore = usePetRank ? gs.baseGroupScore : gs.baseGroupScoreNoRank;

  const displayedDamage = score.toExponential(3);

  const clover = data.SoulGoldenClover;
  const expeditionTokenBonuses = data.ExpeditionTokenBonuses ?? 1.0;
  const comboValue = useSelector(selectComboValue);
  const bestHours = findBestHours(
    group,
    clover,
    comboValue,
    expeditionTokenBonuses
  );

  const totalScore = score.toExponential(2);
  const groupTooltip = (
    <Box sx={{ padding: 1 }}>
      <h3>Group Score ({totalScore})</h3>
      <ScoreSection data={data} group={group} usePetRank={usePetRank} />
    </Box>
  );

  const bestHoursBox = (
    <select>
      {bestHours.map((best) => {
        return (
          <option
            key={
              best.hours +
              ";" +
              makeUniqStrGroup(group) +
              `${comboValue},${clover},${expeditionTokenBonuses}`
            }
            value={best.hours}
          >{`${best.hours} hours creating ${
            best.floored
          } (${best.totalTokens.toPrecision(
            4
          )}) tokens wasting ${best.waste.toPrecision(4)} tokens`}</option>
        );
      })}
    </select>
  );

  return (
    <>
      <MouseOverPopover tooltip={groupTooltip}>
        <h3>
          Group {index + 1} Damage: {displayedDamage}
        </h3>
      </MouseOverPopover>
      <h4>{bestHoursBox}</h4>
      <Grid container spacing={1}>
        {group.map((petData) => {
          const { ID } = petData;
          const staticPetData = petNameArray.find((pet) => pet.petId === ID);

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
  const dispatch = useDispatch();
  const data = useSelector(selectGameSaveData);
  const loading = useSelector(selectLoadingState);
  const comboValue = useSelector(selectComboValue);

  const paddedGroups = useMemo(() => {
    const n = groups.slice();
    while (n.length < MAX_EXPED_TEAMS) {
      n.push(null);
    }
    return n;
  }, [groups]);

  const onComboChange = (e) => {
    dispatch(uiSlice.actions.setComboValue(e.target.value));
  };

  if (!!data === false || !!data.PetsCollection === false) {
    return <div>Loading...</div>; // You can replace this with null or another element if you prefer
  }

  return (
    <div className="grid-container">
      <div className="grid-left">
        <Typography variant={"h5"}>Best Teams</Typography>
        <div>
          <input
            className="mr-1em"
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

        <div>
          <input
            className="mr-1em"
            type="checkbox"
            id="sortBy"
            onChange={setUseMaxTokens}
            checked={useMaxTokens}
            disabled={loading}
          />
          <label htmlFor={"sortBy"}>Maximize tokens</label>
        </div>

        <div>
          <select
            id="combo"
            value={comboValue}
            className="mr-1em"
            onChange={onComboChange}
          >
            <option value="1.0">1.0</option>
            <option value="1.1">1.1</option>
            <option value="1.2">1.2</option>
          </select>
          <label htmlFor={"combo"}>Expedition Reward Combo</label>
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

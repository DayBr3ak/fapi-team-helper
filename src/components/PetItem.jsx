import React from "react";
import "./PetItem.css";

import { BonusMap } from "../utils/itemMapping";
import MouseOverPopover from "./MouseOverPopover";
import { Box } from "@mui/material";

const filterBonuses = (bonuses, filterFn) => {
  return bonuses.filter(filterFn);
};

export default function PetItem({
  petData,
  isSelected,
  onClick,
  data,
  petScoreFn,
}) {
  if (!!data === false) {
    return null;
  }
  if (!petData) {
    console.error("Missing var petData in PetItem component");
    return null;
  }
  const { petId, img, name } = petData;

  // Find the pet from the data.PetsCollection
  const pet = data.PetsCollection.find((p) => p.ID === petId);

  if (!pet) return null; // In case the pet is not found in the collection

  const rank = pet.Rank;
  const level = pet.Level;
  const totalScore = Number(
    Number(data?.PetDamageBonuses) *
      pet.BaseDungeonDamage *
      (1.0 + rank * 0.05) *
      5
  ).toExponential(2);

  // const weightedBonuses = filterBonuses(pet.BonusList, (bonus) => {
  //     return bonus.ID < 1000;
  // }).reduce((accum, activePetBonus) => {
  //     const {ID, } = activePetBonus;
  //     const result = weightMap[ID]?.weight;
  //     if (result) accum += result;
  //     return accum;
  // }, 0);

  const weightedActiveScore = petScoreFn ? petScoreFn(pet) : 0;

  const section1Bonuses = (
    <ul>
      {filterBonuses(pet.BonusList, (bonus) => {
        return bonus.ID < 1000;
      }).map((activePetBonus, i) => {
        const bonusBase = Number(1.0 + activePetBonus.Gain);
        const bonusPower = Number(pet.Level);
        const result =
          (Math.pow(bonusBase, bonusPower) - 1) * (1 + 0.02 * Number(pet.Rank));

        return (
          <li key={i}>
            {BonusMap[activePetBonus.ID]?.label}: {result.toExponential(2)}
          </li>
        );
      })}
    </ul>
  );

  const section2Bonuses = (
    <ul>
      {filterBonuses(
        pet.BonusList,
        (bonus) => bonus.ID >= 1000 && bonus.ID < 5000
      ).map((activePetBonus, i) => {
        return (
          <li key={i}>
            {BonusMap[activePetBonus.ID]?.label}:{" "}
            {Number(activePetBonus.Power).toExponential(2)}
          </li>
        );
      })}
    </ul>
  );
  const tooltipContent = (
    <Box sx={{ padding: 1 }}>
      <h3>
        {name} (Level: {level}) (Rank: {rank}) ({totalScore})
      </h3>
      <span>
        <h4>Active Bonuses</h4>
        {section1Bonuses}
      </span>
      <span>
        <h4>Expedition Bonuses:</h4>
        {section2Bonuses}
      </span>
    </Box>
  );

  return (
    <Box
      key={petId}
      onClick={onClick}
      sx={{
        opacity: isSelected ? 1 : 0.4,
        width: "75px",
        height: "75px",
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        borderStyle: "solid",
        borderWidth: "1px",
        borderColor: "rgba(0,0,0,0)",
        "&:hover": {
          borderColor: "blue",
        },
      }}
    >
      <MouseOverPopover tooltip={tooltipContent}>
        <img src={img} alt={name} className="item-image" />
      </MouseOverPopover>
    </Box>
  );
}

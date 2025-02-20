import { Box } from "@mui/material";
import React from "react";
import { useGameSave } from "../../utils/GameSaveAtom";

// import BigNumber from "bignumber.js";
// import Decimal from "decimal.js";
import Decimal from "break_infinity.js";

window.Decimal = Decimal;

/**
 *
 * @param {any} bdLike
 * @returns Decimal
 */
function fromBD(bdLike) {
  if (!bdLike) {
    return new Decimal(0);
  }
  const { mantissa, exponent } = bdLike;
  return Decimal.fromMantissaExponent(mantissa, exponent);
}

/**
 *
 * @param {number} bonusId
 * @param {Decimal} powerBD
 * @returns
 */
function PowerMod(bonusId, powerBD) {
  if (powerBD.equals(Decimal.ZERO)) {
    return Decimal.fromNumber(0);
  }
  const powlog = (base, log, mul = 1.0) => {
    return Decimal.fromNumber(base).pow(powerBD.log(log)).mul(mul);
  };
  switch (bonusId) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
      if (powerBD.cmp(100) >= 0) {
        const c = Decimal.fromNumber(powerBD.log(5)).mul(0.5);
        return c.sub(0.93);
        // return Number.Log(power, 5) * 0.5 - 0.93;
      }
      return powerBD.mul(0.005);
    case 8:
      return powerBD.mul(0.001);
    case 9:
      return powerBD.mul(0.001);
    case 10:
      return powerBD.mul(0.0005);
    case 11:
      return powerBD.mul(0.0005);
    case 12:
      return powlog(1.1, 1.5, 0.02);
    case 13:
      return powerBD.mul(0.0001);
    case 14:
      return powlog(1.2, 1.5, 0.003);
    case 15:
      return powerBD.mul(5e-5);
    case 16:
      return powerBD.mul(2.5e-5);
    case 17:
      return powlog(1.19, 1.52, 0.002);
    case 18:
      return powlog(1.16, 1.57, 0.00075);
    case 19:
      return powlog(1.15, 1.58, 0.001);
    case 20:
      return powlog(7.0, 10, 5e-7);
    case 21:
      return powlog(1.1, 1.75, 0.005);
    case 22:
      return powlog(1.14, 1.61, 0.0025);
    case 23:
      return powlog(1.08, 1.8, 0.001);
    case 24:
      return powlog(1.13, 1.65, 5e-5);
    case 25:
      return powlog(1.11, 1.71, 0.0001);
    case 26:
      return powlog(1.04, 2.51, 0.0035);
    case 27:
      return powlog(1.045, 2.45, 0.005);
    default:
      return Decimal.fromNumber(0);
  }
}

function getEquipedItems(data) {
  const items = data.EquippedItems.map((item) => {
    return {
      ...item,
      BonusList: item.BonusList.map((bonus) => {
        return {
          ...bonus,
          powerDecimal: fromBD(bonus.PowerBD),
        };
      }),
    };
  });
  return items;
}

function getItemTotalRating(item) {
  let sum = Decimal.fromNumber(0);
  for (let i = 0; i < item.BonusList.length; i++) {
    sum = sum.add(item.BonusList[i].powerDecimal);
  }
  return sum;
}

function bonusIsFlat(bonusId) {
  return bonusId <= 7;
}

function getBonus2(bonusId, data) {
  const equipedItems = getEquipedItems(data);
  const AscensionBestItemRatingBD = fromBD(data.AscensionBestItemRatingBD);

  let sum = Decimal.fromNumber(0);
  for (let i = 0; i < equipedItems.length; i++) {
    if (!equipedItems[i]) {
      continue;
    }
    const item = equipedItems[i];
    // console.log(item);

    const totalRating = getItemTotalRating(item);
    const bestRatingRatio = AscensionBestItemRatingBD.div(totalRating);

    for (let j = 0; j < item.BonusList.length; j++) {
      const bonus = item.BonusList[j];
      if (bonusId === bonus.BonusID) {
        const refinePowerCoeff =
          1.0 + (item.RefineLevel + item.FreeRefineLevel) * data.EnhancingPower;
        const itemRatingLimiterCoeff =
          data.AscensionCount >= 11 && bestRatingRatio.cmp(0.999) > 0
            ? 1
            : Decimal.min(1, bestRatingRatio);

        const bonusPower = bonus.powerDecimal
          .mul(refinePowerCoeff)
          .mul(itemRatingLimiterCoeff);

        let expeShop_bonusOnRarity = 1.0;
        if (
          !bonusIsFlat(bonusId) &&
          data.ExpeShopEquipmentBonusOnRarityLevel > 0 &&
          item.ItemRarity > 15
        ) {
          expeShop_bonusOnRarity = Decimal.fromNumber(
            1.0 + data.ExpeShopEquipmentBonusOnRarityLevel * 0.01
          ).pow(item.ItemRarity - 15);
        }

        const powerMod = PowerMod(bonusId, bonusPower).mul(
          expeShop_bonusOnRarity
        );
        sum = sum.add(powerMod);
      }
    }
  }

  return sum;
}

const BONUS_ID_TO_TEXT = {
  1: "STR",
  2: "CON",
  3: "DEX",
  4: "AGI",
  5: "LCK",
  6: "STR",
  7: "CON",
  8: "Potatoes",
  9: "ClassExp",
  10: "Skulls",
  11: "ConfectionExp",
  12: "ReincarnationExp",
  13: "Poop",
  14: "Milk",
  15: "WhackScore",
  16: "BrewingExp",
  17: "Calcium",
  18: "WormsQuantity",
  19: "FermentingExp",
  20: "LarvaEfficiency",
  21: "Residue",
  22: "LarvaQuantity",
  23: "PetLevelExp",
  24: "PetDamage",
  25: "PetRankExp",
  26: "CardPower",
  27: "CardExp",
};

function getAllGearBonuses(data) {
  for (let bonusId = 1; bonusId < 28; bonusId++) {
    if (bonusId === 1 || bonusId === 2) continue;

    let a = getBonus2(bonusId, data);
    if (bonusId === 6) {
      a = a.add(getBonus2(1, data));
    }
    if (bonusId === 7) {
      a = a.add(getBonus2(2, data));
    }

    // this part is to get exactly the same value as the gear panel in game
    if (bonusIsFlat(bonusId)) {
      a = a.add(1);
    } else {
      a = a.mul(100);
    }

    const bonusName = BONUS_ID_TO_TEXT[bonusId];
    console.log(bonusName + " " + bonusId, a.toExponential(3));
  }
}

export default function GearTab() {
  const [data] = useGameSave();
  if (!data) {
    return null;
  }

  // const equipedItems = getEquipedItems(data);
  // console.log(equipedItems);
  // getBonus1(equipedItems[0]);

  // for (let x = 1; x < 28; x++) {
  //   const a = getBonus2(x, data);
  //   console.log("xxx " + x, a.toExponential(3));
  // }

  getAllGearBonuses(data);

  return <Box>Hello</Box>;
}

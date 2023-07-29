import { PROJECT_PATH } from "./utils";
import petsCollection from "../assets/pets.json";

export function getImageUrl(itemName) {
  return `${PROJECT_PATH}/pets/${itemName}.png`;
}

export const petNameArray = petsCollection.map(({ id, name }) => {
  return {
    petId: id,
    img: getImageUrl(name),
    name,
  };
});

export const petNamesById = petNameArray.reduce((accum, petNameData) => {
  accum[petNameData.petId] = petNameData;
  return accum;
}, {});

export const BonusMap = {
  1: { id: 1, label: "Potato" },
  2: { id: 2, label: "Class Exp" },
  3: { id: 3, label: "Skull" },
  4: { id: 4, label: "Confection Exp" },
  5: { id: 5, label: "Reincarnation Exp" },
  6: { id: 6, label: "Item Rating" },
  7: { id: 7, label: "Poop BONUS" },
  8: { id: 8, label: "Milk BONUS" },
  9: { id: 9, label: "Whack SCORE" },
  10: { id: 10, label: "Brewing EXP" },
  11: { id: 11, label: "Calcium EXP" },
  12: { id: 12, label: "Fermenting EXP" },
  13: { id: 13, label: "Residue BONUS" },
  14: { id: 14, label: "Worm QTY" },
  15: { id: 15, label: "Larva QTY" },
  16: { id: 16, label: "Larva EFF" },
  17: { id: 17, label: "ATTACK HP" },
  18: { id: 18, label: "Pet DMG" },
  19: { id: 19, label: "Pet LEVEL EXP" },
  20: { id: 20, label: "Pet RANK EXP" },
  21: { id: 21, label: "Card POWER B" },
  22: { id: 22, label: "Card EXP B" },
  26: { id: 26, label: "Reinc Point Bonus" },
  1001: { id: 1001, label: "POTATO GAIN" },
  1002: { id: 1002, label: "CLASS EXP GAIN" },
  1003: { id: 1003, label: "SKULL GAIN" },
  1004: { id: 1004, label: "WORM QTY GAIN" },
  1005: { id: 1005, label: "POOP GAIN" },
  1006: { id: 1006, label: "LARVA QTY GAIN" },
  1007: { id: 1007, label: "WHACK GAIN" },
  1008: { id: 1008, label: "MILK GAIN" },
  1009: { id: 1009, label: "RESIDUE GAIN" },
  1010: { id: 1010, label: "CARD POWER GAIN" },
  1011: { id: 1011, label: "DUNGEON EFF" },
  1012: { id: 1012, label: "DUNGEON TIME GAIN" },
  1013: { id: 1013, label: "DUNGEON DMG" },
  1014: { id: 1014, label: "CARD EXP" },
  1015: { id: 1015, label: "REINC PTS GAIN" },
  1016: { id: 1015, label: "EXPE TOKEN GAIN" },
  5001: { id: 5001, label: "Spawn More Potatoes" },
  5002: { id: 5002, label: "Fewer Potatoes" },
  5003: { id: 5003, label: "Potatoes Spawn Speed" },
  5004: { id: 5004, label: "Minimum Rarity" },
  5005: { id: 5005, label: "Base Residue" },
  5006: { id: 5006, label: "Drop Bonuses Cap" },
  5007: { id: 5007, label: "Expedition Reward" },
  5008: { id: 5008, label: "Combo Pet Damage" },
  5009: { id: 5009, label: "Breeding Timer" },
  5010: { id: 5010, label: "Milk Timer" },
  5011: { id: 5011, label: "Attack Speed" },
  5012: { id: 5012, label: "Whack Buff Timer" },
  5013: { id: 5013, label: "Breeding and Milk Timer" },
  5014: { id: 5014, label: "Faster Charge Tick" },
};

const standardBonusesWeightListCount = Array.from({ length: 22 }, (x, i) => i);
export const standardBonusesWeightList = standardBonusesWeightListCount.map(
  (idx, i) => BonusMap[i + 1]
);
export const standardBonusesWeightById = standardBonusesWeightListCount.reduce(
  (accum, item, i) => {
    accum[i] = item;
    return accum;
  },
  {}
);
export const DefaultWeightMappings = {
  1: { id: 1, weight: 0.0015 },
  2: { id: 2, weight: 0.003 },
  3: { id: 3, weight: 0.003 },
  4: { id: 4, weight: 0.0001 },
  5: { id: 5, weight: 100 },
  6: { id: 6, weight: 50 },
  7: { id: 7, weight: 0.001 },
  8: { id: 8, weight: 0.029 },
  9: { id: 9, weight: 0.001 },
  10: { id: 10, weight: 0.0001 },
  11: { id: 11, weight: 0.0001 },
  12: { id: 12, weight: 0.0001 },
  13: { id: 13, weight: 3.051 },
  14: { id: 14, weight: 0.0029 },
  15: { id: 15, weight: 0.001 },
  16: { id: 16, weight: 0.001 },
  17: { id: 17, weight: 0.005 },
  18: { id: 18, weight: 200 },
  19: { id: 19, weight: 10 },
  20: { id: 20, weight: 10 },
  21: { id: 21, weight: 201 },
  22: { id: 22, weight: 10 },
  26: { id: 26, weight: 50 },
};
const StandardBonusesWeightMap = standardBonusesWeightList.reduce(
  (accum, item, i) => {
    const newItem = {
      ...item, // should be BonusMap {id, label}
      weight: DefaultWeightMappings[item.id].weight,
    };

    accum[item.id] = newItem;
    return { ...accum };
  },
  {}
);
export const DefaultWeightMap = StandardBonusesWeightMap;

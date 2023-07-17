export const EXP_DMG_MOD = 0.1;
export const EXP_TIME_MOD = 0.05;
export const SYNERGY_MOD_STEP = 0.25;

export const PROJECT_PATH = "/fapi-team-helper";

export function calculatePetBaseDamage(pet, usePetRank = false) {
  const rankCount = usePetRank ? pet?.Rank : 0;
  const result = pet?.BaseDungeonDamage * (1.0 + rankCount * 0.05);
  return Number(result);
}

export const calculateGroupScore = (group, usePetRank = false) => {
  let groupScore = 0;
  let dmgCount = 0;
  let timeCount = 0;
  let synergyBonus = 0;
  let baseGroupScore = 0;
  let cardPowerCount = 0;
  let expRewardCount = 0;
  let rpRewardCount = 0;
  let cardXpCount = 0;
  let tokenRewardCount = 0;
  const typeCounts = {};

  group.forEach((pet) => {
    groupScore += calculatePetBaseDamage(pet, usePetRank);
    if (pet.BonusList.some((bonus) => bonus.ID === 1013)) {
      dmgCount++;
    }
    if (pet.BonusList.some((bonus) => bonus.ID === 1010)) {
      cardPowerCount++;
    }
    if (pet.BonusList.some((bonus) => bonus.ID === 1011)) {
      expRewardCount++;
    }
    if (pet.BonusList.some((bonus) => bonus.ID === 1014)) {
      cardXpCount++;
    }
    if (pet.BonusList.some((bonus) => bonus.ID === 1012)) {
      timeCount++;
    }
    if (pet.BonusList.some((bonus) => bonus.ID === 1015)) {
      rpRewardCount++;
    }
    if (pet.BonusList.some((bonus) => bonus.ID === 1016)) {
      tokenRewardCount++;
    }

    // Count pet types
    if (typeCounts[pet.Type]) {
      typeCounts[pet.Type]++;
    } else {
      typeCounts[pet.Type] = 1;
    }
    if (pet.ID) synergyBonus += SYNERGY_MOD_STEP;
  });
  baseGroupScore = groupScore;
  const [earthType, airType] = Object.values(typeCounts);
  if (earthType > 0 && airType > 0) synergyBonus += SYNERGY_MOD_STEP;
  if (earthType > 1 && airType > 1) synergyBonus += SYNERGY_MOD_STEP;

  groupScore *= 1 + dmgCount * EXP_DMG_MOD;
  groupScore *= 1 + timeCount * EXP_TIME_MOD;
  groupScore *= synergyBonus;

  return {
    groupScore,
    baseGroupScore,
    dmgCount,
    timeCount,
    synergyBonus,
    cardPowerCount,
    expRewardCount,
    cardXpCount,
    rpRewardCount,
    tokenRewardCount,
  };
};

function getCombinations(array, k) {
  const combinations = new Set();
  const f = (start, prevCombination) => {
    if (
      prevCombination.length > 0 &&
      prevCombination.length <= k &&
      prevCombination.every((pet) => pet?.ID !== undefined)
    ) {
      const sortedIds = prevCombination
        .sort((a, b) => a.ID - b.ID)
        .map((pet) => pet.ID)
        .join(",");
      combinations.add(sortedIds);
    }
    if (prevCombination.length === k) {
      return;
    }
    for (let i = start; i < array.length; i++) {
      f(i + 1, [...prevCombination, array[i]]);
    }
  };
  f(0, []);
  return Array.from(combinations).map((combination) =>
    combination
      .split(",")
      .map((id) => array.find((pet) => pet.ID === parseInt(id)))
  );
}

export const findBestGroups = (petsCollection, usePetRank = false) => {
  const k = 4; // Size of each group
  const numGroups = 6; // Number of groups to find

  let bestGroups = [];
  for (let g = 0; g < numGroups; g++) {
    const combinations = getCombinations(
      petsCollection,
      Math.min(k, petsCollection.length)
    );
    if (combinations.length === 0) {
      break;
    }
    const bestGroup = combinations.reduce((best, group) => {
      const score = calculateGroupScore(group, usePetRank)?.groupScore;
      const bestScore = calculateGroupScore(best, usePetRank)?.groupScore;
      return score > bestScore ? group : best;
    }, combinations[0]);

    if (bestGroup) {
      bestGroups.push(bestGroup);
      petsCollection = petsCollection.filter((pet) => !bestGroup.includes(pet));
    }
  }

  return bestGroups;
};

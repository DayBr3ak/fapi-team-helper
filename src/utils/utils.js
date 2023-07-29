export const EXP_DMG_MOD = 0.1;
export const EXP_TIME_MOD = 0.05;
export const SYNERGY_MOD_STEP = 0.25;

export const PROJECT_PATH = "/fapi-team-helper";

export function calculatePetBaseDamage(pet, usePetRank = false) {
  const rankCount = usePetRank ? pet?.Rank : 0;
  const result = (pet?.BaseDungeonDamage / 4.0) * (rankCount + 20);
  return result;
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

function findCombinations(array, length = 4) {
  // Base case: If the desired length is 0, return an array containing an empty array
  if (length === 0) {
    return [[]];
  }

  // Base case: If the array is empty or the desired length is greater than the array length, return an empty array
  if (array.length === 0 || length > array.length) {
    return [];
  }

  const combinations = [];

  // Iterate through each element in the array
  for (let i = 0; i < array.length; i++) {
    const currentElement = array[i];

    // Find all combinations of length - 1 for the rest of the array
    const remainingCombinations = findCombinations(
      array.slice(i + 1),
      length - 1
    );

    // Append the current element to each combination
    for (let j = 0; j < remainingCombinations.length; j++) {
      const combination = [currentElement, ...remainingCombinations[j]];
      combinations.push(combination);
    }
  }

  return combinations;
}

export const findBestGroups = (petsCollection, usePetRank = false) => {
  const numGroups = 6; // Number of groups to find

  const bestGroups = [];

  let petsCollectionCopy = petsCollection.slice();

  for (let g = 0; g < numGroups; g++) {
    const combinations = findCombinations(petsCollectionCopy);
    if (combinations.length < 1) {
      break;
    }
    const bestGroup = combinations.reduce((best, group) => {
      const score = calculateGroupScore(group, usePetRank)?.groupScore;
      const bestScore = calculateGroupScore(best, usePetRank)?.groupScore;
      return score > bestScore ? group : best;
    }, combinations[0]);

    if (bestGroup) {
      bestGroups.push(bestGroup);
      const bestGroupIds = bestGroup.map((x) => x.ID);
      petsCollectionCopy = petsCollectionCopy.filter(
        (pet) => !bestGroupIds.includes(pet.ID)
      );
    }
  }

  return bestGroups;
};

/**
 *
 * @param {any} petData  the object from gameSave.PetsCollection
 * @returns
 */
export function indexPetData(petData) {
  return petData.reduce((accum, item) => {
    accum[parseInt(item.ID, 10)] = item;
    return accum;
  }, {});
}

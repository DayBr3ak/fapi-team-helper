export const EXP_DMG_MOD = 0.1;
export const EXP_TIME_MOD = 0.05;
export const SYNERGY_MOD_STEP = 0.25;

export const PROJECT_PATH = "/fapi-team-helper";

export function calculatePetBaseDamage(pet, usePetRank = false) {
  const rankCount = usePetRank ? pet?.Rank : 0;
  const result = (pet?.BaseDungeonDamage / 4.0) * (rankCount + 20);
  return result;
}

function makeUniqStrGroup(group) {
  const a = group.map((x) => x.ID);
  a.sort();
  return a.join(";");
}

const gmem = {};
export const calculateGroupScore = (group) => {
  const uniqStr = makeUniqStrGroup(group);
  if (gmem[uniqStr]) {
    return gmem[uniqStr];
  }

  let groupScore = 0;
  let groupScoreNoRank = 0;
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
    groupScore += calculatePetBaseDamage(pet, true);
    groupScoreNoRank += calculatePetBaseDamage(pet, false);
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
  const baseGroupScoreNoRank = groupScoreNoRank;
  const [earthType, airType] = Object.values(typeCounts);
  if (earthType > 0 && airType > 0) synergyBonus += SYNERGY_MOD_STEP;
  if (earthType > 1 && airType > 1) synergyBonus += SYNERGY_MOD_STEP;

  groupScore *= 1 + dmgCount * EXP_DMG_MOD;
  groupScore *= 1 + timeCount * EXP_TIME_MOD;
  groupScore *= synergyBonus;

  groupScoreNoRank *= 1 + dmgCount * EXP_DMG_MOD;
  groupScoreNoRank *= 1 + timeCount * EXP_TIME_MOD;
  groupScoreNoRank *= synergyBonus;

  const ret = {
    groupScore,
    groupScoreNoRank,
    baseGroupScore,
    baseGroupScoreNoRank,
    dmgCount,
    timeCount,
    synergyBonus,
    cardPowerCount,
    expRewardCount,
    cardXpCount,
    rpRewardCount,
    tokenRewardCount,
  };
  gmem[uniqStr] = ret;
  return ret;
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

const $findCombinationsMemo = {};
function findCombinationsMemo(array) {
  const uniqStr = makeUniqStr(array);
  if ($findCombinationsMemo[uniqStr]) {
    return $findCombinationsMemo[uniqStr];
  }

  const r1 = findCombinations(array);
  // just forget about  any groups that hasn't max synergy
  const r2 = r1.filter((group) => {
    let ground = 0;
    let air = 0;

    for (const el of group) {
      if (el.Type === 1) {
        ground += 1;
      }
      if (el.Type === 2) {
        air += 1;
      }
    }
    return ground === 2 && air === 2;
  });

  $findCombinationsMemo[uniqStr] = r2;
  return r2;
}

function makeUniqStr(petsCollection) {
  const a = petsCollection.map((p) => p.ID);
  a.sort();
  return a.join(";");
}

function sortGroup(group) {
  group.sort((a, b) => {
    if (a.Type === b.Type) {
      return a.ID - b.ID;
    }
    return a.Type - b.Type;
  });
}

const $memBG = {};
export const findBestGroups = (
  petsCollection,
  idToInclude,
  usePetRank = false
) => {
  const xxx = idToInclude.slice();
  xxx.sort();
  const uniqStr = xxx.join(";") + ";;" + (usePetRank ? "true" : "false");

  if ($memBG[uniqStr]) {
    return $memBG[uniqStr];
  }

  const numGroups = 6; // Number of groups to find
  const bestGroups = [];
  const combinations = findCombinationsMemo(petsCollection);
  const idToExcludes = [];

  for (let g = 0; g < numGroups; g++) {
    if (combinations.length < 1) {
      break;
    }

    let best = combinations[0];
    let bestScore = 0;
    for (const group of combinations) {
      if (group.some((x) => idToExcludes.includes(x.ID))) {
        continue;
      }
      if (!group.every((x) => idToInclude.includes(x.ID))) {
        continue;
      }

      const score = usePetRank
        ? calculateGroupScore(group)?.groupScore
        : calculateGroupScore(group)?.groupScoreNoRank;

      if (score > bestScore) {
        best = group;
        bestScore = score;
      }
    }

    // console.info("comb", g, combinations);

    if (best) {
      sortGroup(best);
      bestGroups.push(best);
      const bestGroupIds = best.map((x) => x.ID);
      idToExcludes.push(...bestGroupIds);
    }
  }

  $memBG[uniqStr] = bestGroups;
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

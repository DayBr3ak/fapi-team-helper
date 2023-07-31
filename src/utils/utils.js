export const EXP_DMG_MOD = 0.1;
export const EXP_TIME_MOD = 0.05;
export const EXP_TOKEN_MOD = 0.05;
export const SYNERGY_MOD_STEP = 0.25;

export const MAX_EXPED_TEAMS = 7;

export const PROJECT_PATH = "/fapi-team-helper";

export function calculatePetBaseDamage(pet, usePetRank = false) {
  const rankCount = usePetRank ? pet?.Rank : 0;
  const result = (pet?.BaseDungeonDamage / 4.0) * (rankCount + 20);
  return result;
}

function makeUniqStrGroup(group) {
  return group.map((x) => x.ID).join(";");
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

  const tokenModifier = tokenRewardCount * EXP_TOKEN_MOD;

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
    tokenMultiplier: synergyBonus * (1 + tokenModifier),
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

let $findCombinationsMemo = null;
function findCombinationsMemo(array) {
  if ($findCombinationsMemo) {
    return $findCombinationsMemo;
  }

  const r1 = findCombinations(array);
  // just forget about  any groups that hasn't max synergy
  const r2 = r1
    .filter((group) => {
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
    })
    .map((group) => {
      sortGroup(group);
      return Object.freeze(group);
    });

  $findCombinationsMemo = Object.freeze(r2);
  return $findCombinationsMemo;
}

function sortGroupsByDamage(usePetRank) {
  return (groupA, groupB) => {
    const scoreA = calculateGroupScore(groupA);
    const scoreB = calculateGroupScore(groupB);
    const iA = usePetRank ? scoreA.groupScore : scoreA.groupScoreNoRank;
    const iB = usePetRank ? scoreB.groupScore : scoreB.groupScoreNoRank;
    return iB - iA;
  };
}

function sortGroupsByTokens(usePetRank) {
  return (groupA, groupB) => {
    const scoreA = calculateGroupScore(groupA);
    const scoreB = calculateGroupScore(groupB);

    const iA = usePetRank ? scoreA.groupScore : scoreA.groupScoreNoRank;
    const iB = usePetRank ? scoreB.groupScore : scoreB.groupScoreNoRank;

    if (scoreB.tokenMultiplier === scoreA.tokenMultiplier) {
      return iB - iA;
    }
    return scoreB.tokenMultiplier - scoreA.tokenMultiplier;
  };
}

const key1 = (usePetRank, sortBy) => `${usePetRank};${sortBy}`;
const $findCombinationsMemoSorted = {};
function findCombinationsMemoSorted(
  array,
  usePetRank = false,
  sortBy = "damage"
) {
  const uniqKey = key1(usePetRank, sortBy);
  if ($findCombinationsMemoSorted[uniqKey]) {
    return $findCombinationsMemoSorted[uniqKey];
  }

  const combs = findCombinationsMemo(array).slice();
  const sorter =
    sortBy === "damage"
      ? sortGroupsByDamage(usePetRank)
      : sortGroupsByTokens(usePetRank);
  combs.sort(sorter);

  $findCombinationsMemoSorted[uniqKey] = combs;
  return combs;
}

// sort by type (ground then air) and then by ID (asc)
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
  usePetRank = false,
  sortBy = "damage"
) => {
  const uniqStr =
    idToInclude.join(";") +
    ";;" +
    (usePetRank ? "true" : "false") +
    ";;" +
    sortBy;

  if ($memBG[uniqStr]) {
    return $memBG[uniqStr];
  }

  const bestGroups = [];
  const combinations = findCombinationsMemoSorted(
    petsCollection,
    usePetRank,
    sortBy
  );
  const idToExcludes = [];

  for (let g = 0; g < MAX_EXPED_TEAMS; g++) {
    if (combinations.length < 1) {
      break;
    }

    let best = null;
    for (const group of combinations) {
      if (group.some((x) => idToExcludes.includes(x.ID))) {
        continue;
      }
      if (!group.every((x) => idToInclude.includes(x.ID))) {
        continue;
      }

      best = group;
      break;
    }

    // console.info("comb", g, combinations);
    // console.info("best", { best, bestScore });

    if (best) {
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

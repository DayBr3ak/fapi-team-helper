import { findBestGroups } from "./utils";

onmessage = function (e) {
  const { data } = e;
  const {
    rid,
    payload: { petsCollection, idToInclude, usePetRank, sortBy },
  } = data;

  const result = findBestGroups(
    petsCollection,
    idToInclude,
    usePetRank,
    sortBy
  );
  this.postMessage({ rid, payload: result });
};

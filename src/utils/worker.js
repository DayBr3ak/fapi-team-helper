import { findBestGroups } from "./utils";

onmessage = function (e) {
  const { data } = e;
  const {
    rid,
    workerId,
    payload: { petsCollection, idToInclude, usePetRank, sortBy },
  } = data;

  const result = findBestGroups(
    petsCollection,
    idToInclude,
    usePetRank,
    sortBy
  );
  this.postMessage({ rid, workerId, payload: result });
};

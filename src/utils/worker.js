import { findBestGroups } from "./utils";

onmessage = function (e) {
  const { data } = e;
  const {
    rid,
    payload: { petsCollection, idToInclude, usePetRank },
  } = data;

  const result = findBestGroups(petsCollection, idToInclude, usePetRank);
  this.postMessage({ rid, payload: result });
};

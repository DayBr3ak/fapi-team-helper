import { findBestGroups } from "./utils";

onmessage = function (e) {
  const { data } = e;
  const {
    rid,
    payload: { petsCollection, usePetRank },
  } = data;

  const result = findBestGroups(petsCollection, usePetRank);
  this.postMessage({ rid, payload: result });
};

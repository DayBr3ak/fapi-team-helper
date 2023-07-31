import Worker from "./worker?worker";

const $mem = {};

function makeUniqStr(idToInclude, usePetRank, sortBy) {
  return idToInclude.join(";") + ";;" + usePetRank.toString() + ";;" + sortBy;
}

const maxWorkers = 4;
let workers = [];
const pendings = {};
let rid = 0;

function makeWorkers() {
  for (let i = 0; i < maxWorkers; i++) {
    workers[i] = Worker();
    workers[i].onmessage = function (e) {
      console.log("Message received from worker", e, e.data.rid);
      pendings[e.data.rid]?.(e.data.payload);
      delete pendings[e.data.rid];
    };
  }
}

let roundRobin = 0;
export async function findBestGroupsAsync(
  petsCollection,
  idToInclude,
  usePetRank,
  sortBy
) {
  if (workers.length === 0) {
    // init worker if first call
    makeWorkers();
  }

  const uniqStr = makeUniqStr(idToInclude, usePetRank, sortBy);
  if ($mem[uniqStr]) {
    return $mem[uniqStr];
  }

  const promise = new Promise((r) => {
    pendings[rid] = r;
  });
  workers[roundRobin % maxWorkers].postMessage({
    rid,
    workerId: roundRobin % maxWorkers,
    payload: { petsCollection, idToInclude, usePetRank, sortBy },
  });
  rid += 1;
  roundRobin += 1;
  $mem[uniqStr] = promise;
  return promise;
}

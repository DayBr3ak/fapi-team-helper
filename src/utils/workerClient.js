import Worker from "./worker?worker";

const $mem = {};

function makeUniqStr(idToInclude, usePetRank) {
  return idToInclude.join(";") + ";;" + usePetRank.toString();
}

let worker;
const pendings = {};
let rid = 0;

function makeWorker() {
  worker = Worker();
  worker.onmessage = function (e) {
    console.log("Message received from worker", e, e.data.rid);
    pendings[e.data.rid]?.(e.data.payload);
    delete pendings[e.data.rid];
  };
}

export async function findBestGroupsAsync(
  petsCollection,
  idToInclude,
  usePetRank
) {
  if (!worker) {
    // init worker if first call
    makeWorker();
  }

  const uniqStr = makeUniqStr(idToInclude, usePetRank);
  if ($mem[uniqStr]) {
    return $mem[uniqStr];
  }

  const promise = new Promise((r) => {
    pendings[rid] = r;
  });
  worker.postMessage({
    rid,
    payload: { petsCollection, idToInclude, usePetRank },
  });
  rid += 1;
  $mem[uniqStr] = promise;
  return promise;
}

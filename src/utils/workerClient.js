import Worker from "./worker?worker";

let worker;
const pendings = {};
let rid = 0;
export async function findBestGroupsAsync(petsCollection, usePetRank) {
  if (!worker) {
    // init worker if first call
    worker = Worker();
    worker.onmessage = function (e) {
      console.log("Message received from worker", e, e.data.rid);
      pendings[e.data.rid]?.(e.data.payload);
      delete pendings[e.data.rid];
    };
  }

  const promise = new Promise((r) => {
    pendings[rid] = r;
  });
  worker.postMessage({ rid, payload: { petsCollection, usePetRank } });
  rid += 1;
  return promise;
}

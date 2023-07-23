import { atom, useAtom } from "jotai";

export const gameSaveAtom = atom(null);

export const useGameSave = () => {
  return useAtom(gameSaveAtom);
};

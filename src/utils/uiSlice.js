import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { findBestGroups } from "./utils";
import { findBestGroupsAsync } from "./workerClient";
const initialState = {
  gameStateData: null,
  loadingState: false,
  selectedPets: [],
  selectedPetsForce: [],

  usePetRank: false,
  includeLocked: false,
  groups: [],
  currentTab: 0,
};

export const findBestGroupAction = createAsyncThunk(
  "ui/findBestGroup",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const petData = state.ui.gameStateData.PetsCollection;
    const currentSelected = selectSelectedPets(state);

    // pre calculate the rank / no rank version. It's cached anyway, and might as well use the worker as much as possible
    const [rankTrue, rankFalse] = await Promise.all([
      findBestGroupsAsync(petData, currentSelected, true),
      findBestGroupsAsync(petData, currentSelected, false),
    ]);

    return state.ui.usePetRank ? rankTrue : rankFalse;
  }
);

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setGameStateData(state, { payload }) {
      state.gameStateData = payload;
      const positiveRankedPets = payload.PetsCollection.filter((pet) => {
        const isValidRank = state.usePetRank ? !!pet.Rank : true;
        const isValidLocked = state.includeLocked ? true : !!pet.Locked;
        return isValidRank && isValidLocked;
      }).map((pet) => pet.ID);
      state.selectedPets = positiveRankedPets;
    },
    toggleSelectPetId(state, { payload }) {
      if (state.selectedPetsForce.includes(payload)) {
        state.selectedPetsForce = state.selectedPetsForce.filter(
          (s) => s !== payload
        );
        return;
      }
      state.selectedPetsForce.push(payload);
    },
    setSelected(state, { payload }) {
      state.selectedPets = payload;
    },
    setUsePetRank(state, { payload }) {
      state.usePetRank = payload;
    },
    setCurrentTab(state, { payload }) {
      state.currentTab = payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(findBestGroupAction.pending, (state) => {
      state.loadingState = true;
    });
    builder.addCase(findBestGroupAction.rejected, (state, action) => {
      console.error(action);
      state.loadingState = false;
    });
    builder.addCase(findBestGroupAction.fulfilled, (state, { payload }) => {
      state.groups = payload;
      state.loadingState = false;
    });
  },
});

// Action creators are generated for each case reducer function
export const { increment, decrement, incrementByAmount } = uiSlice.actions;

const selectSelf = (state) => state.ui;
export const selectGameSaveData = (state) => state.ui.gameStateData;

export const selectSelectedPets = createSelector(
  (state) => state.ui.selectedPets,
  (state) => state.ui.selectedPetsForce,

  (selectedPets, selectedPetsForce) => {
    const set = new Set(selectedPets.concat(selectedPetsForce));
    const s = [...set];

    const result = s.filter((x) => {
      const has1 = selectedPets.includes(x);
      const has2 = selectedPetsForce.includes(x);
      return has1 ^ has2;
    });
    result.sort(); // just sorting integers
    return result;
  }
);
export const selectUsePetRank = (state) => state.ui.usePetRank;
export const selectIncludeLocked = (state) => state.ui.includeLocked;
export const selectLoadingState = (state) => state.ui.loadingState;
export const selectGroups = createSelector(selectSelf, (ui) => ui.groups);
export const selectCurrentTab = (state) => state.ui.currentTab;

export default uiSlice;

import React, { useState } from "react";
import "./App.css";
import FileUpload from "./components/FileUpload";
import JSONDisplay from "./components/JSONDisplay";
import RepoLink from "./components/RepoLink";
import { DefaultWeightMap, petNameArray } from "./utils/itemMapping";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import InfoIcon from "@mui/icons-material/Info";
import ScaleIcon from "@mui/icons-material/Scale";
import { Container, Box } from "@mui/material";
import Weights from "./components/weights/Weights";
import PetComboList from "./components/comboList/ComboList";
import { findBestGroups } from "./utils/utils";
import { useGameSave } from "./utils/GameSaveAtom";
import GearTab from "./components/gearTab/GearTab";
import ErrorBoundary from "./ErrorBoundary";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: "Roboto",
  },
});

const defaultPetSelection = petNameArray.map((petData) => petData.petId);

const TAB_UPLOAD = 0;
const TAB_EXPED = 1;
const TAB_COMBO_LIST = 3;
const TAB_GEAR = 4;

function App() {
  const [data, setData] = useGameSave();
  const [groups, setGroups] = useState([]);
  const [usePetRank, setUsePetRank] = useState(false);
  const [includeLocked] = useState(false);
  const [selectedItems, setSelectedItems] = useState(defaultPetSelection);
  const [tabSwitch, setTabSwitch] = useState(TAB_UPLOAD);
  const [weightMap, setWeightMap] = useState(DefaultWeightMap);

  const handleItemSelected = (items) => {
    setSelectedItems(items);

    if (items) {
      handleGroups(data, items, usePetRank);
    }
  };

  const setWeights = (newWeightMap) => {
    setWeightMap({ ...newWeightMap });
  };

  const onUsePetRankChange = (e) => {
    const checked = e.target.checked;
    const selItems = handleSelected(data, checked);
    handleGroups(data, selItems, checked);
    setUsePetRank(checked);
  };

  const selectComponent = () => {
    switch (tabSwitch) {
      // case TAB_COMBO_LIST:
      //   return <PetComboList data={data} weightMap={weightMap} />;
      // case TAB_GEAR:
      //   return <GearTab />;
      case TAB_EXPED:
        return (
          <JSONDisplay
            weightMap={weightMap}
            data={data}
            groups={groups}
            selectedItems={selectedItems}
            handleItemSelected={handleItemSelected}
            usePetRank={usePetRank}
            setUsePetRank={onUsePetRankChange}
          />
        );
      default:
        return <FileUpload onData={handleData} />;
    }
  };

  const handleSelected = (data, usePetRank = false) => {
    const positiveRankedPets = data.PetsCollection.filter((pet) => {
      const isValidRank = usePetRank ? !!pet.Rank : true;
      const isValidLocked = includeLocked ? true : !!pet.Locked;
      return isValidRank && isValidLocked;
    }).map((pet) => pet.ID);
    setSelectedItems(positiveRankedPets);
    return positiveRankedPets;
  };

  const handleData = (uploadedData) => {
    setData(uploadedData);
    const positiveRankedPets = handleSelected(uploadedData, usePetRank);
    handleGroups(uploadedData, positiveRankedPets, usePetRank);
    if (tabSwitch === TAB_UPLOAD) {
      setTabSwitch(TAB_EXPED); // move upload to expedition when done
    }
  };

  const handleGroups = (data, selectedItems, usePetRank1) => {
    const petData = data?.PetsCollection || [];
    const selectedItemsById = petData.reduce((accum, item) => {
      accum[parseInt(item.ID, 10)] = item;
      return accum;
    }, {});

    const localPets = selectedItems.map((petId) => selectedItemsById[petId]);
    const groups = findBestGroups(localPets, usePetRank1);
    setGroups(groups);
  };

  return (
    <ThemeProvider theme={theme}>
      <RepoLink />
      <Box sx={{ pb: 7, pt: 3, overflow: "auto" }}>
        <Box sx={{ flexGrow: 1 }} className={"main-content"}>
          <ErrorBoundary fallback="error">{selectComponent()}</ErrorBoundary>
        </Box>
        {/*<Box sx={{ height: "64px" }} />*/}{" "}
        {/* Add extra space at the bottom */}
      </Box>
      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={tabSwitch}
          onChange={(event, newValue) => {
            setTabSwitch(newValue);
          }}
        >
          <BottomNavigationAction
            label="Upload"
            icon={<InfoIcon />}
            value={TAB_UPLOAD}
          />
          {!!data && (
            <BottomNavigationAction
              label="Expedition"
              icon={<InfoIcon />}
              value={TAB_EXPED}
            />
          )}
          {/* {!!data && (
              <BottomNavigationAction label="Charges" icon={<BadgeIcon />} />
            )} */}
          {/*{!!data && <BottomNavigationAction label="Exp. Rewards" icon={<BadgeIcon />} />}*/}
          {/* {!!data && (
            <BottomNavigationAction
              label="Pet Combo List"
              icon={<BadgeIcon />}
              value={TAB_COMBO_LIST}
            />
          )} */}
          {/*{!!data && <BottomNavigationAction label="Weighted Pets" icon={<ScaleIcon />} />}*/}
          {/* {<BottomNavigationAction label="Weights" icon={<ScaleIcon />} />} */}

          {/* {!!data && (
            <BottomNavigationAction
              label="Current Gear?"
              icon={<BadgeIcon />}
              value={TAB_GEAR}
            />
          )} */}
        </BottomNavigation>
      </Paper>
    </ThemeProvider>
  );
}

export default App;

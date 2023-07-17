import React, { useState } from "react";
import "./App.css";
import FileUpload from "./components/FileUpload";
import JSONDisplay from "./components/JSONDisplay";
import RepoLink from "./components/RepoLink";
import { DefaultWeightMap, petNameArray } from "./utils/itemMapping";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import InfoIcon from "@mui/icons-material/Info";
import ScaleIcon from "@mui/icons-material/Scale";
import { Container, Box } from "@mui/material";
import Weights from "./components/weights/Weights";
import PetComboList from "./components/comboList/ComboList";
import { findBestGroups } from "./utils/utils";

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

function App() {
  const [data, setData] = useState(null);
  const [groups, setGroups] = useState([]);
  const [usePetRank, setUsePetRank] = useState(false);
  const [includeLocked] = useState(false);
  const [selectedItems, setSelectedItems] = useState(defaultPetSelection);
  const [tabSwitch, setTabSwitch] = useState(0);
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
      case 4:
        return <Weights weightMap={weightMap} setWeightsProp={setWeights} />;
      case 3:
        return <PetComboList data={data} weightMap={weightMap} />;
      case 1:
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
      case 0:
        return <FileUpload onData={handleData} />;
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
    if (tabSwitch === 0) setTabSwitch(1); // move upload to expedition when done
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
      <Container>
        <Box sx={{ flexGrow: 1 }} className={"main-content"}>
          {selectComponent()}
        </Box>
        <Box sx={{ height: "64px" }} /> {/* Add extra space at the bottom */}
        <Box sx={{ width: "100%", position: "fixed", bottom: 0 }}>
          <BottomNavigation
            showLabels
            value={tabSwitch}
            onChange={(event, newValue) => setTabSwitch(newValue)}
          >
            <BottomNavigationAction label="Upload" icon={<InfoIcon />} />
            {!!data && (
              <BottomNavigationAction label="Expedition" icon={<InfoIcon />} />
            )}
            {!!data && (
              <BottomNavigationAction label="Charges" icon={<BadgeIcon />} />
            )}
            {/*{!!data && <BottomNavigationAction label="Exp. Rewards" icon={<BadgeIcon />} />}*/}
            {!!data && (
              <BottomNavigationAction
                label="Pet Combo List"
                icon={<BadgeIcon />}
              />
            )}
            {/*{!!data && <BottomNavigationAction label="Weighted Pets" icon={<ScaleIcon />} />}*/}
            {<BottomNavigationAction label="Weights" icon={<ScaleIcon />} />}
          </BottomNavigation>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;

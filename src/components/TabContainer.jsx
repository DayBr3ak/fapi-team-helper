import React from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Paper,
} from "@mui/material";
import RepoLink from "./RepoLink";
import ErrorBoundary from "../ErrorBoundary";

import InfoIcon from "@mui/icons-material/Info";
import ExpeditionGroupTab from "./ExpeditionGroupTab";
import FileUpload from "./FileUpload";
import { useDispatch, useSelector } from "react-redux";
import uiSlice, {
  findBestGroupAction,
  selectCurrentTab,
  selectGameSaveData,
  selectGroups,
  selectUsePetRank,
} from "../utils/uiSlice";

const TAB_UPLOAD = 0;
const TAB_EXPED = 1;
const TAB_COMBO_LIST = 3;
const TAB_GEAR = 4;

export default function TabContainer() {
  const dispatch = useDispatch();
  const data = useSelector(selectGameSaveData);
  const usePetRank = useSelector(selectUsePetRank);

  const groups = useSelector(selectGroups);
  const currentTab = useSelector(selectCurrentTab);

  const onTabChange = (event, newValue) => {
    dispatch(uiSlice.actions.setCurrentTab(newValue));
  };

  const handleData = (uploadedData) => {
    dispatch(uiSlice.actions.setGameStateData(uploadedData));
    dispatch(findBestGroupAction());

    if (currentTab === TAB_UPLOAD) {
      dispatch(uiSlice.actions.setCurrentTab(TAB_EXPED)); // move upload to expedition when done
    }
  };

  const onUsePetRankChange = (e) => {
    const checked = e.target.checked;
    dispatch(uiSlice.actions.setUsePetRank(!checked));
    dispatch(findBestGroupAction());
  };

  const selectComponent = () => {
    switch (currentTab) {
      // case TAB_COMBO_LIST:
      //   return <PetComboList data={data} weightMap={weightMap} />;
      // case TAB_GEAR:
      //   return <GearTab />;
      case TAB_EXPED:
        return (
          <ExpeditionGroupTab
            groups={groups}
            usePetRank={usePetRank}
            setUsePetRank={onUsePetRankChange}
          />
        );
      default:
        return <FileUpload onData={handleData} />;
    }
  };

  return (
    <>
      <RepoLink />
      <Box sx={{ pb: 7, pt: 3, overflow: "auto" }}>
        <Box sx={{ flexGrow: 1 }} className={"main-content"}>
          <ErrorBoundary fallback="error">{selectComponent()}</ErrorBoundary>
        </Box>
      </Box>
      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation showLabels value={currentTab} onChange={onTabChange}>
          <BottomNavigationAction
            label="Home"
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
    </>
  );
}

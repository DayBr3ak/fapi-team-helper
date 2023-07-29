import React, { useCallback, useMemo } from "react";
import "./ItemSelection.css";
import { petNameArray } from "../utils/itemMapping";
import PetItem from "./PetItem";
import { useDispatch, useSelector } from "react-redux";
import uiSlice, {
  findBestGroupAction,
  selectGameSaveData,
  selectSelectedPets,
} from "../utils/uiSlice";

const ItemSelection = () => {
  const dispatch = useDispatch();
  const data = useSelector(selectGameSaveData);
  const selectedItems = useSelector(selectSelectedPets);

  const selected = useMemo(() => {
    return selectedItems.reduce((previous, current) => {
      previous[current] = true;
      return previous;
    }, {});
  }, [selectedItems]);

  const isSelected = useCallback(
    (petId) => {
      return selected[petId];
    },
    [selectedItems]
  );

  const handleItemClick = (petId) => {
    dispatch(uiSlice.actions.toggleSelectPetId(petId));
    dispatch(findBestGroupAction());
  };

  const renderPet = (petData) => {
    const { petId } = petData;
    const isItemSelected = isSelected(petId);
    const handlePetClick = () => handleItemClick(petId);

    return (
      <PetItem
        key={petId}
        petData={petData}
        data={data}
        isSelected={isItemSelected}
        onClick={handlePetClick}
      />
    );
  };

  return <div className="item-selection">{petNameArray.map(renderPet)}</div>;
};

export default ItemSelection;

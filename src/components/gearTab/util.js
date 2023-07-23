function sand() {
  bigDouble +=
    Inventory2Main.PowerMod(
      bonusid,
      GameManager.i.PD.EquippedItems[i].BonusList[j].PowerBD *
        (1.0 +
          (GameManager.i.PD.EquippedItems[i].RefineLevel +
            GameManager.i.PD.EquippedItems[i].FreeRefineLevel) *
            GameManager.i.PD.EnhancingPower) *
        (GameManager.i.PD.AscensionCount >= 11 &&
        GameManager.i.PD.AscensionBestItemRatingBD /
          GameManager.i.PD.EquippedItems[i].GetTotalRating2() >
          0.999
          ? 1
          : Number.Min(
              1,
              GameManager.i.PD.AscensionBestItemRatingBD /
                GameManager.i.PD.EquippedItems[i].GetTotalRating2()
            ))
    ) *
    (Inventory2Main.IsFlat(bonusid)
      ? 1.0
      : GameManager.i.PD.ExpeShopEquipmentBonusOnRarityLevel > 0 &&
        GameManager.i.PD.EquippedItems[i].ItemRarity > 15
      ? Number.Pow(
          1.0 + GameManager.i.PD.ExpeShopEquipmentBonusOnRarityLevel * 0.01,
          GameManager.i.PD.EquippedItems[i].ItemRarity - 15
        )
      : 1.0);
}

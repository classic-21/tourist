import Scenic from "../models/scenic.model.js";
import Place from "../models/place.model.js";
import PurchasedDistrict from "../models/purchasedDistrict.model.js";
import PurchasedPlace from "../models/purchasedPlace.model.js";
import User from "../models/user.model.js";

/**
 * Returns true if userID has access to the given scenicID:
 *   - user isTestUser, OR
 *   - PurchasedDistrict exists for scenic's district, OR
 *   - PurchasedPlace exists for scenic's place
 */
export async function hasAccessToScenic(
  userID: string,
  scenicID: string
): Promise<boolean> {
  const user = await User.findById(userID).select("isTestUser");
  if (user?.isTestUser) return true;

  const scenic = await Scenic.findById(scenicID).select("placeID");
  if (!scenic) return false;

  const place = await Place.findById(scenic.placeID).select("districtID");
  if (!place) return false;

  const [districtAccess, placeAccess] = await Promise.all([
    PurchasedDistrict.findOne({ userID, districtID: place.districtID }),
    PurchasedPlace.findOne({ userID, placeID: scenic.placeID }),
  ]);

  return !!(districtAccess || placeAccess);
}

/**
 * Returns true if userID has access to the given placeID:
 *   - user isTestUser, OR
 *   - PurchasedDistrict exists for place's district, OR
 *   - PurchasedPlace exists for place
 */
export async function hasAccessToPlace(
  userID: string,
  placeID: string
): Promise<boolean> {
  const user = await User.findById(userID).select("isTestUser");
  if (user?.isTestUser) return true;

  const place = await Place.findById(placeID).select("districtID");
  if (!place) return false;

  const [districtAccess, placeAccess] = await Promise.all([
    PurchasedDistrict.findOne({ userID, districtID: place.districtID }),
    PurchasedPlace.findOne({ userID, placeID }),
  ]);

  return !!(districtAccess || placeAccess);
}

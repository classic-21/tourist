const apiRoutes: Record<string, string> = {
  getTourList: "tours/all",
  getTourDetails: "tours/:id",
  login: "users/login",
  signup: "users/create",
  getAllImages: "getAllImages",
  profile: "users/profile",
  updateProfile: "users/profile",
  changePassword: "users/change-password",
  order: "orders/:id",
  confirmOrder: "orders/:id",
  checkSubscription: "orders/:id/tour",
  getPurchasedTours: "orders/purchased",
  getReviews: "reviews/:tourID",
  addReview: "reviews/:tourID",
  getLiked: "likes",
  getLikedIDs: "likes/ids",
  toggleLike: "likes/:tourID",
  // 3-layer hierarchy
  getAllDistricts: "districts/all",
  getDistrict: "districts/:id",
  createDistrict: "districts",
  updateDistrict: "districts/:id",
  deleteDistrict: "districts/:id",
  getPlace: "places/:id",
  getPlacesByDistrict: "places/district/:id",
  createPlace: "places",
  updatePlace: "places/:id",
  deletePlace: "places/:id",
  getScenic: "scenics/:id",
  getScenicsByPlace: "scenics/place/:id",
  createScenic: "scenics",
  updateScenic: "scenics/:id",
  deleteScenic: "scenics/:id",
  getScenicAudio: "scenics/:id/audio/:lang",
  uploadScenicAudio: "scenics/:id/audio",
  createDistrictOrder: "orders/district/:id",
  createPlaceOrder: "orders/place/:id",
  getPurchasedDistricts: "orders/purchased/districts",
  getPurchasedPlaces: "orders/purchased/places",
};

const createUrl = (apiRoute: string, id?: string | number, extra?: string): string => {
  let route = apiRoutes[apiRoute];

  if (!route) {
    console.warn(`Unknown apiRoute: "${apiRoute}"`);
    return process.env.NEXT_PUBLIC_API_ENDPOINT + apiRoute;
  }

  // Replace the :id placeholder only if id is provided
  if (id !== undefined) {
    route = route.replace(":id", id.toString()).replace(":tourID", id.toString());
  }

  // Replace :lang placeholder if extra is provided
  if (extra !== undefined) {
    route = route.replace(":lang", extra);
  }

  return process.env.NEXT_PUBLIC_API_ENDPOINT + route;
};


const fetchAPI = async (url: string, requestMethod: string, requestBody?: any, bearerToken?: string) => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (bearerToken) {
      headers["Authorization"] = `Bearer ${bearerToken}`;
    }

    const options: RequestInit = {
      method: requestMethod,
      headers,
      credentials: "include",
    };

    if (requestMethod !== "GET" && requestBody) {
      options.body = JSON.stringify(requestBody);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("API error:", err);
    throw err;
  }
};


export { apiRoutes, createUrl, fetchAPI };

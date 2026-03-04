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
};

const createUrl = (apiRoute: string, id?: string | number): string => {
  let route = apiRoutes[apiRoute];

  if (!route) {
    console.warn(`Unknown apiRoute: "${apiRoute}"`);
    return process.env.NEXT_PUBLIC_API_ENDPOINT + apiRoute;
  }

  // Replace the :id placeholder only if id is provided
  if (id !== undefined) {
    route = route.replace(":id", id.toString()).replace(":tourID", id.toString());
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

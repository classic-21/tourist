const apiRoutes = {
  getTourList: "tours/all",
  getTourDetails: "tours/:id",
  login: "users/login",
  signup: "users/create",
  getAllImages: "getAllImages",
  profile: "users/profile",
  order: "orders/:id",
  confirmOrder: "orders/:id",
  checkSubscription: "orders/:id/tour"
};

// const API_ENDPOINT = "https://qa.indianarrated.com/api/v1/";

const createUrl = (apiRoute: string, id?: string | number): string => {
  let route = apiRoutes[apiRoute];

  // Replace the :id placeholder only if id is provided
  if (id) {
    route = route.replace(':id', id.toString());
  }
  return process.env.NEXT_PUBLIC_API_ENDPOINT + route;
};


const fetchAPI = async (url: string, requestMethod: string, requestBody?: any, bearerToken?: string) => {
  // console.log(url, requestMethod, requestBody);
  
  try {
    const headers: any = {
      'Content-Type': 'application/json'
    };

    // Add Authorization header if bearerToken is provided
    if (bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    // Create the fetch options object
    const options: any = {
      method: requestMethod,
      headers: headers,
      credentials: 'include'
    };

    // Only add body if the request method supports it and requestBody is provided
    if (requestMethod !== 'GET' && requestBody) {
      options.body = JSON.stringify(requestBody);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const jsonData = await response.json();
    // console.log("data: ", jsonData)
    return jsonData;
  } catch (err) {
    console.error("Some error has occurred!", err);
    throw err;
  }
};


export { apiRoutes, createUrl ,fetchAPI};

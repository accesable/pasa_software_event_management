import type { DataProvider } from "@refinedev/core";
export const API_BASE_URL = "http://localhost:8080";
export const API_URL = `${API_BASE_URL}/api/v1`

export const dataProvider: DataProvider = {
    getOne: async ({resource}) => {
      const accessToken = localStorage.getItem("access_token");
        // "resource" : "users/profile"
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${accessToken}`);
    
        const requestOptions : RequestInit = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        };
        const response = await fetch(`${API_URL}/${resource}`,requestOptions);

        if (response.status < 200 || response.status > 299) throw response;
    
        const data = await response.json();
    
        return { data };
    },
    update: () => {
      throw new Error("Not implemented");
    },
    getList: async ({resource}) => {
      // "resource" is events
      const response = await fetch(`${API_URL}/${resource}`);

      if (response.status < 200 || response.status > 299) throw response;
    
      const data = await response.json();
      const dataKey = Object.keys(data.data)[0]; // Gets the first key in `data`
      const dataContent = data.data[dataKey]; // Access the content
      // console.log(dataKey);
    
      return { data: dataContent , total: dataContent.length}
            
    },
    create: () => {
      throw new Error("Not implemented");
    },
    deleteOne: () => {
      throw new Error("Not implemented");
    },
    getApiUrl: () => API_URL,
    // Optional methods:
    getMany: async ({resource}) => {
      // "resource" is events
      const response = await fetch(`${API_URL}/${resource}`);

      if (response.status < 200 || response.status > 299) throw response;
    
      const data = await response.json();
    
      return { data: data.events,
              // count : data.events.length
       };
    },
    // createMany: () => { /* ... */ },
    // deleteMany: () => { /* ... */ },
    // updateMany: () => { /* ... */ },
    // custom: () => { /* ... */ },
  };
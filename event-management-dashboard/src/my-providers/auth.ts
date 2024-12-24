import {AuthProvider } from "@refinedev/core";

import { API_URL } from "./data";

// For demo purposes and to make it easier to test the app, you can use the following credentials
export const authCredentials = {
  email: "abc124@gmail.com",
  password: "123456",
};

export const authProvider: AuthProvider = {
  login: async ({ email,password }) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
    
        const raw = JSON.stringify({
          email: email,
          password: password
        });
    
        const requestOptions : RequestInit = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
          credentials : "include"
        };
    
        // Make the fetch request and await the response
        const response = await fetch(`${API_URL}/auth/login`, requestOptions);
    
        if (!response.ok) {
          throw new Error("Login failed");
        }
    
        // Parse the response as JSON
        const data = await response.json();
    
        // Save the accessToken in localStorage
        localStorage.setItem("access_token", data.data.accessToken);

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (e) {
      const error = e as Error;

      return {
        success: false,
        error: {
          message: "message" in error ? error.message : "Login failed",
          name: "name" in error ? error.name : "Invalid email or password",
        },
      };
    }
  },

  // simply remove the accessToken from localStorage for the logout
  logout: async () => {
    localStorage.removeItem("access_token");

    return {
      success: true,
      redirectTo: "/login",
    };
  },

  onError: async (error) => {
    // a check to see if the error is an authentication error
    // if so, set logout to true
    if (error.statusCode === "UNAUTHENTICATED") {
      return {
        logout: true,
        ...error,
      };
    }

    return { error };
  },

  check: async () => {
    try {
        let token = localStorage.getItem("access_token");
        if (!token) {
          return { authenticated: false };
        }else {
          const myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");
          const requestOptions : RequestInit = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow",
            credentials : "include"
          };
          const response = await fetch(`${API_URL}/auth/refresh`, requestOptions);
    
          if (!response.ok) {
            throw new Error("Login failed");
          }
      
          // Parse the response as JSON
          const data = await response.json();
      
          // Save the accessToken in localStorage
          localStorage.setItem("access_token", data.data.accessToken);
          token = localStorage.getItem("access_token");
        }
        return { authenticated: Boolean(token) };
    } catch (error) {
      // for any other error, redirect to the login page
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },
    // get the user information
    getIdentity: async () => {
      const accessToken = localStorage.getItem("access_token");
  
      try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${accessToken}`);
    
        const requestOptions : RequestInit = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow"
        };
        // Make the fetch request and await the response
        const response = await fetch(`${API_URL}/users/profile`, requestOptions);
    
        if (!response.ok) {
          throw new Error("Login failed");
        }
    
        // Parse the response as JSON
        const data = await response.json();

        return data.data.user;

      } catch (error) {
        return undefined;
      }
    },
    register : async ({email,name,password} : RegisterVariables) => {
      try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
    
        const raw = JSON.stringify({
          email: email,
          password: password,
          name : name
        });
    
        const requestOptions : RequestInit = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow"
        };
    
        // Make the fetch request and await the response
        const response = await fetch(`${API_URL}/auth/register`, requestOptions);
    
        if (!response.ok) {
          throw new Error("Register failed");
        }
    
        // Parse the response as JSON
        const data = await response.json();
    
        // Save the accessToken in localStorage
        // localStorage.setItem("access_token", data.data.accessToken);
        if(data.statusCode === 201 && 
          data.message === "User created successfully" &&
          data.data.user.email === email  // verify the email match with the response email
        ){
          return {
            success: true,
            redirectTo: "/login",
          };
        }else {
          return {
            success: false,
            error: {
              message: "User already exists",
              name: "UserExistsError",
            },
          };
        }


    } catch (e) {
      const error = e as Error;

      return {
        success: false,
        error: {
          message: "message" in error ? error.message : "Register failed",
          name: "name" in error ? error.name : "Invalid email or password",
        },
      };
    }
    }
};
type RegisterVariables = {
  email: string;
  password: string;
  name: string;
};
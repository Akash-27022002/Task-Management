import userData from '../data/data.json';

/**
 * Simulates fetching user data from a server.
 * @param {string} userId The ID of the user to fetch. Defaults to "123456".
 * @returns {Promise<object>} A promise that resolves with the user's data.
 */
export const fetchUserData = async (userId = "123456") => {
  console.log("API: Fetching data for user:", userId, JSON.parse(JSON.stringify(userData[userId])));
  // In a real app, this would be a fetch() call.
  // We return a deep copy to simulate immutability from an API response.
  return JSON.parse(JSON.stringify(userData[userId]));
};

/**
 * Simulates saving user data to a server.
 * @param {string} userId The ID of the user to save data for. Defaults to "123456".
 * @param {object} data The complete data object to save.
 * @returns {Promise<{success: boolean}>} A promise that resolves when the save is complete.
 */
export const saveUserData = async (userId = "123456", data) => {
  console.log("API: Saving data for user:", userId, data);
  userData[userId] = JSON.parse(JSON.stringify(data));
  // This is a placeholder. In a real Node.js environment, you could use `fs.writeFile`
  // to persist the changes back to the user.json file for a true mock backend.
  // For now, it just logs the action.
  return { success: true };
};

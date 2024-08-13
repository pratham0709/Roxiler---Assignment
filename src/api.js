import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api/products'; // Update this with your actual backend URL

// Fetch transactions with month, search query, and pagination
export const getTransactions = async (month, search = '', page = 1, perPage = 10) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/getCombinedData`, {
      month,
      search,
      page,
      perPage,
    });
    // console.log(response);
    // console.log(response?.data?.statistics);
    if (response.status === 200) {
      return response; // Ensure the backend returns data in this structure
    } else {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    throw error; // Re-throw error to handle it in the component
  }
};

// export const getStatistics = async (month) => {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/getStatistics`, { month });
//     console.log(response);
//     if (response.status === 200) {
//       return response.data;
//     } else {
//       throw new Error(`Failed to fetch statistics: ${response.statusText}`);
//     }
//   } catch (error) {
//     console.error('Error fetching statistics:', error.message);
//     throw error;
//   }
// };

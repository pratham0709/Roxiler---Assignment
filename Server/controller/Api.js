const axios = require('axios');
const Product = require("../models/Product");

exports.fetchApi = async (req, res) => {
    try {
        // Fetch the data from the third-party API
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const products = response.data;
    
        // Insert the fetched data into the MongoDB collection
        await Product.insertMany(products);
    
        res.send('Database initialized with seed data');
        // console.log("error");
      } catch (error) {
        console.error('Error initializing database:', error);
        res.status(500).send('Error initializing database');
      }
}


// Show all Transaction 
exports.listTransactions = async (req, res) => {
  try {
    const { search, page = 1, perPage = 10 } = req.body;

    // Build the query object
    const body = {};

    if (search) {
      body.$or = [
        { title: { $regex: search, $options: 'i' } }, // Case-insensitive regex search
        { description: { $regex: search, $options: 'i' } },
        { price: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total number of documents that match the query
    const total = await Product.countDocuments(body);

    // Fetch data with pagination
    const transactions = await Product.find(body)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));

    // Send the response
    res.json({
      total,
      page: parseInt(page),
      perPage: parseInt(perPage),
      transactions
    });
  } catch (error) {
    console.error('Error listing transactions:', error);
    res.status(500).send('Server error');
  }
};

// API For Statistics
exports.getStatistics = async (req, res) => {
  try {
    const { month } = req.body;

    if (!month) {
      return res.status(400).send('Month is required');
    }

    // Convert month name to month number
    const monthNumber = new Date(`${month} 1, 2023`).getMonth() + 1;

    // Calculate total sale amount for the selected month
    const totalSaleAmount = await Product.aggregate([
      {
        $match: {
          sold: true,
          $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$price' },
        },
      },
    ]);

    // Calculate total number of sold items for the selected month
    const totalSoldItems = await Product.countDocuments({
      sold: true,
      $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
    });

    // Calculate total number of not sold items for the selected month
    const totalNotSoldItems = await Product.countDocuments({
      sold: false,
      $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
    });

    // Send the response
    res.json({
      totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0,
      totalSoldItems,
      totalNotSoldItems,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).send('Server error');
  }
};

exports.getPriceRangeDistribution = async (req, res) => {
  try {
    const { month } = req.body;

    if (!month) {
      return res.status(400).send('Month is required');
    }

    // Convert month name to month number
    const monthNumber = new Date(`${month} 1, 2023`).getMonth() + 1;

    // Define the price ranges
    const priceRanges = [
      { range: '0-100', min: 0, max: 100 },
      { range: '101-200', min: 101, max: 200 },
      { range: '201-300', min: 201, max: 300 },
      { range: '301-400', min: 301, max: 400 },
      { range: '401-500', min: 401, max: 500 },
      { range: '501-600', min: 501, max: 600 },
      { range: '601-700', min: 601, max: 700 },
      { range: '701-800', min: 701, max: 800 },
      { range: '801-900', min: 801, max: 900 },
      { range: '901-above', min: 901, max: Infinity },
    ];

    // Filter by month regardless of year
    const matchMonthQuery = {
      $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
    };

    // Aggregate data to get the count of items in each price range
    const priceRangeData = await Promise.all(
      priceRanges.map(async (range) => {
        const count = await Product.countDocuments({
          ...matchMonthQuery,
          price: { $gte: range.min, $lte: range.max },
        });
        return { range: range.range, count };
      })
    );

    // Send the response
    res.json(priceRangeData);
  } catch (error) {
    console.error('Error fetching price range distribution:', error);
    res.status(500).send('Server error');
  }
};

//Create an API for pie chart Find unique categories and number of items from that
// category for the selected month regardless of the year.

exports.getCategoryDistribution = async (req, res) => {
  try {
    const { month } = req.body;

    if (!month) {
      return res.status(400).send('Month is required');
    }

    // Convert month name to month number
    const monthNumber = new Date(`${month} 1, 2023`).getMonth() + 1;

    // Filter by month regardless of year
    const matchMonthQuery = {
      $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
    };

    // Aggregate to find unique categories and count the number of items in each category
    const categoryData = await Product.aggregate([
      { $match: matchMonthQuery },
      {
        $group: {
          _id: '$category', // Group by category
          count: { $sum: 1 }, // Count the number of items in each category
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1,
        },
      },
    ]);

    // Send the response
    res.json(categoryData);
  } catch (error) {
    console.error('Error fetching category distribution:', error);
    res.status(500).send('Server error');
  }
};

//fetch all above Api's Data
//Create an API which fetches the data from all the 3 APIs mentioned above, combines
// the response and sends a final response of the combined JSO

// exports.getCombinedData = async (req, res) => {
//   try {
//     const { month } = req.body;

//     if (!month) {
//       return res.status(400).send('Month is required');
//     }

//     // Convert month name to month number
//     const monthNumber = new Date(`${month} 1, 2023`).getMonth() + 1;

//     // Filter by month regardless of year
//     const matchMonthQuery = {
//       $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
//     };

//     // Get statistics
//     const totalSaleAmount = await Product.aggregate([
//       { $match: { isSold: true, ...matchMonthQuery } },
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: '$price' },
//         },
//       },
//     ]);

//     const totalSoldItems = await Product.countDocuments({
//       isSold: true,
//       ...matchMonthQuery,
//     });

//     const totalNotSoldItems = await Product.countDocuments({
//       isSold: false,
//       ...matchMonthQuery,
//     });

//     // Get price range distribution
//     const priceRanges = [
//       { range: '0-100', min: 0, max: 100 },
//       { range: '101-200', min: 101, max: 200 },
//       { range: '201-300', min: 201, max: 300 },
//       { range: '301-400', min: 301, max: 400 },
//       { range: '401-500', min: 401, max: 500 },
//       { range: '501-600', min: 501, max: 600 },
//       { range: '601-700', min: 601, max: 700 },
//       { range: '701-800', min: 701, max: 800 },
//       { range: '801-900', min: 801, max: 900 },
//       { range: '901-above', min: 901, max: Infinity },
//     ];

//     const priceRangeData = await Promise.all(
//       priceRanges.map(async (range) => {
//         const count = await Product.countDocuments({
//           ...matchMonthQuery,
//           price: { $gte: range.min, $lte: range.max },
//         });
//         return { range: range.range, count };
//       })
//     );

//     // Get category distribution
//     const categoryData = await Product.aggregate([
//       { $match: matchMonthQuery },
//       {
//         $group: {
//           _id: '$category',
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           category: '$_id',
//           count: 1,
//         },
//       },
//     ]);

//     // Combine all data
//     const combinedData = {
//       statistics: {
//         totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0,
//         totalSoldItems,
//         totalNotSoldItems,
//       },
//       priceRangeDistribution: priceRangeData,
//       categoryDistribution: categoryData,
//     };

//     // Send the response
//     res.json(combinedData);
//   } catch (error) {
//     console.error('Error fetching combined data:', error);
//     res.status(500).send('Server error');
//   }
// };


// exports.combinedData = async (req, res) => {
//   try {
//     // Fetch data from all three APIs
//     const [transactionsResponse, barChartResponse, pieChartResponse] = await Promise.all([
//       axios.get(`http://localhost:4000/api/products/transactions?month=${month}`),
//       axios.get(`http://localhost:4000/api/products/barchart?month=${month}`),
//       axios.get(`http://localhost:4000/api/products/piechart?month=${month}`)
//     ]);

//     const transactions = transactionsResponse.data;
//     const barChart = barChartResponse.data;
//     const pieChart = pieChartResponse.data;

//     // Combine the responses
//     const combinedData = {
//       transactions,
//       barChart,
//       pieChart
//     };

//     // Send the combined data as a response
//     res.json(combinedData);

//   } catch (error) {
//     console.error('Error fetching combined data:', error);
//     res.status(500).json({ error: 'Failed to fetch combined data' });
//   }
// }

// exports.getCombinedData = async (req, res) => {
//   try {
//     const { search, page = 1, perPage = 10, month } = req.body;

//     if (!month) {
//       return res.status(400).send('Month is required');
//     }

//     // Convert month name to month number
//     const monthNumber = new Date(`${month} 1, 2023`).getMonth() + 1;

//     // Build the query object for transactions
//     const body = {};

//     if (search) {
//       body.$or = [
//         { title: { $regex: search, $options: 'i' } }, // Case-insensitive regex search
//         { description: { $regex: search, $options: 'i' } },
//         { price: { $regex: search, $options: 'i' } }
//       ];
//     }

//     // Get total number of transactions that match the query
//     const totalTransactions = await Product.countDocuments(body);

//     // Fetch transactions data with pagination
//     const transactions = await Product.find(body)
//       .skip((page - 1) * perPage)
//       .limit(parseInt(perPage));

//     // Fetch statistics data
//     const totalSaleAmount = await Product.aggregate([
//       {
//         $match: {
//           sold: true,
//           $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: '$price' },
//         },
//       },
//     ]);

//     const totalSoldItems = await Product.countDocuments({
//       sold: true,
//       $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
//     });

//     const totalNotSoldItems = await Product.countDocuments({
//       sold: false,
//       $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
//     });

//     // Fetch price range distribution data
//     const priceRanges = [
//       { range: '0-100', min: 0, max: 100 },
//       { range: '101-200', min: 101, max: 200 },
//       { range: '201-300', min: 201, max: 300 },
//       { range: '301-400', min: 301, max: 400 },
//       { range: '401-500', min: 401, max: 500 },
//       { range: '501-600', min: 501, max: 600 },
//       { range: '601-700', min: 601, max: 700 },
//       { range: '701-800', min: 701, max: 800 },
//       { range: '801-900', min: 801, max: 900 },
//       { range: '901-above', min: 901, max: Infinity },
//     ];

//     const priceRangeData = await Promise.all(
//       priceRanges.map(async (range) => {
//         const count = await Product.countDocuments({
//           $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
//           price: { $gte: range.min, $lte: range.max },
//         });
//         return { range: range.range, count };
//       })
//     );

//     // Fetch category distribution data
//     const categoryData = await Product.aggregate([
//       {
//         $match: {
//           $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
//         },
//       },
//       {
//         $group: {
//           _id: '$category', // Group by category
//           count: { $sum: 1 }, // Count the number of items in each category
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           category: '$_id',
//           count: 1,
//         },
//       },
//     ]);

//     // Combine all the data
//     const combinedData = {
//       transactions: {
//         total: totalTransactions,
//         page: parseInt(page),
//         perPage: parseInt(perPage),
//         transactions,
//       },
//       statistics: {
//         totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0,
//         totalSoldItems,
//         totalNotSoldItems,
//       },
//       priceRangeDistribution: priceRangeData,
//       categoryDistribution: categoryData,
//     };

//     // Send the response
//     res.json(combinedData);
//   } catch (error) {
//     console.error('Error fetching combined data:', error);
//     res.status(500).send('Server error');
//   }
// };

// Combined API
exports.getCombinedData = async (req, res) => {
  try {
    const { search, page = 1, perPage = 10, month } = req.body;

    if (!month) {
      return res.status(400).json({ error: 'Month is required' });
    }

    // Convert month name to month number
    const monthNumber = new Date(`${month} 1, 2023`).getMonth() + 1;

    // Build the query object for transactions
    const body = {};

    if (search) {
      body.$or = [
        { title: { $regex: search, $options: 'i' } }, // Case-insensitive regex search
        { description: { $regex: search, $options: 'i' } },
        { price: { $regex: search, $options: 'i' } },
      ];
    }

    if (month) {
      body.$expr = { $eq: [{ $month: '$dateOfSale' }, monthNumber] }; // Use $expr to filter by month
     }
    // Get total number of transactions that match the query
    const totalTransactions = await Product.countDocuments(body);

    // Fetch transactions data with pagination
    const transactions = await Product.find(body)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));

    // Fetch statistics data
    const totalSaleAmount = await Product.aggregate([
      {
        $match: {
          sold: true,
          $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$price' },
        },
      },
    ]);

    const totalSoldItems = await Product.countDocuments({
      sold: true,
      $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
    });

    const totalNotSoldItems = await Product.countDocuments({
      sold: false,
      $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
    });

    // Fetch price range distribution data
    const priceRanges = [
      { range: '0-100', min: 0, max: 100 },
      { range: '101-200', min: 101, max: 200 },
      { range: '201-300', min: 201, max: 300 },
      { range: '301-400', min: 301, max: 400 },
      { range: '401-500', min: 401, max: 500 },
      { range: '501-600', min: 501, max: 600 },
      { range: '601-700', min: 601, max: 700 },
      { range: '701-800', min: 701, max: 800 },
      { range: '801-900', min: 801, max: 900 },
      { range: '901-above', min: 901, max: Infinity },
    ];

    const priceRangeData = await Promise.all(
      priceRanges.map(async (range) => {
        const count = await Product.countDocuments({
          $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
          price: { $gte: range.min, $lte: range.max },
        });
        return { range: range.range, count };
      })
    );

    // Fetch category distribution data
    const categoryData = await Product.aggregate([
      {
        $match: {
          $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
        },
      },
      {
        $group: {
          _id: '$category', // Group by category
          count: { $sum: 1 }, // Count the number of items in each category
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1,
        },
      },
    ]);

    // Combine all the data
    const combinedData = {
      transactions: {
        total: totalTransactions,
        page: parseInt(page),
        perPage: parseInt(perPage),
        transactions,
      },
      statistics: {
        totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0,
        totalSoldItems,
        totalNotSoldItems,
      },
      priceRangeDistribution: priceRangeData,
      categoryDistribution: categoryData,
    };

    // Send the response
    res.json(combinedData);
  } catch (error) {
    console.error('Error fetching combined data:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

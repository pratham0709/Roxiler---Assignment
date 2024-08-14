import React, { useState, useEffect } from 'react';
import { getTransactions } from '../api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import HighlightText from './HighlightText';
import Highlight from './Highlight';
import Footer from './Footer';
import img1 from '../assets/images/transcation1.jpg'
import img2 from '../assets/images/image3.jpg'


// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const TransactionTable = () => {
  const [month, setMonth] = useState('March');
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState({
    totalSaleAmount: 0,
    totalSoldItems: 0,
    totalNotSoldItems: 0,
  });
  const [priceRangeData, setPriceRangeData] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await getTransactions(month, search, currentPage);
        // console.log(response);

          const data = response?.data?.transactions;
          console.log(data);
          // Extract transactions and pagination details
          const transactionsData = data?.transactions || [];
         
          const totalPages = Math.ceil((data?.total || 0) / (data?.perPage || 10));
          // const totalPages = data?.total 
          // console.log(totalPages);
  
          // Update state with the fetched data
          setTransactions(transactionsData);
          setTotalPages(totalPages);

          const statisticsResponse = await getTransactions(month);
          // console.log(statisticsResponse);
          const staticData = statisticsResponse?.data?.statistics;
          // console.log(staticData);
          setStatistics(staticData);

          const priceRangeResponse = await getTransactions(month, search, currentPage); // Assuming this API also returns price range data
          const priceRangeDistribution = priceRangeResponse.data.priceRangeDistribution;
          // console.log(priceRangeDistribution)
          setPriceRangeData(priceRangeDistribution);

      } catch (error) {
        console.error('Error fetching transactions:', error.message);
      }
    };
  
    fetchTransactions();
  }, [month, search, currentPage]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
    setCurrentPage(1); // Reset to first page on month change
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Prepare data for the bar chart
  const chartData = {
    labels: priceRangeData.map(range => range.range),
    datasets: [
      {
        label: 'Number of Items',
        data: priceRangeData.map(range => range.count),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };
  return (
    <div className="w-full text-white ">
    <div className='p-3 max-w-maxContent mx-auto'>
    <div className='w-[90%] mx-auto'>
        <div className='text-center text-4xl font-inter font-bold mt-7'><HighlightText text={"Transaction Insight Dashboard"} /></div>
      <div className="text-center text-4xl font-inter font-bold mt-7">
      Visualize Your Transactions <Highlight text={"From Data to Decisions"} /> </div>
      
      <div className='w-[70%] mx-auto text-lg text-center font-bold text-richblack-300 mt-4'>
      Empower your business with comprehensive transaction management. Use advanced search features and analytics tools to gain deeper insights into your sales data.
      </div>


      </div>
      <div className="flex flex-col sm:flex-col md:flex-row justify-between items-center mb-6">
      <div className='group mt-16 p-1 rounded-full bg-richblack-800 
                transition-all duration-200 hover:scale-95 w-fit cursor-pointer'>
        <select
          value={month}
          onChange={handleMonthChange}
          className="flex  items-center gap-2 rounded-full px-10 py-[5px] transition-all duration-200  text-bold text-richblack-200
                    group-hover:bg-richblack-900  bg-richblack-800 cursor-pointer"
        >
          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

          <div className='group mt-16 p-1 rounded-full bg-richblack-800 text-bold text-richblack-200 
                transition-all duration-200 hover:scale-95 w-fit cursor-pointer'>
              <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by title/description/price"
              className="flex  items-center gap-2 rounded-full px-10 py-[5px] transition-all duration-200  text-bold text-richblack-200
                    group-hover:bg-richblack-900  bg-richblack-800 cursor-pointer"
            />
          </div>
       
      </div>

      <div className="mb-6 text-xl mx-auto w-[90%] flex flex-col justify-center items-center font-bold text-richblack-200 text-center lg:mt-6 lg:mb-11 lg:pt-4 ">
        <h2 className="text-3xl font-bold text-white p-4">Transaction Statistics for {month}</h2>
        <div className='flex items-start flex-col'>
        <div>Total Sale Amount: ${statistics.totalSaleAmount.toFixed(2)}</div>
        <div>Total Sold Items: {statistics.totalSoldItems}</div>
        <div>Total Not Sold Items: {statistics.totalNotSoldItems}</div>
      </div>
      </div>

      
      <div className='overflow-x-auto'>
      <table className="min-w-full border rounded-lg mb-4 font-bold ">
        <thead className=" border-gray-200 font-inter ">
          <tr className=''>
            <th className="py-4 px-5 border-b text-left">Title</th>
            <th className="py-4 px-5 border-b text-left ">Description</th>
            <th className="py-4 px-5 border-b text-left ">Price</th>
            <th className="py-4 px-5 border-b text-left ">Date of Sale</th>
          </tr>
        </thead>
        <tbody className='text-richblack-200 border-gray-200'>
          {transactions.length ? (
            transactions.map((transaction) => (
              <tr key={transaction.id}  className='hover:bg-richblack-800 cursor-pointer transition-all duration-200'>
                <td className="py-4 px-6 border-b">{transaction.title}</td>
                <td className="py-4 px-6 border-b">{transaction.description}</td>
                <td className="py-4 px-6 border-b">${transaction.price.toFixed(2)}</td>
                <td className="py-4 px-6 border-b">{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="py-2 px-4 border-b text-center">No transactions found</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      

      <div className="flex justify-between items-center m-7 mb-10">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          active={true}
          // className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
          className='disabled:bg-gray-400 bg-yellow-50 text-black  cursor-pointer text-center text-[13px] px-6 py-3 rounded-md 
          font-bold hover:scale-95 transition-all duration-200'
        >
          Previous
        </button>
        <span className='font-bold'>Page {currentPage} of {totalPages}</span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className='disabled:bg-gray-400 bg-yellow-50 text-black cursor-pointer text-center text-[13px] px-6 py-3 rounded-md font-bold
          hover:scale-95 transition-all duration-200'
        >
          Next
        </button>

        
      </div>
      
      {/* Bar Chart for Price Range Distribution */}
      <div className='w-[90%] mx-auto m-7 p-4'>
        <div className="text-center text-4xl font-inter font-bold mt-7">
        Visualizing Item Count  <Highlight text={"Across Price Ranges"} /> </div>
        
        <div className='w-[80%] mx-auto text-lg text-center font-bold text-richblack-300 mt-4'>
        This chart displays the number of items within each price range for the selected month, regardless of the year. The selected month from the dropdown above is reflected in the data presented.
        </div>


      </div>

      <div className="mt-6 pt-4">
        <h2 className="text-xl text-center font-bold">Price Range Distribution for {month}</h2>

        <p className="w-[80%] mx-auto text-lg text-center font-bold text-richblack-300 mt-4">
        Visualize the distribution of items across different price ranges for the selected month.
        </p>
        
        <div className='bg-white mt-6 pt-7'>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    return `${context.label}: ${context.raw} items`;
                  },
                },
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Price Range',
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Number of Items',
                },
                beginAtZero: true,
              },
            },
          }}
        />
        </div>
        <div className='h-[130px]'></div>
        <div className='flex flex-col justify-center items-center lg:flex-row sm:flex-col sm:justify-center md:flex-row sm:items-center md:justify-between mt-6 pt-6'>
          <div className='w-[50%] flex flex-col items-center justify-center'>
            <div className='text-4xl font-inter font-bold mt-7'>Core Feature 
            <Highlight text={"Highlights"} />
            </div>
            <p className=" text-lg font-bold text-richblack-300 p-6">
                Utilize advanced search capabilities to filter transactions by title, description, or price. 
                Analyze your sales data through detailed statistics and visual charts to make informed business decisions.
            </p>
          </div>
          <div className='w-[50%]'>
            <img 
              src={img1}
              // loading='lazy'
              className='loding-lazy'
            />
          </div>
        </div>

        <div className='h-[130px]'></div>
        <div className='flex flex-col justify-center items-center sm:flex-col sm:justify-center sm:items-center md:flex-row lg:flex-row md:justify-between mt-6 pt-6 mb-10 gap-x-4 '>
        <div className='w-[50%]'>
            <img 
              src={img2}
              className='loding-lazy'
              // loading='lazy's
            />
          </div>
          
          <div className='w-[50%] flex flex-col items-center justify-center gap-x-4'>
            <div className='text-4xl font-inter font-bold mt-7'>Step-by-Step 
            <Highlight text={"Instructions"} />
            </div>
            <p className=" text-lg font-bold text-richblack-300 p-6">
            Select a month from the dropdown to view the corresponding transactions and statistics. 
            Use the search bar to filter results by specific criteria. Navigate through pages using the Next and Previous buttons.
            </p>
          </div>
          
        </div>
      </div>
    </div>
    <Footer />
    </div>

  );
};

export default TransactionTable;


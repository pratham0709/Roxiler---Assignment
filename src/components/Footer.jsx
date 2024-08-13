import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-richblack-800 py-10 mt-12">
    <div className='h-[50px]'></div>
      <div className="container mx-auto text-center">
        <p className="text-4xl text-richblack-100 font-bold">
        Join Our Community
        </p>
        <p className="mt-6 text-2xl text-richblack-200 font-inter ">
          Reach out on social media or through our contact form.
        </p>
        <div className="flex justify-center text-richblack-300 font-inter mt-4 space-x-4">
          <a href="https://github.com/pratham0709" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
            GitHub
          </a>
          <a href="https://x.com/Pratham_jadhav_" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
            Twitter
          </a>
          <a href="https://prathameshjadhav.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
            Portfolio
          </a>
        </div>
        <p className="text-sm mt-6 text-richblack-300">
          &copy; {new Date().getFullYear()} Prathamesh Jadhav. All rights reserved.
        </p>
        <p className="text-sm mt-2 text-richblack-300">
          Crafted with 💻 and ❤️. Keep pushing boundaries.
        </p>
        <div className='h-[50px]'></div>
      </div>
    </footer>
  );
};

export default Footer;

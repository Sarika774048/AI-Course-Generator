// GPaySimulatedCheckout.jsx - Create this as a new client component
"use client";

import React, { useState } from 'react';
import { Zap, XCircle, CheckCircle, Home } from 'lucide-react';

const GPaySimulatedCheckout = ({ plan, handleFinalizePayment }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to simulate the GPay button click and open the modal
    const handleGPayClick = () => {
        setIsModalOpen(true);
    };

    // Component to simulate the GPay popup window
    const GPayModal = () => {
        const totalAmount = plan.price.toFixed(2);
        
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 transition-opacity" onClick={() => setIsModalOpen(false)}>
                <div 
                    className="bg-white rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300 relative overflow-hidden" 
                    onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
                >
                    {/* GPay Header Bar */}
                    <div className='bg-gray-100 p-4 flex justify-between items-center border-b'>
                        <h3 className='font-semibold text-lg text-gray-800 flex items-center'>
                            <Zap className='w-5 h-5 mr-2 text-fuchsia-600'/> Google Pay
                        </h3>
                        <XCircle className='w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-600' onClick={() => setIsModalOpen(false)} />
                    </div>

                    {/* Modal Body */}
                    <div className='p-6 text-center'>
                        <p className='text-sm text-gray-500 mb-2'>Paying CourseApp</p>
                        <p className='text-5xl font-extrabold text-green-600 mb-6'>${totalAmount}</p>
                        
                        <p className='text-md font-semibold mb-2'>Confirm Purchase</p>
                        <p className='text-sm text-gray-600 mb-6'>Using Visa ending in 4242</p>

                        <button 
                            onClick={() => {
                                setIsModalOpen(false);
                                handleFinalizePayment(true); // SUCCESS
                            }}
                            className="w-full bg-black text-white py-3 rounded-full font-bold text-lg hover:bg-gray-800 transition shadow-lg mb-4 flex items-center justify-center space-x-2"
                        >
                            <Home className='w-5 h-5 fill-white'/> Confirm Payment
                        </button>

                        <button 
                            onClick={() => {
                                setIsModalOpen(false);
                                handleFinalizePayment(false); // FAILURE/CANCEL
                            }}
                            className="w-full text-red-500 py-2 rounded-lg font-bold text-sm hover:bg-red-50 transition"
                        >
                            Cancel and return to app
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="text-center space-y-4">
            {/* The Actual GPay Button Clone */}
            <button
                onClick={handleGPayClick}
                className="w-full max-w-sm bg-black text-white py-3 rounded-lg font-bold text-lg hover:bg-gray-800 transition shadow-lg mb-4 flex items-center justify-center space-x-2 mx-auto"
            >
                <Zap className='w-5 h-5 fill-white' />
                <span>Pay with Google Pay</span>
            </button>
            
            <p className='text-xs text-gray-500'>Clicking opens a secure payment confirmation window.</p>

            {/* Render the modal */}
            {isModalOpen && <GPayModal />}
        </div>
    );
};

export default GPaySimulatedCheckout;
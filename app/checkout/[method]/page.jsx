"use client";

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, Zap, Home, Lock, Shield } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

// --- COMPONENT FOR GOOGLE PAY MOCK ---
const GPayInterface = ({ plan, handleFinalizePayment }) => (
    <div className="p-8 border rounded-xl bg-white shadow-2xl max-w-md mx-auto my-10 text-center relative overflow-hidden">
        <div className='absolute top-0 left-0 w-full h-1 bg-green-500'></div>
        
        <Zap className="w-12 h-12 text-black mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-6">Authorize Payment with Google Pay</h2>
        <p className='text-4xl font-extrabold text-green-600 mb-8'>${plan.price.toFixed(2)}</p>
        <p className='text-sm text-gray-600 mb-3'>Confirm with your registered card (Visa *8490)</p>
        
        <button 
            onClick={() => handleFinalizePayment(true)} // ✅ redirect to success
            className="w-full bg-black text-white py-3 rounded-lg font-bold text-lg hover:bg-gray-800 transition shadow-lg mb-4 flex items-center justify-center"
        >
            <Home className='w-5 h-5 mr-3 fill-white' /> Pay Now
        </button>

        <button 
            onClick={() => handleFinalizePayment(false)} // ✅ redirect to failure
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-bold text-lg hover:bg-gray-300 transition"
        >
            Cancel Transaction
        </button>

        <p className='text-xs text-gray-400 mt-4'>Powered by Google</p>
    </div>
);

// --- COMPONENT FOR CARD MOCK ---
const CardInterface = ({ plan, handleFinalizePayment }) => (
    <div className="p-8 border rounded-xl bg-white shadow-2xl max-w-lg mx-auto my-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <CreditCard className='w-6 h-6 mr-2'/> Enter Card Details
        </h2>
        <div className='space-y-4'>
            <input type="text" placeholder="Card Number" className="w-full p-3 border border-gray-300 rounded-lg" />
            <input type="text" placeholder="Name on Card" className="w-full p-3 border border-gray-300 rounded-lg" />
            <div className="flex gap-4">
                <input type="text" placeholder="MM/YY" className="w-1/2 p-3 border border-gray-300 rounded-lg" />
                <input type="text" placeholder="CVC" className="w-1/2 p-3 border border-gray-300 rounded-lg" />
            </div>

            <button
                onClick={() => handleFinalizePayment(true)} // redirect to success
                className="w-full bg-fuchsia-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-fuchsia-700 transition shadow-lg mt-4"
            >
                Submit Payment for ${plan.price.toFixed(2)}
            </button>

            <button
                onClick={() => handleFinalizePayment(false)} // redirect to failure
                className="w-full bg-red-100 text-red-600 py-3 rounded-lg font-bold text-sm hover:bg-red-200 transition"
            >
                Cancel and Return
            </button>
        </div>
    </div>
);

const DynamicCheckoutPage = () => {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    const method = params.method; 
    const planParam = searchParams.get('plan'); 

    // --- Plan Details ---
    const planDetails = {
        pro: { name: 'Pro Creator', price: 19.00 },
        business: { name: 'Business+', price: 49.00 },
    }[planParam] || { name: 'Unknown Plan', price: 0.00 };
    
    const TAX_RATE = 0.00;
    const totalDue = planDetails.price * (1 + TAX_RATE);

    // --- Select the component ---
    let CheckoutComponent = null;
    switch (method) {
        case 'creditdebitcard': 
            CheckoutComponent = CardInterface;
            break;
        case 'googlepay':
            CheckoutComponent = GPayInterface;
            break;
        default:
            return (
                <div className='p-10 text-center min-h-screen bg-white'>
                    <h1 className='text-3xl font-bold text-red-600 mb-4'>Invalid Payment Method Specified</h1>
                    <p className='text-gray-600 mb-6'>The payment gateway could not be found for "{method}".</p>
                    <Link href="/upgrade" className="text-fuchsia-600 mt-4 block">
                        <ArrowLeft className="w-4 h-4 mr-2 inline" /> Return to Plan Selection
                    </Link>
                </div>
            );
    }
    
    // --- Final handler for redirection ---
    const handleFinalizePayment = (isSuccess) => {
        setTimeout(() => {
            if (isSuccess) {
                 router.push(`/dashboard/upgrade/success?plan=${planParam}`);
            } else {
                 router.push(`/dashboard/upgrade/failure?plan=${planParam}`);
            }
        }, 500); 
    };

    return (
        <div className="min-h-screen bg-fuchsia-50">
            <header className='sticky top-0 z-20 bg-white shadow-md'>
                <div className='max-w-7xl mx-auto p-4 flex justify-between items-center'>
                    <h1 className='text-xl font-bold text-fuchsia-700'>Secure Checkout</h1>
                    <div className='flex items-center text-sm text-gray-500'>
                        <Lock className='w-4 h-4 mr-1 text-green-500' /> SSL Secured
                    </div>
                </div>
            </header>

            <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-4'>
                {/* Payment Interface */}
                <div className='lg:col-span-2'>
                    {CheckoutComponent && (
                        <CheckoutComponent 
                            plan={planDetails} 
                            handleFinalizePayment={handleFinalizePayment} 
                        />
                    )}
                </div>

                {/* Order Summary */}
                <div className='lg:col-span-1 bg-white p-6 rounded-xl shadow-lg self-start sticky top-4'>
                    <h2 className='text-xl font-bold mb-4'>Order Summary</h2>
                    <p className='text-sm text-gray-600 mb-4'>
                        Paying for: <span className='font-semibold text-gray-800'>{planDetails.name}</span>
                    </p>
                    <div className="flex justify-between pt-4 mt-4 border-t border-dashed">
                        <span className="text-xl font-bold">Total Due Now</span>
                        <span className="text-2xl font-extrabold text-fuchsia-700">${totalDue.toFixed(2)}</span>
                    </div>
                    <div className='mt-8 pt-4 border-t text-center'>
                        <div className='flex items-center justify-center text-green-600 text-sm'>
                            <Shield className='w-4 h-4 mr-1' /> Secure Transaction
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicCheckoutPage;

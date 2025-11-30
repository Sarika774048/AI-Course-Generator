"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  CreditCard, 
  Smartphone, 
  Lock, 
  Loader2, 
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Inner component that uses useSearchParams
function PaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get dynamic values or default to Monthly if missing
  const planPrice = searchParams.get('price') || "9.99";
  const planName = searchParams.get('plan') || "Monthly";

  const [selectedMethod, setSelectedMethod] = useState("card");
  const [processing, setProcessing] = useState(false);

  const handlePayment = (e) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
        router.push("/payment-success");
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* LEFT COLUMN: Order Summary */}
      <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border sticky top-10">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="flex justify-between items-center mb-4 pb-4 border-b">
                  <div>
                      <p className="font-semibold text-gray-700">{planName} Plan</p>
                      <p className="text-sm text-gray-500">Unlimited AI Generation</p>
                  </div>
                  <p className="font-bold text-gray-900">${planPrice}</p>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-purple-700">
                  <span>Total Due</span>
                  <span>${planPrice}</span>
              </div>
          </div>
      </div>

      {/* RIGHT COLUMN: Payment Details */}
      <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                  <Lock className="w-5 h-5 text-green-600" />
                  <h1 className="text-xl font-bold text-gray-800">Secure Checkout</h1>
              </div>

              {/* Method Selection */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                  <button 
                      onClick={() => setSelectedMethod("card")}
                      className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all
                      ${selectedMethod === "card" ? "border-purple-600 bg-purple-50 text-purple-700" : "border-gray-200 hover:border-gray-300"}`}
                  >
                      <CreditCard className="w-6 h-6" />
                      <span className="font-semibold">Card</span>
                  </button>
                  <button 
                      onClick={() => setSelectedMethod("gpay")}
                      className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all
                      ${selectedMethod === "gpay" ? "border-purple-600 bg-purple-50 text-purple-700" : "border-gray-200 hover:border-gray-300"}`}
                  >
                      <Smartphone className="w-6 h-6" />
                      <span className="font-semibold">Google Pay</span>
                  </button>
              </div>

              {processing ? (
                  <div className="flex flex-col items-center justify-center py-10">
                      <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-4" />
                      <h3 className="text-xl font-bold text-gray-800">Processing Payment...</h3>
                      <p className="text-gray-500">Do not close this window</p>
                  </div>
              ) : (
                  <form onSubmit={handlePayment}>
                      {selectedMethod === "card" && (
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                  <div className="relative">
                                      <CreditCard className="absolute left-3 top-3.5 text-gray-400 w-5 h-5"/>
                                      <input type="text" required maxLength="19" placeholder="0000 0000 0000 0000"
                                          className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                      />
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                                      <input type="text" required maxLength="5" placeholder="MM/YY" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"/>
                                  </div>
                                  <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                      <input type="password" required maxLength="3" placeholder="123" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"/>
                                  </div>
                              </div>
                          </div>
                      )}

                      {selectedMethod === "gpay" && (
                           <div className="py-8 text-center">
                              <p className="text-gray-600 mb-6">Redirecting to Google Pay secure gateway...</p>
                              <div className="flex justify-center">
                                  <div className="bg-black text-white px-8 py-3 rounded-full flex items-center gap-2 cursor-pointer">
                                      <span className="font-bold text-lg">G</span> <span className="font-medium">Pay</span>
                                  </div>
                              </div>
                           </div>
                      )}

                      <Button type="submit" className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg">
                          Pay ${planPrice}
                      </Button>
                  </form>
              )}
          </div>
      </div>
    </div>
  );
}

// Wrap in Suspense for Next.js 14/15 SearchParams compatibility
export default function MockPaymentPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Suspense fallback={<div>Loading checkout...</div>}>
        <PaymentForm />
      </Suspense>
    </div>
  );
}
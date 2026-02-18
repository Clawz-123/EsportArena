import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';

const ChoosePaymentMethod = ({ amount, onBack, onPay }) => {
  const [selectedMethod, setSelectedMethod] = useState('');

  const methods = [
    {
      id: 'esewa',
      name: 'eSewa',
      description: 'Pay with eSewa wallet',
      color: 'bg-emerald-500',
      hoverColor: 'hover:bg-emerald-500/10 hover:border-emerald-500/50',
      activeColor: 'bg-emerald-500/10 border-emerald-500',
      iconText: 'e'
    },
    {
      id: 'khalti',
      name: 'Khalti',
      description: 'Pay with Khalti wallet',
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-600/10 hover:border-purple-600/50',
      activeColor: 'bg-purple-600/10 border-purple-600',
      iconText: 'K'
    }
  ];

  const handlePay = () => {
    if (selectedMethod) {
      onPay(selectedMethod);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#0F172A] border border-slate-700 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2 border-b border-slate-700/50">
          <div>
            <h2 className="text-xl font-bold text-white">Select Payment Method</h2>
            <p className="text-sm text-slate-400 mt-1">
              Adding <span className="text-white font-medium">{amount}</span> coins to your wallet
            </p>
          </div>
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-700/50 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Methods Grid */}
          <div className="grid grid-cols-2 gap-4">
            {methods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`
                                    relative p-4 rounded-xl border transition-all text-left group
                                    ${selectedMethod === method.id
                    ? method.activeColor
                    : 'bg-slate-800/50 border-slate-700 ' + method.hoverColor
                  }
                                `}
              >
                <div className={`
                                    w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-3 shadow-lg transition-transform group-hover:scale-110 duration-200
                                    ${method.color}
                                `}>
                  {method.iconText}
                </div>
                <h3 className="font-semibold text-white">{method.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{method.description}</p>

                {selectedMethod === method.id && (
                  <div className="absolute top-4 right-4 text-white">
                    <div className={`w-4 h-4 rounded-full ${method.color.replace('bg-', 'bg-')} flex items-center justify-center`}>
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Security Note */}
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-xs text-slate-400">
              Your payment is secure. We don't store your payment details.
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onBack}
              className="py-3 px-4 rounded-xl font-semibold border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handlePay}
              disabled={!selectedMethod}
              className={`
                                py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                                ${selectedMethod
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }
                            `}
            >
              Pay NPR {amount}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoosePaymentMethod;

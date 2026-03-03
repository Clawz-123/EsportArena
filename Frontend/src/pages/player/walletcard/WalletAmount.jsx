import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

const WalletAmount = ({ onClose, onContinue }) => {
  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');

  const presetAmounts = [100, 250, 500, 1000, 2500, 5000];

  // Helper to get the actual amount value (custom or preset)
  const getFinalAmount = () => {
    if (customAmount) return parseInt(customAmount);
    if (selectedAmount) return selectedAmount;
    return 0;
  };

  const handleContinue = () => {
    const amount = getFinalAmount();
    if (amount >= 10) {
      onContinue(amount);
    }
  };

  const handlePresetSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount(''); // Clear custom amount if a preset is selected
  };

  const handleCustomChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(val);
    setSelectedAmount(''); // Clear preset if custom is being typed
  };

  const finalAmount = getFinalAmount();
  const isValid = finalAmount >= 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#0F172A] border border-slate-700 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div>
            <h2 className="text-xl font-bold text-white">Add Funds</h2>
            <p className="text-sm text-slate-400 mt-1">Choose an amount to add to your wallet</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Presets */}
          <div className="grid grid-cols-3 gap-3">
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handlePresetSelect(amount)}
                className={`
                                    py-3 px-4 rounded-xl font-semibold text-sm transition-all border
                                    ${selectedAmount === amount
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                  }
                                `}
              >
                {amount.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Or enter custom amount</label>
            <div className="relative">
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomChange}
                placeholder="Enter amount"
                className={`
                                    w-full bg-slate-800/50 border rounded-xl py-3 pl-4 pr-16 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all
                                    ${customAmount ? 'border-blue-500 ring-blue-500/20' : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'}
                                `}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                Coins
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Minimum: 10 coins
            </p>
          </div>

          {/* Action */}
          <button
            onClick={handleContinue}
            disabled={!isValid}
            className={`
                            w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                            ${isValid
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }
                        `}
          >
            Continue
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletAmount;

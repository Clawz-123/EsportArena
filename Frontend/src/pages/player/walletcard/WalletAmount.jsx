import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

const WalletAmount = ({ onClose, onContinue }) => {
  const MIN_AMOUNT = 10;
  const MAX_AMOUNT = 5000;

  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const presetAmounts = [100, 250, 500, 1000, 2500, 5000];

  // Helper to get the actual amount value (custom or preset)
  const getFinalAmount = () => {
    if (customAmount !== '') {
      const parsed = Number(customAmount);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    if (selectedAmount) return selectedAmount;
    return 0;
  };

  const handleContinue = () => {
    const amount = getFinalAmount();

    if (!amount) {
      toast.error('Please enter an amount.');
      return;
    }

    if (amount < 0) {
      toast.error('Amount cannot be negative.');
      return;
    }

    if (amount < MIN_AMOUNT) {
      toast.error(`Minimum top-up amount is ${MIN_AMOUNT} coins.`);
      return;
    }

    if (amount > MAX_AMOUNT) {
      toast.error(`Maximum top-up amount is ${MAX_AMOUNT} coins.`);
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmationConfirm = () => {
    const amount = getFinalAmount();
    onContinue(amount);
    setShowConfirmation(false);
  };

  const handlePresetSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount(''); // Clear custom amount if a preset is selected
  };

  const handleCustomChange = (e) => {
    const raw = String(e.target.value || '').trim();

    if (!raw) {
      setCustomAmount('');
      setSelectedAmount('');
      return;
    }

    if (raw.startsWith('-')) {
      const digits = raw.replace(/[^0-9]/g, '');
      setCustomAmount(digits ? `-${digits}` : '-');
      setSelectedAmount('');
      return;
    }

    const val = raw.replace(/[^0-9]/g, '');
    setCustomAmount(val);
    setSelectedAmount(''); // Clear preset if custom is being typed
  };

  const finalAmount = getFinalAmount();
  const canAttempt = finalAmount !== 0;

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
              Minimum: {MIN_AMOUNT} coins | Maximum: {MAX_AMOUNT} coins
            </p>
          </div>

          {/* Action */}
          <button
            onClick={handleContinue}
            disabled={!canAttempt}
            className={`
                            w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                            ${canAttempt
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        title="Add Funds to Wallet?"
        message={`You are about to add ${getFinalAmount().toLocaleString()} coins to your wallet. You will be redirected to select a payment method.`}
        confirmText="Continue"
        cancelText="Cancel"
        variant="info"
        onConfirm={handleConfirmationConfirm}
        onCancel={() => setShowConfirmation(false)}
      />
    </div>
  );
};

export default WalletAmount;

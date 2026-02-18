import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiousinstance";

export const fetchWalletBalance = createAsyncThunk(
	"wallet/fetchBalance",
	async (_, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get("/wallet/balance/");
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message);
		}
	}
);

export const fetchWalletTransactions = createAsyncThunk(
	"wallet/fetchTransactions",
	async (_, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get("/wallet/transactions/");
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message);
		}
	}
);

export const initiateTopUp = createAsyncThunk(
	"wallet/initiateTopUp",
	async ({ amount }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post("/payment/topup/initiate/", { amount });
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message);
		}
	}
);

export const verifyTopUp = createAsyncThunk(
	"wallet/verifyTopUp",
	async ({ pidx }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post("/payment/topup/verify/", {
				pidx,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message);
		}
	}
);

const initialState = {
	balance: null,
	transactions: [],
	loading: false,
	error: null,
	topUpLoading: false,
	topUpError: null,
	verifyLoading: false,
	verifyError: null,
	lastPaymentUrl: null,
};

const walletSlice = createSlice({
	name: "wallet",
	initialState,
	reducers: {
		clearWalletError: (state) => {
			state.error = null;
			state.topUpError = null;
			state.verifyError = null;
		},
		clearPaymentUrl: (state) => {
			state.lastPaymentUrl = null;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(fetchWalletBalance.pending, (state) => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(fetchWalletBalance.fulfilled, (state, action) => {
			state.loading = false;
			const result = action.payload?.Result || action.payload?.result || action.payload;
			state.balance = result;
		});
		builder.addCase(fetchWalletBalance.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload;
		});

		builder.addCase(fetchWalletTransactions.pending, (state) => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(fetchWalletTransactions.fulfilled, (state, action) => {
			state.loading = false;
			const result = action.payload?.Result || action.payload?.result || action.payload;
			state.transactions = Array.isArray(result) ? result : result?.transactions || [];
		});
		builder.addCase(fetchWalletTransactions.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload;
		});

		builder.addCase(initiateTopUp.pending, (state) => {
			state.topUpLoading = true;
			state.topUpError = null;
			state.lastPaymentUrl = null;
		});
		builder.addCase(initiateTopUp.fulfilled, (state, action) => {
			state.topUpLoading = false;
			const result = action.payload?.Result || action.payload?.result || action.payload;
			state.lastPaymentUrl = result?.payment_url || result?.order?.payment_url || null;
		});
		builder.addCase(initiateTopUp.rejected, (state, action) => {
			state.topUpLoading = false;
			state.topUpError = action.payload;
		});

		builder.addCase(verifyTopUp.pending, (state) => {
			state.verifyLoading = true;
			state.verifyError = null;
		});
		builder.addCase(verifyTopUp.fulfilled, (state, action) => {
			state.verifyLoading = false;
			const result = action.payload?.Result || action.payload?.result || action.payload;
			if (result?.wallet) {
				state.balance = result.wallet;
			}
		});
		builder.addCase(verifyTopUp.rejected, (state, action) => {
			state.verifyLoading = false;
			state.verifyError = action.payload;
		});
	},
});

export const { clearWalletError, clearPaymentUrl } = walletSlice.actions;
export default walletSlice.reducer;

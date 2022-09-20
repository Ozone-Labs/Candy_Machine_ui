import { createSlice } from '@reduxjs/toolkit'

export const walletSlice = createSlice({
    name: 'wallet',
    initialState: {
        // provider: null,
        account: null,
        // chainId: null,
        connected: false,
    },
    reducers: {
        setConnection(state, action) {
            const { account, connected } = action.payload
            console.log(action.payload)
            // state.provider = provider;
            // state.chainId = chainId;
            state.account = account;
            state.connected = connected;
        },
        disconnectWallet(state) {
            state.account = null
            state.connected = false
        }
    },
})

// Action creators are generated for each case reducer function
export const { setConnection, disconnectWallet } = walletSlice.actions

export default walletSlice.reducer
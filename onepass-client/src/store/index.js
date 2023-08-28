import { configureStore } from "@reduxjs/toolkit";
import authReducers from "../reducers/authReducers";
import generalReducers from "../reducers/generalReducers";
import vaultReducers from "../reducers/vaultReducers";

const store = configureStore({
    reducer: {
        auth: authReducers,
        general: generalReducers,
        vault: vaultReducers
    },
    devTools: false
})

export default store
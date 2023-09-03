import { combineReducers } from "redux";
import authReducers from "./authReducers.js";
import generalReducers from "./generalReducers.js";
import vaultReducers from "./vaultReducers.js";

const rootReducer = combineReducers({
    auth: authReducers,
    general: generalReducers,
    vault: vaultReducers
})

export default rootReducer
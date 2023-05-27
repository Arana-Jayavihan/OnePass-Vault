import { combineReducers } from "redux";
import authReducers from "./authReducers";
import generalReducers from "./generalReducers";
import vaultReducers from "./vaultReducers";

const rootReducer = combineReducers({
    auth: authReducers,
    general: generalReducers,
    vault: vaultReducers
})

export default rootReducer
import { combineReducers } from "redux";
import authReducers from "./authReducers";
import generalReducers from "./generalReducers";
import loginReducers from "./loginReducers";
import vaultReducers from "./vaultReducers";

const rootReducer = combineReducers({
    auth: authReducers,
    general: generalReducers,
    login: loginReducers,
    vault: vaultReducers
})

export default rootReducer
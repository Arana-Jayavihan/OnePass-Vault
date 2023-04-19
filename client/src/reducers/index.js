import { combineReducers } from "redux";
import authReducers from "./authReducers";
import generalReducers from "./generalReducers";
import loginReducers from "./loginReducers";

const rootReducer = combineReducers({
    auth: authReducers,
    general: generalReducers,
    login: loginReducers
})

export default rootReducer
// import { applyMiddleware, createStore } from 'redux'
// import thunk from 'redux-thunk'
// import rootReducer from '../reducers';
// import { composeWithDevTools } from 'redux-devtools-extension';

// const store = createStore(
//     rootReducer,
//     composeWithDevTools(
//       applyMiddleware(thunk)
//       // other store enhancers if any
//     ),
//     devTools: false
//   );
  

// export default store

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
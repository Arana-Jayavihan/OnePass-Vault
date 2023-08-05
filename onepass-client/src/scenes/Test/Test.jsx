// import Card from 'components/Card/Card';
// import React from 'react';
// import { useSelector } from 'react-redux';
// import {
//     Typography,
//     useTheme,
//     IconButton
// } from "@mui/material";

// const Test = () => {
//     const vaults = useSelector(state => state.auth.user.vaults)
//     console.log(vaultArr)

//     return (
//         <>
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'center'}}>
//                 {
//                     vaults && vaultArr.length > 0 ?
//                         vaultArr.map((vault, index) => (
//                             <div style={{ margin: '2rem' }}>
//                                 <Card className="" >
//                                     <Typography variant="h2" fontWeight="bold" sx={{ textAlign: 'center', margin: '3rem', marginBottom: '1.5rem', marginTop: 0, color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >
//                                         {vault.vaultName}
//                                     </Typography>
//                                 </Card>
//                             </div>
//                         )) :
//                         null
//                 }
//             </div>
//         </>

//     );
// }

// export default Test;

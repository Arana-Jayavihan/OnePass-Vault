import React from 'react';
import '../../App.css';
import { Typography } from '@mui/material';
const Transactions = () => {
    return (
        <>
            <div style={{ height: "100%", width: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div class="container2">
                    <span class="react-logo">
                        <span class="nucleo"></span>
                    </span>

                </div>
                <div>
                    <Typography sx={{ textAlign: 'center', color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', fontSize: '5rem', fontWeight: 'bold' }}>
                        Coming Soon
                    </Typography>
                    <Typography variant='h5' sx={{ textAlign: 'center', paddingTop: '.5rem', paddingLeft: '.5rem' }}>
                        Developing a System is hard, Developing a Secure System is harder, Be patient.
                    </Typography>
                </div>

            </div>
        </>

    );
}

export default Transactions;

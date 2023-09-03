import React from 'react';
import { motion } from "framer-motion"
import './vault.css'
const Vault = (props) => {
    return (
        <motion.div className='card2'
            whileInView={{ opacity: [0, 1] }}
            transition={{ duration: .75, ease: 'easeInOut' }}
            initial={{ opacity: 0 }}
        >
            {props.children}
        </motion.div>
    );
}

export default Vault;

import { Typography } from '@mui/material'
import React from 'react'
import { Modal } from 'react-bootstrap'
import { useTheme } from '@mui/material'
import './modalStyle.css'
import { motion } from "framer-motion"

export const NewModel = (props) => {
    const theme = useTheme()
    return (
        <Modal className='modal-dialog-centered' size={props.size} show={props.show} onHide={props.close} modalC aria-labelledby="contained-modal-title-vcenter" centered
            style={{ backdropFilter: 'blur(1px)', zIndex: '900', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
            <Modal.Header >
                <Modal.Title>
                    <Typography sx={{ color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {props.ModalTitle}
                    </Typography>

                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {props.children}
            </Modal.Body>
            <Modal.Footer>

                {
                    props.buttons ? props.buttons.map(button => (
                        button.color === 'primary' ?
                            <motion.button
                                className='form-control' style={{ width: 'auto', margin: '0 10px', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', border: 'none', color: '#fff' }}
                                whileHover={{ scale: [1, 1.1] }}
                                type={button.type ? button.type : 'button'}
                                key={button.label}
                                onClick={button.onClick}
                            >
                                {button.label}
                            </motion.button>
                            :
                            <motion.button
                                key={button.label}
                                variant={button.color}
                                onClick={button.onClick}
                                className='form-control' style={{ width: 'auto', margin: '0 10px', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', border: 'none', color: '#fff' }}
                                whileHover={{ scale: [1, 1.1] }}
                            >
                                {button.label}
                            </motion.button>
                    )
                    

                    ) :
                        <div style={{ display: 'flex' }}>
                            <motion.button
                                className='form-control'
                                style={{ width: 'fit-content', backgroundColor: theme.palette.neutral[200] }}
                                whileHover={{ scale: [1, 1.1] }}
                                onClick={props.close}>
                                Close
                            </motion.button>
                            <motion.button
                                className='form-control' style={{ width: 'auto', margin: '0 10px', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', border: 'none', color: '#fff' }}
                                whileHover={{ scale: [1, 1.1] }}
                                onClick={props.handleClose}
                            >
                                Save Changes
                            </motion.button>
                        </div>
                }
            </Modal.Footer>
        </Modal>
    )

}
import { Typography } from '@mui/material'
import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { useTheme } from '@mui/material'
import './modalStyle.css'
/**
* @author
* @function NewModel
**/

export const NewModel = (props) => {
    const theme = useTheme()
    return (
        <Modal className='modal-dialog-centered' size={props.size} show={props.show} onHide={props.close} modalC aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <Typography sx={{ color: theme.palette.secondary[500], fontSize: '1.5rem', fontWeight: 'bold' }}>
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
                            <Button type={button.type ? button.type : 'button'} key={button.label} variant={button.color} style={{ color: 'black', border: 'none', backgroundColor: theme.palette.secondary[500], margin: '0 10px' }} onClick={button.onClick} >
                                {button.label}
                            </Button>
                            :
                            <Button key={button.label} variant={button.color} onClick={button.onClick} >
                                {button.label}
                            </Button>
                    )

                    ) :
                        <div>
                            <Button variant="secondary" style={{ margin: '0 10px' }} onClick={props.close}>
                                Close
                            </Button>
                            <Button variant='primary' style={{ color: 'black', border: 'none', backgroundColor: theme.palette.secondary[500], margin: '0 10px' }} onClick={props.handleClose}>
                                Save Changes
                            </Button>
                        </div>
                }
            </Modal.Footer>
        </Modal>
    )

}
import React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion'
import { useTheme, IconButton, InputBase, Typography } from '@mui/material'
import { toast } from 'react-hot-toast'
import FlexBetween from 'components/FlexBetween'
import { Search } from '@mui/icons-material';
import { ThreeDots } from 'react-loader-spinner'
import { MdDelete, MdRemoveRedEye, MdEdit, MdRefresh } from 'react-icons/md'
import { NewModel } from 'components/Modal'
import { Input } from 'components/input/input'
import { Col, Container, Row, Table } from 'react-bootstrap'
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

const Vaults = () => {
    const theme = useTheme()
    const dispatch = useDispatch()

    // Add Vault
    const [showAddModal, setShowAddModal] = useState(false);
    const [vaultName, setVaultName] = useState(undefined);
    const [vaultDescription, setVaultDescription] = useState(undefined);

    const closeAddModal = () => {
        setShowAddModal(false)
        setVaultName(undefined)
        setVaultDescription(undefined)
    }

    const addVault = () => {

    }

    const renderAddNewVault = () => {
        return (
            <NewModel
                show={showAddModal}
                close={closeAddModal}
                handleClose={addVault}
                ModalTitle="Create New Vault">
                <Row>
                    <Col md={6}>
                        <Typography sx={{ color: theme.palette.primary[500] }} >
                            <Input
                                label="Vault Name"
                                value={vaultName}
                                placeholder={'Social Media'}
                                onChange={(e) => setVaultName(e.target.value)}
                            />
                        </Typography>
                    </Col>
                    <Col md={6}>
                        <Typography sx={{ color: theme.palette.primary[500] }} >
                            <Input
                                label="Description"
                                value={vaultDescription}
                                placeholder={'Description'}
                                onChange={(e) => setVaultDescription(e.target.value)}
                            />
                        </Typography>
                    </Col>

                </Row>

            </NewModel>
        )
    }
    return (
        <motion.div
            whileInView={{ opacity: [0, 1] }}
            transition={{ duration: .75, ease: 'easeInOut' }}
            initial={{ opacity: 0 }}

        >
            <Container>
                <Row>
                    <Col md={12}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', marginBottom: '50px' }} >
                            <Typography variant="h1" fontWeight="bold" sx={{ textAlign: 'center', color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >
                                Vaults
                            </Typography>

                            <motion.button
                                className='form-control' style={{ width: 'auto', margin: '0 10px', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', border: 'none', color: '#fff' }}
                                whileHover={{ scale: [1, 1.1] }}
                                onClick={() => setShowAddModal(true)}
                            >
                                Add Vault
                            </motion.button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', height: '2rem', alignItems: 'center' }}>
                                <IconButton >
                                    <MdRefresh />
                                </IconButton>
                                <Typography style={{ cursor: 'pointer' }} >Refresh</Typography>
                            </div>
                            <FlexBetween
                                backgroundColor={theme.palette.background.alt}
                                borderRadius="9px"
                                gap="3px"
                                padding="0.1rem 1.5rem"
                            >
                                <InputBase
                                    placeholder='Search...'
                                />
                                <IconButton>
                                    <Search />
                                </IconButton>
                            </FlexBetween>
                        </div>

                    </Col>
                </Row>
                <Row>
                    {/* <Col>
                        {
                            loading ?
                                <div style={{ height: '50vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ThreeDots
                                        height="80"
                                        width="80"
                                        radius="9"
                                        color={theme.palette.primary[200]}
                                        ariaLabel="three-dots-loading"
                                        wrapperStyle={{}}
                                        wrapperClassName=""
                                        visible={true}
                                    />
                                </div>
                                :
                                loginArray.length ?
                                    <motion.div
                                        whileInView={{ opacity: [0, 1] }}
                                        transition={{ duration: .75, ease: 'easeInOut' }}
                                        initial={{ opacity: 0 }}
                                    >
                                        {renderLoginsTable()}
                                    </motion.div>

                                    :
                                    <div style={{ height: '50vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography variant="h1" fontWeight="bold" sx={{ textAlign: 'center', color: theme.palette.secondary[400] }} >
                                            No Logins
                                        </Typography>
                                    </div>
                        }
                    </Col> */}
                </Row>
            </Container>
            {renderAddNewVault()}
        </motion.div>
    );
}

export default Vaults;
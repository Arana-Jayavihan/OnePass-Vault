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
import { AiFillEyeInvisible, AiFillEye } from 'react-icons/ai'
import { NewModel } from 'components/Modal'
import { Input } from 'components/input/input'
import { Col, Container, Row, Table } from 'react-bootstrap'
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { useParams } from 'react-router-dom';
import { getVaultData } from 'actions/vaultActions';

const UnlockedVault = () => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const email = useSelector(state => state.auth.user.email)
    const loading = useSelector(state => state.vault.loading)
    const vaultUnlockKey = useSelector(state => state.vault.vaultKey)
    const vault = useSelector(state => state.vault.vault)
    const unlockToken = useParams()

    useEffect(() => {
        if (loading === true) {
            toast.loading('Loading...', {
                id: 'Loading'
            })
        }
        else if (loading === false) {
            toast.dismiss('Loading')
        }

    }, [loading]);

    useEffect(() => {
        const form = {
            email: email,
            token: unlockToken.id
        }
        dispatch(getVaultData(form, vaultUnlockKey))
    }, [])
    return (
        <>
            {
                loading ?
                    <div style={{ height: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                    <motion.div
                        whileInView={{ opacity: [0, 1] }}
                        transition={{ duration: .75, ease: 'easeInOut' }}
                        initial={{ opacity: 0 }}
                        style={{ marginTop: '5rem', marginBottom: '2rem', paddingBottom: '2rem' }}
                    >
                        <Container>
                            <Row>
                                <Col md={12}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', marginBottom: '50px' }} >
                                        <Typography variant="h1" fontWeight="bold" sx={{ textAlign: 'center', color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >
                                            {vault?.vaultName}
                                        </Typography>

                                        <motion.button
                                            className='form-control' style={{ width: 'auto', margin: '0 10px', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', border: 'none', color: '#fff' }}
                                            whileHover={{ scale: [1, 1.1] }}

                                        >
                                            Add Login
                                        </motion.button>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', height: '2rem', alignItems: 'center' }}>
                                            <IconButton  >
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
                                <Col>
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
                                            null
                                    }
                                </Col>
                            </Row>
                        </Container>
                    </motion.div>
            }
        </>

    )
}

export default UnlockedVault
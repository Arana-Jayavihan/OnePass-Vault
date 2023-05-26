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
import { useParams, useNavigate } from 'react-router-dom';
import { getVaultData } from 'actions/vaultActions';

const UnlockedVault = () => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const navigate = useNavigate()
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
    let users = ['aranajayavihan@gmail.com', "fernandojanith266@gmail.com", "afanaj@mitesp.com"]
    useEffect(() => {
        const form = {
            email: email,
            token: unlockToken.id
        }
        dispatch(getVaultData(form, vaultUnlockKey)).then((result) => {
            // if (result === false){
            //     navigate('/vaults')
            // }
        })
    }, [])

    const renderLoginTable = () => {
        return (
            <Table striped style={{ fontSize: 14, alignItems: '' }} responsive>
                <thead>
                    <tr>
                        <th style={{ verticalAlign: 'baseline' }}>
                            <Typography fontWeight='bold' sx={{ color: theme.palette.primary[200] }}>
                                #
                            </Typography>
                        </th>
                        <th style={{ verticalAlign: 'baseline' }}>
                            <Typography fontWeight='bold' sx={{ color: theme.palette.primary[200] }}>
                                Name
                            </Typography>
                        </th>
                        <th style={{ verticalAlign: 'baseline' }}>
                            <Typography fontWeight='bold' sx={{ color: theme.palette.primary[200] }}>
                                Website
                            </Typography>
                        </th>
                        <th style={{ verticalAlign: 'baseline' }}>
                            <Typography fontWeight='bold' sx={{ color: theme.palette.primary[200] }}>
                                User Name
                            </Typography>
                        </th>
                        <th style={{ verticalAlign: 'baseline' }}>
                            <Typography fontWeight='bold' sx={{ color: theme.palette.primary[200] }}>
                                Password
                            </Typography>
                        </th>
                        <th style={{ verticalAlign: 'baseline' }}>
                            <Typography fontWeight='bold' sx={{ color: theme.palette.primary[200] }}>
                                Actions
                            </Typography>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {
                        vault?.vaultLogins?.map((login, index) => {
                            return (
                                <tr key={index}>
                                    <td style={{ verticalAlign: 'middle', lineHeight: 3 }}>
                                        <Typography sx={{ color: theme.palette.primary[200] }}>
                                            {index + 1}
                                        </Typography>
                                    </td>
                                    <td style={{ verticalAlign: 'middle', lineHeight: 3 }}>
                                        <Typography sx={{ color: theme.palette.primary[200] }}>
                                            {login.loginName}
                                        </Typography>
                                    </td>
                                    <td style={{ verticalAlign: 'middle', lineHeight: 3 }}>
                                        <Typography sx={{ color: theme.palette.primary[200] }}>
                                            {login.loginUrl}
                                        </Typography>
                                    </td>
                                    <td style={{ verticalAlign: 'middle', lineHeight: 3 }}>
                                        <Typography sx={{ color: theme.palette.primary[200] }}>
                                            {login.loginUsername}
                                        </Typography>
                                    </td>
                                    <td style={{ verticalAlign: 'middle', lineHeight: 3 }}>
                                        <Typography sx={{ color: theme.palette.primary[200] }}>
                                            {login.loginPassword}
                                        </Typography>
                                    </td>
                                    <td>
                                        {
                                            <div style={{ display: 'flex' }}>
                                                <Typography sx={{ color: theme.palette.primary[200], fontSize: '1rem' }}>
                                                    <IconButton  >
                                                        <MdRemoveRedEye style={{ color: theme.palette.secondary[300] }} />
                                                    </IconButton>
                                                </Typography>
                                                <Typography sx={{ color: theme.palette.primary[200], fontSize: '1rem' }}>
                                                    <IconButton  >
                                                        <MdEdit style={{ color: theme.palette.secondary[300] }} />
                                                    </IconButton>
                                                </Typography>
                                                <Typography sx={{ color: theme.palette.primary[200], fontSize: '1rem' }}>
                                                    <IconButton  >
                                                        <MdDelete style={{ color: theme.palette.secondary[300] }} />
                                                    </IconButton>
                                                </Typography>

                                            </div>
                                        }
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table>

        )
    }
    return (
        <Container>
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

                                    <Typography variant="h1" fontWeight="bold" sx={{ textAlign: 'left', color: 'transparent', width: 'fit-content', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >
                                        {vault?.vaultName}
                                    </Typography>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', marginBottom: '20px' }} >

                                        <Typography variant='h5' sx={{ textAlign: 'left', paddingTop: '.5rem', paddingLeft: '.5rem' }}>
                                            {vault?.description}
                                        </Typography>
                                        <motion.button
                                            className='form-control' style={{ width: 'auto', margin: '0 10px', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', border: 'none', color: '#fff' }}
                                            whileHover={{ scale: [1, 1.1] }}

                                        >
                                            Add Login
                                        </motion.button>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={3}
                                    style={{ backgroundColor: "transparent", borderRadius: '15px', padding: '1rem', height: "auto", overflowY: 'scroll' }}
                                >
                                    <div style={{ backgroundColor: "#343434", borderRadius: '15px', padding: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }} >
                                            <div style={{ backgroundColor: theme.palette.background.default, padding: '2rem 2.5rem', borderRadius: '15px' }}>
                                                <Typography variant='h5' sx={{ textAlign: 'center', margin: 0, marginBottom: '.5rem', padding: 0, }}>
                                                    Logins
                                                </Typography>
                                                <Typography variant="h1" fontWeight="bold" sx={{ textAlign: 'center', color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >
                                                    {vault?.numLogins}
                                                </Typography>
                                            </div>
                                            <div style={{ backgroundColor: theme.palette.background.default, padding: '2rem 2.5rem', borderRadius: '15px' }}>
                                                <Typography variant='h5' sx={{ textAlign: 'center', margin: 0, marginBottom: '.5rem', padding: 0, }}>
                                                    Users
                                                </Typography>
                                                <Typography variant="h1" fontWeight="bold" sx={{ textAlign: 'center', color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >
                                                    {vault?.numUsers}
                                                </Typography>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '2rem' }}>
                                            <Typography variant='h6' sx={{ textAlign: 'left', margin: 0, marginBottom: '.5rem', padding: 0, }}>
                                                Owner : aranajayavihan@gmail.com
                                            </Typography>
                                            <Typography variant='h6' sx={{ textAlign: 'left', margin: 0, marginBottom: '.5rem', padding: 0, }}>
                                                {`Users : \n\n`}
                                                {
                                                    users.map((user, index) => {
                                                        return (
                                                            <Typography key={index} variant='h6' sx={{ textAlign: 'left', margin: 0, padding: 0, paddingLeft: '1rem' }}>
                                                                {user}
                                                            </Typography>
                                                        )
                                                    })
                                                }
                                            </Typography>
                                        </div>
                                    </div>

                                </Col>
                                <Col md={9}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
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

                                    <Col md={12} style={{ overflowX: 'scroll' }}>
                                        {
                                            vault?.numLogins > 0 ?
                                                <motion.div
                                                    whileInView={{ opacity: [0, 1] }}
                                                    transition={{ duration: .75, ease: 'easeInOut' }}
                                                    initial={{ opacity: 0 }}
                                                >
                                                    {renderLoginTable()}
                                                </motion.div>
                                                :
                                                <div style={{ height: '50vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Typography variant="h1" fontWeight="bold" sx={{ textAlign: 'center', color: theme.palette.secondary[400] }} >
                                                        No Credentials
                                                    </Typography>
                                                </div>
                                        }
                                    </Col>
                                </Col>

                            </Row>
                        </Container>
                    </motion.div>
            }
        </Container>

    )
}

export default UnlockedVault
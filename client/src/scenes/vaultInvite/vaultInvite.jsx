import { acceptVaultInvitation, getVaultInvitationData } from 'actions/vaultActions'
import React from 'react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
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

const VaultInvite = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const token = useParams()
    const theme = useTheme()
    const loading = useSelector(state => state.vault.loading)
    const accepting = useSelector(state => state.vault.accepting)
    const inviteData = useSelector(state => state.vault.invite)
    const email = useSelector(state => state.auth.user.email)
    const [validInvite, setValidInvite] = useState(false);
    const form = {
        'token': token.token
    }
    useEffect(() => {
        dispatch(getVaultInvitationData(form))
        if (email === inviteData.addUserEmail) {
            setValidInvite(true)
        }
    }, []);

    useEffect(() => {
        if (email === inviteData.addUserEmail) {
            setValidInvite(true)
        }
    }, [inviteData]);

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
        if (accepting === true) {
            toast.loading('Accepting Invite...', {
                id: 'accepting'
            })
        }
        else if (accepting === false) {
            toast.dismiss('accepting')
        }

    }, [accepting]);

    // Accept Invite
    const [showAcceptInvite, setShowAcceptInvite] = useState(false);
    const [password, setPassword] = useState(undefined)
    const [showPassword, setShowPassword] = useState(false)
    const [passType, setPassType] = useState('password');

    const showPasswords = () => {
        if (passType === 'password') {
            setPassType('text')
            setShowPassword(true)
        }
        else {
            setPassType('password')
            setShowPassword(false)
        }
    }

    const closeAcceptInvite = () => {
        setShowAcceptInvite(false)
        setPassword(undefined)
        setPassType("password")
        setShowPassword(false)
    }

    const acceptInvite = () => {
        const form = {
            vaultIndex: inviteData.vaultIndex,
            encVaultKey: inviteData.encVaultKey,
            pass: password,
            email: email,
            token: token.token
        }
        dispatch(acceptVaultInvitation(form))
            .then((result) => {
                if (result === true) {
                    setShowAcceptInvite(false)
                    setPassword(undefined)
                    setPassType("password")
                    setShowPassword(false)
                    navigate(`/vaults`)
                }
            })
    }
    const renderAcceptInvite = () => {
        return (
            <NewModel
                show={showAcceptInvite}
                close={closeAcceptInvite}
                handleClose={acceptInvite}
                ModalTitle="Enter Password"
                size="sm"
                buttons={[
                    {
                        label: 'Unlock',
                        color: 'primary',
                        onClick: acceptInvite
                    }
                ]}
            >
                <Row>
                    <Col md={12} style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
                        <Typography sx={{ color: theme.palette.primary[500] }} >
                            <Input
                                label="Password"
                                value={password}
                                type={passType}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                        </Typography>
                        <IconButton sx={{ width: 'fit-content', height: 'fit-content', marginTop: '1rem' }} onClick={() => showPasswords()} >
                            {
                                showPassword ?
                                    <AiFillEye style={{ fontSize: '25px', color: theme.palette.secondary[400] }} />
                                    :
                                    <AiFillEyeInvisible style={{ fontSize: '25px', color: theme.palette.secondary[400] }} />
                            }
                        </IconButton>
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
            style={{ marginTop: '5rem', marginBottom: '2rem', paddingBottom: '2rem' }}
        >
            <Container>
                <Row style={{ display: 'flex', justifyContent: 'center' }}>
                    <Col md={12}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', marginBottom: '50px' }} >
                            <Typography variant="h1" fontWeight="bold" sx={{ textAlign: 'center', color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >
                                Vault Invitation
                            </Typography>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <Typography variant='h5'>
                                You have been invited to share access of the following vault.
                            </Typography>
                        </div>

                    </Col>
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
                            validInvite ?
                                <Col md={9}
                                    style={{ backgroundColor: theme.palette.primary[100], borderRadius: '15px', padding: '1rem', overflowY: 'scroll', display: 'flex', justifySelf: 'center', marginTop: '1rem' }}
                                >
                                    <Col md={7}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', marginBottom: '5px' }} >
                                            <Typography variant="h1" fontWeight="bold" sx={{ textAlign: 'center', color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >
                                                {inviteData?.vaultName}
                                            </Typography>
                                        </div>
                                        <div style={{ marginTop: '2rem' }}>
                                            <Typography variant='h5' sx={{ textAlign: 'left', margin: 0, marginBottom: '.5rem', padding: 0, color: theme.palette.primary[900] }}>
                                                {inviteData?.vaultDesc}
                                            </Typography>
                                        </div>
                                        <div>
                                            <motion.button
                                                className='form-control' style={{ width: 'auto', height: 'auto-fit', margin: '1.9rem 10px', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', border: 'none', color: '#fff' }}
                                                whileHover={{ scale: [1, 1.1] }}
                                                onClick={() => { setShowAcceptInvite(true) }}
                                            >
                                                Accept Invite
                                            </motion.button>
                                        </div>
                                    </Col>
                                    <Col md={5}>
                                        <div style={{ borderRadius: '15px', padding: '1rem', height: 'auto' }}>
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }} >
                                                <div style={{ backgroundColor: theme.palette.background.default, padding: '10% 12%', borderRadius: '15px' }}>
                                                    <Typography variant='h5' sx={{ textAlign: 'center', margin: 0, marginBottom: '.5rem', padding: 0, }}>
                                                        Logins
                                                    </Typography>
                                                    <Typography variant="h1" fontWeight="bold" sx={{ textAlign: 'center', color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >
                                                        {inviteData?.numLogins}
                                                    </Typography>
                                                </div>
                                                <div style={{ backgroundColor: theme.palette.background.default, padding: '10% 12%', borderRadius: '15px' }}>
                                                    <Typography variant='h5' sx={{ textAlign: 'center', margin: 0, marginBottom: '.5rem', padding: 0, }}>
                                                        Users
                                                    </Typography>
                                                    <Typography variant="h1" fontWeight="bold" sx={{ textAlign: 'center', color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >
                                                        {inviteData?.numUsers}
                                                    </Typography>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '2rem' }}>
                                                <Typography variant='h5' sx={{ textAlign: 'left', margin: 0, marginBottom: '.5rem', padding: 0, color: theme.palette.primary[900] }}>
                                                    Owner : {inviteData?.ownerEmail}
                                                </Typography>
                                            </div>
                                        </div>
                                    </Col>

                                </Col>
                                :
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom: '5px' }} >
                                    <Typography variant="h1" fontWeight="bold" sx={{ textAlign: 'center', color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >
                                        Sorry, This Invite is not for you!
                                    </Typography>
                                </div>
                    }

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
            {renderAcceptInvite()}
        </motion.div >
    )
}

export default VaultInvite
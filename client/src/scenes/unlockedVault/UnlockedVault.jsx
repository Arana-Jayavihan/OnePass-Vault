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
import { getVaultData, lockUserVault } from 'actions/vaultActions';
import { addUserLogin } from 'actions/loginActions';

const UnlockedVault = () => {
    

    const theme = useTheme()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const email = useSelector(state => state.auth.user.email)
    const loading = useSelector(state => state.vault.loading)
    const adding = useSelector(state => state.login.adding)
    const deleting = useSelector(state => state.login.deleting)
    const updating = useSelector(state => state.login.updating)
    const vaultUnlockKey = useSelector(state => state.vault.vaultKey)
    const logins = useSelector(state => state.login.logins)
    const vault = useSelector(state => state.vault.vault)
    const unlockToken = useParams()

    const [loginsList, setLoginsList] = useState([]);
    useEffect(() => {
        if (logins?.length === 0) {
            setLoginsList(vault?.vaultLogins)
        }
        else {
            setLoginsList(logins)
        }
    }, [logins])


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
        if (adding === true) {
            toast.loading('Adding...', {
                id: 'Adding'
            })
        }
        else if (adding === false) {
            toast.dismiss('Adding')
        }

    }, [adding]);
    useEffect(() => {
        if (deleting === true) {
            toast.loading('Removing...', {
                id: 'Removing'
            })
        }
        else if (deleting === false) {
            toast.dismiss('Removing')
        }

    }, [deleting]);
    useEffect(() => {
        if (updating === true) {
            toast.loading('Updating...', {
                id: 'Updating'
            })
        }
        else if (updating === false) {
            toast.dismiss('Updating')
        }

    }, [updating]);

    useEffect(() => {
        const form = {
            email: email,
            token: unlockToken.id
        }
        dispatch(getVaultData(form, vaultUnlockKey)).then((result) => {
            if (result === false) {
                setLoginsList([])
                navigate('/vaults')
            }
        })
    }, [])

    // Add new login
    const [showAddLogin, setShowAddLogin] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [loginName, setLoginName] = useState(undefined);
    const [loginUrl, setLoginUrl] = useState(undefined);
    const [loginUsername, setLoginUsername] = useState(undefined);
    const [loginPassword, setLoginPassword] = useState(undefined);
    const vaultKey = useSelector(state => state.vault.vaultKey)

    const [passType, setPassType] = useState('password')

    const showPasswords = () => {
        if (showPassword === false) {
            setPassType('text')
            setShowPassword(true)
        }
        else {
            setPassType('password')
            setShowPassword(false)
        }
    }

    const closeAddLogin = () => {
        setShowAddLogin(false)
        setLoginName(undefined)
        setLoginUrl(undefined)
        setLoginUsername(undefined)
        setLoginPassword(undefined)
    }

    const addLogin = () => {
        const form = {
            vaultIndex: vault?.vaultIndex,
            email: email,
            loginName: loginName,
            loginUrl: loginUrl,
            loginUsername: loginUsername,
            loginPassword: loginPassword,
            vaultKey: vaultKey
        }

        dispatch(addUserLogin(form)).then((result) => {
            console.log(result)
        })
        closeAddLogin()
    }

    const renderAddLoginModal = () => {
        return (
            <NewModel
                show={showAddLogin}
                close={closeAddLogin}
                handleClose={addLogin}
                ModalTitle="Enter Credential Details"
                size='md'>
                <Row>
                    <Col md={6}>
                        <Typography sx={{ color: theme.palette.primary[500] }} >
                            <Input
                                label="Name"
                                value={loginName}
                                placeholder={'Instagram'}
                                onChange={(e) => setLoginName(e.target.value)}
                            />
                        </Typography>
                    </Col>
                    <Col md={6}>
                        <Typography sx={{ color: theme.palette.primary[500] }} >
                            <Input
                                label="URL"
                                value={loginUrl}
                                placeholder={'www.instagram.com'}
                                onChange={(e) => setLoginUrl(e.target.value)}
                            />
                        </Typography>
                    </Col>
                    <Col md={6}>
                        <Typography sx={{ color: theme.palette.primary[500] }} >
                            <Input
                                label="Username"
                                value={loginUsername}
                                placeholder={'_.john_doe._'}
                                onChange={(e) => setLoginUsername(e.target.value)}
                            />
                        </Typography>
                    </Col>
                    <Col md={6} style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
                        <Typography sx={{ color: theme.palette.primary[500] }} >
                            <Input
                                label="Password"
                                value={loginPassword}
                                type={passType}
                                onChange={(e) => setLoginPassword(e.target.value)}
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
                        loginsList?.map((login, index) => {
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
                                            onClick={() => setShowAddLogin(true)}
                                        >
                                            Add Credential
                                        </motion.button>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={3}
                                    style={{ backgroundColor: "transparent", borderRadius: '15px', padding: '1rem', height: "60vh", overflowY: 'scroll' }}
                                >
                                    <div style={{ backgroundColor: theme.palette.primary[100], borderRadius: '15px', padding: '1rem', height: 'auto' }}>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }} >
                                            <div style={{ backgroundColor: theme.palette.background.default, padding: '2rem 2.5rem', borderRadius: '15px' }}>
                                                <Typography variant='h5' sx={{ textAlign: 'center', margin: 0, marginBottom: '.5rem', padding: 0, }}>
                                                    Logins
                                                </Typography>
                                                <Typography variant="h1" fontWeight="bold" sx={{ textAlign: 'center', color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >
                                                    {loginsList?.length}
                                                </Typography>
                                            </div>
                                            <div style={{ backgroundColor: theme.palette.background.default, padding: '2rem 2.5rem', borderRadius: '15px' }}>
                                                <Typography variant='h5' sx={{ textAlign: 'center', margin: 0, marginBottom: '.5rem', padding: 0, }}>
                                                    Users
                                                </Typography>
                                                <Typography variant="h1" fontWeight="bold" sx={{ textAlign: 'center', color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >
                                                    {vault?.vaultUsers?.length}
                                                </Typography>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '2rem' }}>
                                            <Typography variant='h6' sx={{ textAlign: 'left', margin: 0, marginBottom: '.5rem', padding: 0, color: theme.palette.primary[900] }}>
                                                Owner : {vault?.ownerEmail}
                                            </Typography>
                                            <Typography variant='h6' sx={{ textAlign: 'left', margin: 0, marginBottom: '.5rem', padding: 0, color: theme.palette.primary[900] }}>
                                                {`Assigned Users : \n\n`}
                                                {
                                                    vault?.vaultUsers?.map((user, index) => {
                                                        if (user?.userEmail !== vault?.ownerEmail) {
                                                            return (
                                                                <Typography key={index} variant='h6' sx={{ textAlign: 'left', margin: 0, padding: 0, paddingLeft: '1rem', color: theme.palette.primary[900] }}>
                                                                    {user?.userEmail}
                                                                </Typography>
                                                            )
                                                        }
                                                        if (vault?.vaultUsers?.length === 1) {
                                                            return (
                                                                <Typography key={index} variant='h6' sx={{ textAlign: 'left', margin: 0, padding: 0, paddingLeft: '1rem', color: theme.palette.primary[900] }}>
                                                                    No users assigned
                                                                </Typography>
                                                            )
                                                        }
                                                    })
                                                }
                                            </Typography>
                                        </div>
                                        <div style={{ display: "flex" }}>
                                            <Typography sx={{ color: theme.palette.primary[500] }} >
                                                <Input
                                                    label="Assign a user"
                                                    value={undefined}
                                                    placeholder={'Enter email'}

                                                />
                                            </Typography>
                                            <motion.button
                                                className='form-control' style={{ width: 'auto', height: 'fit-content', margin: '1.9rem 10px', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', border: 'none', color: '#fff' }}
                                                whileHover={{ scale: [1, 1.1] }}

                                            >
                                                Add
                                            </motion.button>
                                        </div>
                                    </div>

                                </Col>
                                <Col md={9}
                                    style={{ backgroundColor: "transparent", borderRadius: '15px', padding: '1rem', height: "60vh", overflowY: 'scroll' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem, 1rem' }}>

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
            {renderAddLoginModal()}
        </Container>

    )
}

export default UnlockedVault
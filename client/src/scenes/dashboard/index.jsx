import { addUserLogin, getAllUserLogins } from 'actions/loginActions';
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

const Dashboard = () => {
    const dispatch = useDispatch()
    const theme = useTheme()
    const mode = useSelector(state => state.general.mode)
    const user = useSelector(state => state.auth.user)
    const logins = useSelector(state => state.login.logins)
    const loading = useSelector(state => state.login.loading)
    const adding = useSelector(state => state.login.adding)
    const updating = useSelector(state => state.login.updating)
    const deleting = useSelector(state => state.login.deleting)

    // Initial Data Fetch
    const form = {
        email: user.email
    }
    // useEffect(() => {
    //     dispatch(getAllUserLogins(form))
    // }, [mode]);

    // Toasts
    useEffect(() => {
        if (adding === true) {
            toast.loading('Saving...', {
                id: 'adding'
            })
        }
        else if (adding === false) {
            toast.dismiss('adding')
        }

    }, [adding]);

    useEffect(() => {
        if (loading === true) {
            toast.loading('Processing...', {
                id: 'loading'
            })
        }
        else if (loading === false) {
            toast.dismiss('loading')
        }

    }, [loading]);

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
        if (deleting === true) {
            toast.loading('Deleting...', {
                id: 'Deleting'
            })
        }
        else if (deleting === false) {
            toast.dismiss('Deleting')
        }

    }, [deleting]);

    // Handle Pages
    const [loginArray, setLoginArray] = useState([]);
    const [page, setPage] = useState(1);
    const handleChange = (e, v) => {
        setPage(v)
    }

    useEffect(() => {
        if (page === 1) {
            if (logins.length < 11) {
                const logArr = logins.slice(0, logins.length)
                setLoginArray(logArr)
            }
            else {
                const logArr = logins.slice(0, 10)
                setLoginArray(logArr)
            }

        }
        else {
            if ((page - 1) * 10 + 10 > logins.length) {
                const logArr = logins.slice((page - 1) * 10, logins.length)
                setLoginArray(logArr)
            }
            {
                const logArr = logins.slice((page - 1) * 10, (page - 1) * 10 + 10)
                setLoginArray(logArr)
            }

        }
    }, [page, logins]);

    // Handle Search
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        if (searchText !== '') {
            const resultsArray = logins.filter(login =>
                login.name.toLowerCase().includes(searchText) ||
                login.website.toLowerCase().includes(searchText)
            )
            setLoginArray(resultsArray.slice(0, 9))
        }
        if (searchText === '' && searchText.length === 0) {
            setLoginArray(logins)
        }
    }, [searchText]);

    // Add Logins
    const [name, setName] = useState(undefined);
    const [website, setWebsite] = useState(undefined);
    const [userName, setUserName] = useState(undefined);
    const [password, setPassword] = useState(undefined);
    const [confirmPassword, setConfirmPassword] = useState(undefined);
    const [showAddModal, setShowAddModal] = useState(false);

    const closeAddModal = () => {
        setShowAddModal(false)
        setName(undefined)
        setWebsite(undefined)
        setUserName(undefined)
        setPassword(undefined)
        setConfirmPassword(undefined)
    }

    const addLogin = () => {
        if (password === confirmPassword) {
            const form = {
                'email': user.email,
                name,
                website,
                userName,
                password
            }
            dispatch(addUserLogin(form))
            setShowAddModal(false)
            setName(undefined)
            setWebsite(undefined)
            setUserName(undefined)
            setPassword(undefined)
            setConfirmPassword(undefined)
        }
        else {
            toast.error("Passwords Mismatch")
        }
    }

    const renderAddLoginModal = () => {
        return (
            <NewModel
                show={showAddModal}
                close={closeAddModal}
                handleClose={addLogin}
                ModalTitle="Add New Login">
                <Typography sx={{ color: theme.palette.primary[500] }} >
                    <Input
                        label="Login Name"
                        value={name}
                        placeholder={'Login Name'}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Typography>
                <Typography sx={{ color: theme.palette.primary[500] }} >
                    <Input
                        label="Website"
                        value={website}
                        placeholder={'Website'}
                        onChange={(e) => setWebsite(e.target.value)}
                    />
                </Typography>
                <Typography sx={{ color: theme.palette.primary[500] }} >
                    <Input
                        label="User Name"
                        value={userName}
                        placeholder={'User Name'}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                </Typography>
                <Typography sx={{ color: theme.palette.primary[500] }} >
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        placeholder={'Password'}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Typography>
                <Typography sx={{ color: theme.palette.primary[500] }} >
                    <Input
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        placeholder={'Confirm Password'}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </Typography>
            </NewModel>
        )
    }

    // Table of Logins
    const renderLoginsTable = () => {
        return (
            <>
                <Table striped style={{ fontSize: 14, alignItems: '' }} responsive="lg">
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
                            loginArray.length > 0 ?
                                loginArray.map((login, index) =>
                                    <tr key={index}>
                                        <td>
                                            <Typography sx={{ color: theme.palette.primary[200] }}>
                                                {index + 1}
                                            </Typography>
                                        </td>
                                        <td>
                                            <Typography sx={{ color: theme.palette.primary[200] }}>
                                                {login.name}
                                            </Typography>
                                        </td>
                                        <td>
                                            <Typography sx={{ color: theme.palette.primary[200] }}>
                                                {login.website}
                                            </Typography>
                                        </td>
                                        <td>
                                            <Typography sx={{ color: theme.palette.primary[200] }}>
                                                {login.userName}
                                            </Typography>
                                        </td>
                                        <td>
                                            <Typography sx={{ color: theme.palette.primary[200] }}>
                                                {login.password}
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
                                :
                                null
                        }

                    </tbody>
                </Table>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingBottom: '1rem' }} >
                    <Stack spacing={2} >
                        <Pagination count={Math.ceil(logins.length / 10)} color="secondary" page={page} onChange={handleChange} />
                    </Stack>
                </div>
            </>
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
                            <Typography variant="h1" fontWeight="bold" sx={{ textAlign: 'center', color: theme.palette.secondary[400] }} >
                                Manage Logins
                            </Typography>

                            <motion.button
                                className='form-control' style={{ width: 'auto', margin: '0 10px', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', border: 'none', color: '#fff', "&hover": { background: '#fff' } }}
                                whileHover={{ scale: [1, 1.1] }}
                            >
                                Add Vault
                            </motion.button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', height: '2rem', alignItems: 'center' }}>
                                <IconButton onClick={() => dispatch(getAllUserLogins(form))}>
                                    <MdRefresh />
                                </IconButton>
                                <Typography onClick={() => dispatch(getAllUserLogins(form))} style={{ cursor: 'pointer' }} >Refresh</Typography>
                            </div>
                            <FlexBetween
                                backgroundColor={theme.palette.background.alt}
                                borderRadius="9px"
                                gap="3px"
                                padding="0.1rem 1.5rem"
                            >
                                <InputBase
                                    placeholder='Search...'
                                    onChange={(e) => setSearchText(e.target.value.toLowerCase())}
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
                    </Col>
                </Row>
            </Container>
            {renderAddLoginModal()}
        </motion.div>
    );
}

export default Dashboard;

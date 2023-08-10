import React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion'
import { useTheme, IconButton, InputBase, Typography, useMediaQuery } from '@mui/material'
import { toast } from 'react-hot-toast'
import { Search } from '@mui/icons-material';
import { ThreeDots } from 'react-loader-spinner'
import { MdDelete, MdRemoveRedEye, MdFileCopy, MdOutlineDone } from 'react-icons/md'
import { AiFillEyeInvisible, AiFillEye } from 'react-icons/ai'
import { RiSendPlaneFill } from 'react-icons/ri'
import { Col, Container, Row, Table } from 'react-bootstrap'
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip'

import { addVaultUser, getVaultData, lockUserVault } from "../../actions/vaultActions";
import { addUserLogin } from '../../actions/loginActions';
import FlexBetween from '../../components/FlexBetween'
import { NewModel } from '../../components/Modal/index'
import { Input } from '../../components/input/input'

const UnlockedVault = () => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const isNonMobile = useMediaQuery("(min-width: 600px)");
    const email = useSelector(state => state.auth.user.email)
    const loading = useSelector(state => state.vault.loading)
    const adding = useSelector(state => state.vault.adding)
    const deleting = useSelector(state => state.vault.deleting)
    const updating = useSelector(state => state.vault.updating)
    const vaultUnlockKey = useSelector(state => state.vault.vaultKey)
    const vault = useSelector(state => state.vault.vault)
    const vaultLogins = useSelector(state => state.vault.vault.vaultLogins)
    const [loginList, setLoginList] = useState([]);
    const [searchList, setSearchList] = useState([]);
    const [renderList, setRenderList] = useState([]);

    // Search
    const [tableRows, setTableRows] = useState(5);
    const [searchText, setSearchText] = useState('');
    useEffect(() => {
        if (searchText !== '') {
            const resultsArray = vaultLogins?.filter(login =>
                login.loginName.toLowerCase().includes(searchText) ||
                login.loginUrl.toLowerCase().includes(searchText) ||
                login.loginUsername.toLowerCase().includes(searchText)
            )
            setSearchList(resultsArray.slice(0, tableRows))
        }
        if (searchText === '' && searchText.length === 0) {
            setSearchList([])
        }
    }, [searchText])

    // Pagination
    const [page, setPage] = useState(1);
    const handleChange = (e, v) => {
        setPage(v)
    }
    useEffect(() => {
        if (page === 1 && page > 0) {
            if (vaultLogins?.length <= tableRows) {
                const loginArr = vaultLogins?.slice(0, vaultLogins?.length)
                setLoginList(loginArr)
            }
            else {
                const loginArr = vaultLogins?.slice(0, tableRows)
                setLoginList(loginArr)
            }

        }
        else {
            if ((page - 1) * tableRows + tableRows > vaultLogins?.length) {
                const loginArr = vaultLogins?.slice((page - 1) * tableRows, vaultLogins?.length)
                setLoginList(loginArr)
            }
            else {
                const loginArr = vaultLogins?.slice((page - 1) * tableRows, (page - 1) * tableRows + tableRows)
                setLoginList(loginArr)
            }

        }
    }, [page, vaultLogins]);

    useEffect(() => {
        if (searchList.length > 0) {
            setRenderList(searchList)
        }
        else {
            setRenderList(loginList)
        }
    }, [searchList, loginList]);

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
            email: email
        }
        dispatch(getVaultData(form, vaultUnlockKey)).then((result) => {
            if (result === false) {
                dispatch(lockUserVault())
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
    const [addUserEmail, setAddUserEmail] = useState(undefined);
    const vaultKey = useSelector(state => state.vault.vaultKey)

    const [passType, setPassType] = useState('password')
    const [customFields, setCustomFields] = useState([]);
    const [customFieldSize, setCustomFieldSize] = useState(0);
    const [renderCustomFields, setRenderCustomFields] = useState([]);

    let tempField = ""
    let tempValue = ""

    const handleFieldNameChange = (e) => {
        tempField = e.target.value
    }

    const handleFieldValueChange = (e) => {
        tempValue = e.target.value
    }

    const handleTickClick = (customFieldSize) => {
        if (tempField === "" || tempValue === "") {
            toast.error('Please fill out all fields', { id: 'customFieldError' })
        }
        else {
            const tempFiledObject = {
                name: tempField,
                value: tempValue
            }
            toast.success("Custom Field Added", { id: "cas" })
            customFields[customFieldSize] = tempFiledObject
            console.log(customFields)
            tempField = ""
            tempValue = ""
        }
    }

    const handleAddCustomFieldButtonClick = () => {
        if (customFieldSize === 0) {
            if (customFieldSize < 2) {
                const template = <Row style={{ marginTop: isNonMobile ? null : '1rem' }}>
                    <Col md={5}>
                        <Typography sx={{ color: theme.palette.primary[500] }}>
                            <Input
                                label="Custom Field Name"
                                onChange={(e) => handleFieldNameChange(e)}
                            />
                        </Typography>
                    </Col>
                    <Col md={5}>
                        <Typography sx={{ color: theme.palette.primary[500] }}>
                            <Input
                                label="Custom Field Value"
                                onChange={(e) => handleFieldValueChange(e)}
                            />
                        </Typography>
                    </Col>
                    <Col md={2} style={{ height: '5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <IconButton onClick={() => handleTickClick(customFieldSize)}>
                            <MdOutlineDone style={{ color: theme.palette.primary[500] }} />
                        </IconButton>
                    </Col>
                </Row>
                setRenderCustomFields([...renderCustomFields, template])
                setCustomFieldSize(customFieldSize + 1)
            }
            else {
                toast.error('Maximum 2 custom fields are allowed')
            }
        }
        else if (customFieldSize > 0 && customFields[customFieldSize - 1]) {
            if (customFieldSize < 2) {
                const template = <Row style={{ marginTop: isNonMobile ? null : '1rem' }}>
                    <Col md={5}>
                        <Typography sx={{ color: theme.palette.primary[500] }}>
                            <Input
                                label="Custom Field Name"
                                onChange={(e) => handleFieldNameChange(e)}
                            />
                        </Typography>
                    </Col>
                    <Col md={5}>
                        <Typography sx={{ color: theme.palette.primary[500] }}>
                            <Input
                                label="Custom Field Value"
                                onChange={(e) => handleFieldValueChange(e)}
                            />
                        </Typography>
                    </Col>
                    <Col md={2} style={{ height: '5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <IconButton onClick={() => handleTickClick(customFieldSize)}>
                            <MdOutlineDone style={{ color: theme.palette.primary[500] }} />
                        </IconButton>
                    </Col>
                </Row>
                setRenderCustomFields([...renderCustomFields, template])
                setCustomFieldSize(customFieldSize + 1)
            }
            else {
                toast.error('Maximum 2 custom fields are allowed')
            }
        }
        else {
            toast.error("Fill the current custom field first...")
        }
    }

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
        setCustomFields([])
        setCustomFieldSize(0)
        setRenderCustomFields([])
    }

    const addLogin = () => {
        if (
            (loginName !== undefined || loginName !== "") &&
            (loginUrl !== undefined || loginUrl !== "") &&
            (loginUsername !== undefined || loginUsername !== "") &&
            (loginPassword !== undefined || loginPassword !== "")
        ) {
            const form = {
                vaultIndex: vault?.vaultIndex,
                email: email,
                loginName: loginName,
                loginUrl: loginUrl,
                loginUsername: loginUsername,
                loginPassword: loginPassword,
                vaultKey: vaultKey,
                customFields
            }

            dispatch(addUserLogin(form)).then((result) => {
                console.log(result)
            })
            closeAddLogin()
        }
        else {
            toast.error("Please fill all the fields...", { id: "nae" })
        }
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
                    <Col md={6} style={{ display: 'flex', justifyContent: isNonMobile ? 'space-between' : null, alignItems: "center" }}>
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
                <Row style={{ marginTop: "1rem", marginBottom: '1rem' }}>
                    {
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }} >
                                <Col md={6}>
                                    <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.secondary[600], marginBottom: '.5rem' }}>
                                        Custom Fields
                                    </Typography>
                                </Col>
                                <Col md={6} style={{ display: 'flex', justifyContent: isNonMobile ? 'right' : 'left' }}>
                                    <motion.button
                                        className='form-control' style={{ width: 'auto', margin: '0 10px', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', border: 'none', color: '#fff' }}
                                        whileHover={{ scale: [1, 1.1] }}
                                        onClick={() => handleAddCustomFieldButtonClick()}
                                    >
                                        Add Custom Field
                                    </motion.button>
                                </Col>
                            </div>
                            {
                                renderCustomFields.length > 0 ? renderCustomFields : <Row>
                                    <Col md={12}>
                                        <Typography sx={{ color: theme.palette.primary[500], textAlign: 'center' }} >
                                            No Custom Fields Added
                                        </Typography>
                                    </Col>
                                </Row>
                            }
                        </>
                    }
                </Row>
            </NewModel>
        )
    }

    // Add Vault User 

    const addUser = () => {
        if (addUserEmail !== undefined) {
            console.log(addUserEmail)
            let form = {
                'email': email,
                'addUserEmail': addUserEmail,
                'vaultIndex': vault.vaultIndex,
                'vaultKey': vaultUnlockKey
            }
            dispatch(addVaultUser(form))
            form = {}
        }
        else {
            console.log(addUserEmail)
            toast.error("Please enter an email...", { id: "nae" })
        }
    }

    // render login details
    const [showLoginDetailsModal, setShowLoginDetailsModal] = useState(false);
    const [selectedLogin, setSelectedLogin] = useState(undefined);

    const closeLoginDetailsModal = () => {
        setSelectedLogin(undefined)
        setShowLoginDetailsModal(false)
    }

    const openLoginDetailsModal = (login) => {
        setSelectedLogin(login)
        setShowLoginDetailsModal(true)
    }

    const renderLoginDetailsModal = () => {
        return (
            <NewModel
                show={showLoginDetailsModal}
                close={closeLoginDetailsModal}
                ModalTitle={`Login Details - ${selectedLogin?.loginName}`}
                size='md'
                buttons={[
                    {
                        label: 'Close',
                        color: 'secondary',
                        onClick: closeLoginDetailsModal
                    }
                ]}
            >
                <Row>
                    <Col md={6}>
                        <Typography sx={{ color: theme.palette.primary[600] }}>
                            <label className='key' style={{ fontWeight: 'bold' }} >Name</label>
                        </Typography>
                        <Typography sx={{ color: theme.palette.primary[300] }}>
                            <p className='value'>{selectedLogin?.loginName}</p>
                        </Typography>
                    </Col>
                    <Col md={6}>
                        <Typography sx={{ color: theme.palette.primary[600] }}>
                            <label className='key' style={{ fontWeight: 'bold' }} >Website</label>
                        </Typography>
                        <Typography sx={{ color: theme.palette.primary[300] }}>
                            <p className='value'>{selectedLogin?.loginUrl}</p>
                        </Typography>
                    </Col>
                    <Col md={6}>
                        <Typography sx={{ color: theme.palette.primary[600] }}>
                            <label className='key' style={{ fontWeight: 'bold' }} >Username</label>
                        </Typography>
                        <Typography sx={{ color: theme.palette.primary[300] }}>
                            <p className='value'>{selectedLogin?.loginUsername}</p>
                        </Typography>
                    </Col>
                    <Col md={6} style={{ display: 'flex', justifyContent: isNonMobile ? 'space-between' : null, alignItems: "center" }}>
                        <Typography sx={{ color: theme.palette.primary[600] }} >
                            <label style={{ fontWeight: 'bold' }} >Password</label>
                            <Input
                                value={selectedLogin?.loginPassword}
                                type={passType}
                                disabled
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
                <Row style={{ marginTop: "1rem", marginBottom: '1rem' }}>
                    {
                        <>
                            <Row>
                                <Col md={12}>
                                    <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.secondary[600], marginBottom: '.5rem' }}>
                                        Custom Fields
                                    </Typography>
                                </Col>
                            </Row>
                            {
                                selectedLogin?.customFields?.length > 0 ?
                                    selectedLogin?.customFields.map((field, index) =>
                                        <Col md={6} key={index}>
                                            <Typography sx={{ color: theme.palette.primary[600] }}>
                                                <label className='key' style={{ fontWeight: 'bold' }} >{field.name}</label>
                                            </Typography>
                                            <Typography sx={{ color: theme.palette.primary[300] }}>
                                                <p className='value'>{field.value}</p>
                                            </Typography>
                                        </Col>
                                    )
                                    :
                                    <Typography sx={{ color: theme.palette.primary[300] }}>
                                        <p className='value'>No Custom Fields</p>
                                    </Typography>
                            }
                        </>
                    }
                </Row>
            </NewModel>
        )
    }

    const renderLoginTable = () => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Table striped style={{ fontSize: 14, alignItems: '', height: '100%' }} responsive>
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
                                    Actions
                                </Typography>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            renderList?.map((login, index) => {
                                return (
                                    <tr key={index}>
                                        <td style={{ verticalAlign: 'middle' }}>
                                            <Typography sx={{ color: theme.palette.primary[200] }}>
                                                {index + 1}
                                            </Typography>
                                        </td>
                                        <td style={{ verticalAlign: 'middle' }}>
                                            <Typography sx={{ color: theme.palette.primary[200] }}>
                                                {login.loginName}
                                            </Typography>
                                        </td>
                                        <td style={{ verticalAlign: 'middle' }}>
                                            <Typography
                                                sx={{ color: theme.palette.primary[200], cursor: 'pointer' }}
                                                onClick={() => window.open(`https://${login.loginUrl}`, '_blank')}
                                            >
                                                {login.loginUrl}
                                            </Typography>
                                        </td>
                                        <td style={{ verticalAlign: 'middle' }}>
                                            <Tooltip
                                                style={{ zIndex: 200, backgroundColor: theme.palette.primary[300] }}
                                                id='copy-user' />

                                            <Typography
                                                sx={{ color: theme.palette.primary[200], cursor: 'pointer', width: 'max-content' }}>
                                                {login.loginUsername}
                                                <span><IconButton
                                                    data-tooltip-id='copy-user'
                                                    data-tooltip-content='Copy Username'
                                                    data-tooltip-place='bottom'
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(login.loginUsername)
                                                        toast.success('Username Copied to Clipboard')
                                                    }}>
                                                    <MdFileCopy style={{ color: theme.palette.secondary[300] }} />
                                                </IconButton>
                                                </span>
                                            </Typography>
                                        </td>
                                        <td>
                                            {
                                                <div style={{ display: 'flex', width: 'max-content' }}>
                                                    <Tooltip
                                                        style={{ zIndex: 200, backgroundColor: theme.palette.primary[300] }}
                                                        id='copy-pass' />
                                                    <Typography
                                                        sx={{ color: theme.palette.primary[200], fontSize: '1rem' }}>
                                                        <IconButton
                                                            data-tooltip-id='copy-pass'
                                                            data-tooltip-content='Copy Password'
                                                            data-tooltip-place='bottom'
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(login.loginPassword)
                                                                toast.success('Password Copied to Clipboard')
                                                            }}>
                                                            <MdFileCopy style={{ color: theme.palette.secondary[300] }} />
                                                        </IconButton>
                                                    </Typography>
                                                    <Typography sx={{ color: theme.palette.primary[200], fontSize: '1rem' }}>
                                                        <IconButton
                                                            onClick={() => openLoginDetailsModal(login)}
                                                        >
                                                            <MdRemoveRedEye style={{ color: theme.palette.secondary[300] }} />
                                                        </IconButton>
                                                    </Typography>
                                                    <Typography sx={{ color: theme.palette.primary[200], fontSize: '1rem' }}>
                                                        <IconButton  >
                                                            <RiSendPlaneFill style={{ color: theme.palette.secondary[300] }} />
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
                {
                    searchList.length > 0 ?
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingBottom: '1rem' }} >
                            <Stack spacing={2} >
                                <Pagination count={Math.ceil(searchList?.length / tableRows)} color="secondary" page={page} onChange={handleChange} />
                            </Stack>
                        </div>
                        :
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingBottom: '1rem' }} >
                            <Stack spacing={2} >
                                <Pagination count={Math.ceil(vaultLogins?.length / tableRows)} color="secondary" page={page} onChange={handleChange} />
                            </Stack>
                        </div>
                }

            </div>
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
                                            Add Credentials
                                        </motion.button>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={3}
                                    style={{ backgroundColor: "transparent", borderRadius: '15px', padding: '1rem', height: isNonMobile ? "75vh" : 'max-content', overflowY: 'scroll' }}
                                >
                                    <div style={{ backgroundColor: theme.palette.primary[100], borderRadius: '15px', padding: '1rem', height: '80%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }} >
                                                <div style={{ backgroundColor: theme.palette.background.default, padding: isNonMobile ? '10% 12%' : '12% 15%', borderRadius: '15px' }}>
                                                    <Typography variant='h5' sx={{ textAlign: 'center', margin: 0, marginBottom: '.5rem', padding: 0, }}>
                                                        Logins
                                                    </Typography>
                                                    <Typography variant="h1" fontWeight="bold" sx={{ textAlign: 'center', color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >
                                                        {vault?.vaultLogins?.length}
                                                    </Typography>
                                                </div>
                                                <div style={{ backgroundColor: theme.palette.background.default, padding: isNonMobile ? '10% 12%' : '12% 15%', borderRadius: '15px' }}>
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
                                        </div>
                                        <div style={{ display: "flex" }}>
                                            <Typography sx={{ fontWeight: 'bold', color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >
                                                <Input
                                                    label="Assign a user"
                                                    value={addUserEmail}
                                                    placeholder={'Enter email'}
                                                    onChange={(e) => {
                                                        setAddUserEmail(e.target.value)
                                                    }
                                                    }
                                                />
                                            </Typography>
                                            <motion.button
                                                className='form-control' style={{ width: 'auto', height: 'fit-content', margin: '1.9rem 10px', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', border: 'none', color: '#fff' }}
                                                whileHover={{ scale: [1, 1.1] }}
                                                onClick={() => addUser()}
                                            >
                                                Add
                                            </motion.button>
                                        </div>
                                    </div>

                                </Col>
                                <Col md={9}
                                    style={{ backgroundColor: "transparent", borderRadius: '15px', padding: '1rem' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem, 1rem' }}>

                                        <FlexBetween
                                            backgroundColor={theme.palette.background.alt}
                                            borderRadius="9px"
                                            gap="3px"
                                            padding={isNonMobile ? "0.1rem 1.5rem" : null}
                                            paddingLeft={isNonMobile ? null : "1rem"}
                                        >
                                            <InputBase
                                                placeholder='Search...'
                                                value={searchText}
                                                onChange={(e) => { setSearchText((e.target.value).toLowerCase()) }}
                                            />
                                            <IconButton>
                                                <Search />
                                            </IconButton>
                                        </FlexBetween>
                                    </div>

                                    <Col md={12} style={{ overflowX: 'scroll', height: isNonMobile ? "65vh" : 'max-content', overflowY: 'scroll' }}>
                                        {
                                            loginList?.length > 0 ?
                                                <motion.div
                                                    whileInView={{ opacity: [0, 1] }}
                                                    transition={{ duration: .75, ease: 'easeInOut' }}
                                                    initial={{ opacity: 0 }}
                                                >
                                                    {renderLoginTable()}
                                                </motion.div>
                                                :
                                                <div style={{ height: '50vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Typography variant="h1" fontWeight="bold" sx={{ textAlign: 'center', color: 'transparent', backgroundImage: 'linear-gradient(to left, #6d4aff, #cc00ee)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >
                                                        No Credentials
                                                    </Typography>
                                                    <Typography variant='h5' sx={{ textAlign: 'center', paddingTop: '.5rem', paddingLeft: '.5rem' }}>
                                                        Add some credentials to your vault.
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
            {renderLoginDetailsModal()}
        </Container>

    )
}

export default UnlockedVault
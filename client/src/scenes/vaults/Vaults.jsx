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
import Vault from 'components/Vault/Vault';
import { addUserVault, getUserAssignedVaults, unlockUserVault } from 'actions/vaultActions';
import "../../components/Vault/vault.css"
import { useNavigate } from 'react-router-dom';

const Vaults = () => {
    const navigate = useNavigate()
    const vaultArr = useSelector(state => state.vault.vaults)
    const loading = useSelector(state => state.vault.loading)
    const creating = useSelector(state => state.vault.creating)
    const deleting = useSelector(state => state.vault.deleting)
    const unlocking = useSelector(state => state.vault.unlocking)
    const updating = useSelector(state => state.vault.updating)
    const email = useSelector(state => state.auth.user.email)
    const publicKey = useSelector(state => state.auth.user.pubKey)
    useEffect(() => {
        if (unlocking === true) {
            toast.loading('Unlocking...', {
                id: 'Unlocking'
            })
        }
        else if (unlocking === false) {
            toast.dismiss('Unlocking')
        }

    }, [unlocking]);
    useEffect(() => {
        if (creating === true) {
            toast.loading('Creating...', {
                id: 'Creating'
            })
        }
        else if (creating === false) {
            toast.dismiss('Creating')
        }

    }, [creating]);
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
        if (updating === true) {
            toast.loading('Updating...', {
                id: 'Updating'
            })
        }
        else if (updating === false) {
            toast.dismiss('Updating')
        }

    }, [updating]);

    const form = {
        'email': email
    }
    const theme = useTheme()
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getUserAssignedVaults(form))
    }, []);

    // Vault Grid
    const renderVaultGrid = () => {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', alignItems: 'center', justifyContent: 'center', gridGap: '2rem', paddingTop: '1rem' }}>
                {
                    vaultArr && vaultArr.length > 0 ?
                        vaultArr.map((vault, index) => (
                            vault.vaultName !== '' ?
                            <div key={index}>
                                <Vault key={index} >
                                    <div style={{ display: 'flex', flexDirection: 'column', margin: '1rem', alignSelf: 'center' }} >
                                        <Typography variant="h2" fontWeight="bold" sx={{ textAlign: 'left', color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >
                                            {vault.vaultName}
                                        </Typography>
                                        <p className="subtitle">
                                            {vault.desctiption}
                                        </p>
                                    </div>
                                    <div className='padlockOverlay'>
                                    <motion.button
                                        className='form-control' style={{ alignSelf: 'center', padding: '.5rem 2rem', width: 'fit-content', height: 'fit-content', margin: '0 10px', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', border: 'none', color: '#fff', opacity: '1' }}
                                        whileHover={{ scale: [1, 1.1] }}
                                        onClick={() => renderShowUnlockModal(vault)}
                                    >
                                        Unlock
                                    </motion.button>
                                    </div>
                                    
                                </Vault>

                            </div>
                            :
                            null
                        )) :
                        <div style={{ height: '50vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h1" fontWeight="bold" sx={{ textAlign: 'center', color: theme.palette.secondary[400] }} >
                                No Vaults
                            </Typography>
                        </div>
                }
            </div>
        )
    }

    // Add Vault
    const [showAddModal, setShowAddModal] = useState(false);
    const [vaultName, setVaultName] = useState(undefined);
    const [vaultDescription, setVaultDescription] = useState(undefined);

    const closeAddModal = () => {
        setShowAddModal(false)
        setVaultName(undefined)
        setVaultDescription(undefined)
        setPassword(undefined)
    }

    const addVault = () => {
        const form = {
            email: email,
            vName: vaultName,
            vDesc: vaultDescription,
            publicKey: publicKey,
            pass: password
        }
        dispatch(addUserVault(form))
        setShowAddModal(false)
        setVaultDescription(undefined)
        setVaultName(undefined)
        setPassword(undefined)
        setPassType('password')
    }

    const renderAddNewVault = () => {
        return (
            <NewModel
                show={showAddModal}
                close={closeAddModal}
                handleClose={addVault}
                ModalTitle="Create New Vault"
                size='sm'>
                <Row>
                    <Col md={12}>
                        <Typography sx={{ color: theme.palette.primary[500] }} >
                            <Input
                                label="Vault Name"
                                value={vaultName}
                                placeholder={'Social Media'}
                                onChange={(e) => setVaultName(e.target.value)}
                            />
                        </Typography>
                    </Col>
                    <Col md={12}>
                        <Typography sx={{ color: theme.palette.primary[500] }} >
                            <Input
                                label="Description"
                                value={vaultDescription}
                                placeholder={'Description'}
                                onChange={(e) => setVaultDescription(e.target.value)}
                            />
                        </Typography>
                    </Col>
                    <Col md={12} style={{display: 'flex', justifyContent: 'space-between', alignItems: "center"}}>
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

    // Unlock Vault
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [password, setPassword] = useState(undefined)
    const [showPassword, setShowPassword] = useState(false)
    const [passType, setPassType] = useState('password');
    const [selectedVault, setSelectedVault] = useState(undefined)

    const renderShowUnlockModal = (vault) => {
        setShowUnlockModal(true)
        setSelectedVault(vault)
    }
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

    const closeUnlockModal = () => {
        setShowUnlockModal(false)
        setPassword(undefined)
        setPassType("password")
        setShowPassword(false)
    }

    const unlockVault = () => {
        const form = {
            vaultIndex: selectedVault.vaultIndex,
            pass: password,
            email: email
        }
        dispatch(unlockUserVault(form))
        .then((result) => {
            if (result.status === true) {
                setShowUnlockModal(false)
                setPassword(undefined)
                setPassType("password")
                setShowPassword(false)
                console.log(result.vaultUnlockToken)
                navigate(`/vault/${result.vaultUnlockToken}`)
            }
        })
    }
    const renderUnlockVault = () => {
        return (
            <NewModel
                show={showUnlockModal}
                close={closeUnlockModal}
                handleClose={unlockVault}
                ModalTitle="Enter Password"
                size="sm"
                buttons={[
                    {
                        label: 'Unlock',
                        color: 'primary',
                        onClick: unlockVault
                    }
                ]}
                >
                <Row>
                    <Col md={12} style={{display: 'flex', justifyContent: 'space-between', alignItems: "center"}}>
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

    // const renderUnlockedVault = ()
    return (
        <motion.div
            whileInView={{ opacity: [0, 1] }}
            transition={{ duration: .75, ease: 'easeInOut' }}
            initial={{ opacity: 0 }}
            style={{marginTop: '5rem', marginBottom: '2rem', paddingBottom: '2rem'}}
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
                                <IconButton onClick={() => dispatch(getUserAssignedVaults(form))} >
                                    <MdRefresh />
                                </IconButton>
                                <Typography style={{ cursor: 'pointer' }} onClick={() => dispatch(getUserAssignedVaults(form))}>Refresh</Typography>
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
                                renderVaultGrid()
                        }
                    </Col>
                </Row>
            </Container>
            {renderAddNewVault()}
            {renderUnlockVault()}
        </motion.div>
    );
}

export default Vaults;
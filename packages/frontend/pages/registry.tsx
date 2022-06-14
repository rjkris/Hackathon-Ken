import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Divider,
    Heading,
    Input,
    Text,
} from '@chakra-ui/react'
import {ChainId, useEthers, useSendTransaction} from '@usedapp/core'
import {ethers, utils} from 'ethers'
import React, { useReducer } from 'react'
import Layout from '../components/layout/Layout'
import Carbon from "../artifacts/contracts/Carbon.sol/Carbon.json";
import {Carbon as CarbonType} from "../types/typechain";
import {CarbonContract as LOCAL_CONTRACT_ADDRESS} from "../artifacts/contracts/contractAddress";

const ROPSTEN_CONTRACT_ADDRESS = '0x6b61a52b1EA15f4b8dB186126e980208E1E18864'

type StateType = {
    inputAddr: string
    inputVCUs: string
    inputCert: string
    loadingUpload: boolean
}
type ActionType =
    | {
    type: 'SET_INPUT_ADDR'
    inputAddr: StateType['inputAddr']
}
    | {
    type: 'SET_INPUT_VCUs'
    inputVCUs: StateType['inputVCUs']
}
    | {
    type: 'SET_INPUT_CERT'
    inputCert: StateType['inputCert']
}
    | {
    type: 'SET_LOADING_UPLOAD'
    loadingUpload: StateType['loadingUpload']
}

const initialState: StateType = {
    inputAddr: '',
    inputVCUs: '',
    inputCert: '',
    loadingUpload: false
}

function reducer(state: StateType, action: ActionType): StateType {
    switch (action.type) {
        // Track the greeting from the blockchain
        case 'SET_INPUT_ADDR':
            return {
                ...state,
                inputAddr: action.inputAddr,
            }
        case 'SET_INPUT_VCUs':
            return {
                ...state,
                inputVCUs: action.inputVCUs,
            }
        case 'SET_INPUT_CERT':
            return {
                ...state,
                inputCert: action.inputCert,
            }
        case 'SET_LOADING_UPLOAD':
            return {
                ...state,
                loadingUpload: action.loadingUpload,
            }
        default:
            throw new Error()
    }
}

function RegistryIndex(): JSX.Element {
    const [state, dispatch] = useReducer(reducer, initialState)
    const { account, chainId, library } = useEthers()

    const isLocalChain =
        chainId === ChainId.Localhost || chainId === ChainId.Hardhat

    const CONTRACT_ADDRESS =
        chainId === ChainId.Ropsten
            ? ROPSTEN_CONTRACT_ADDRESS
            : LOCAL_CONTRACT_ADDRESS

    // call the smart contract, send an update
    async function UploadCertificate() {
        if (!state.inputAddr || !state.inputCert || !state.inputVCUs) return
        if (library) {
            dispatch({
                type: 'SET_LOADING_UPLOAD',
                loadingUpload: true,
            })
            const signer = library.getSigner()
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                Carbon.abi,
                signer
            ) as CarbonType
            const transaction = await contract.uploadCertificate(state.inputAddr, state.inputVCUs, state.inputCert)
            await transaction.wait()
            dispatch({
                type: 'SET_LOADING_UPLOAD',
                loadingUpload: false,
            })
        }
    }

    return (
        <Layout>
            <Heading as="h1" mb="12">
                Registry
            </Heading>
            <Box maxWidth="container.sm" p="8" mt="8" bg="gray.100">
                <Text fontWeight="semibold" mt="2" fontSize="xl">Upload Certificate</Text>
                <Text fontWeight="semibold" mt="2">Address:</Text>
                <Input
                    bg="white"
                    mt="2"
                    type="text"
                    placeholder="Enter Address"
                    onChange={(e) => {
                        dispatch({
                            type: 'SET_INPUT_ADDR',
                            inputAddr: e.target.value,
                        })
                    }}
                />
                <Text fontWeight="semibold" mt="2">Verified Carbon Units:</Text>
                <Input
                    bg="white"
                    mt="2"
                    type="text"
                    placeholder="Enter VCUs"
                    onChange={(e) => {
                        dispatch({
                            type: 'SET_INPUT_VCUs',
                            inputVCUs: e.target.value,
                        })
                    }}
                />
                <Text fontWeight="semibold" mt="2">Certificates:</Text>
                <Input
                    bg="white"
                    mt="2"
                    type="text"
                    placeholder="Enter Certificates"
                    onChange={(e) => {
                        dispatch({
                            type: 'SET_INPUT_CERT',
                            inputCert: e.target.value,
                        })
                    }}
                />
                <Button mt="2" colorScheme="teal" onClick={UploadCertificate} isLoading={state.loadingUpload}>
                    Upload
                </Button>
            </Box>
        </Layout>
    )
}

export default RegistryIndex

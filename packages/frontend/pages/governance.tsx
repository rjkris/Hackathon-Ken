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
    inputTotalVCUs: string
    totalVCUs: string
    loadingAddVCUs: boolean
    inputRegAddr: string
    loadingAddReg: boolean
}
type ActionType =
    | {
        type: 'SET_INPUT_VCUs'
        inputTotalVCUs: StateType['inputTotalVCUs']
    }
    | {
        type: 'SET_VCUs'
        totalVCUs: StateType['totalVCUs']
    }
    | {
        type: 'SET_LOADING_VCUs'
        loadingAddVCUs: StateType['loadingAddVCUs']
    }
    | {
        type: 'SET_INPUT_ADDR'
        inputRegAddr: StateType['inputRegAddr']
    }
    | {
        type: 'SET_LOADING_ADDR'
        loadingAddReg: StateType['loadingAddReg']
    }

const initialState: StateType = {
    inputTotalVCUs: '',
    totalVCUs: '',
    loadingAddVCUs: false,
    inputRegAddr: '',
    loadingAddReg: false,
}

function reducer(state: StateType, action: ActionType): StateType {
    switch (action.type) {
        // Track the greeting from the blockchain
        case 'SET_INPUT_VCUs':
            return {
                ...state,
                inputTotalVCUs: action.inputTotalVCUs,
            }
        case 'SET_VCUs':
            return {
                ...state,
                totalVCUs: action.totalVCUs,
            }
        case 'SET_LOADING_VCUs':
            return {
                ...state,
                loadingAddVCUs: action.loadingAddVCUs,
            }
        case 'SET_INPUT_ADDR':
            return {
                ...state,
                inputRegAddr: action.inputRegAddr,
            }
        case 'SET_LOADING_ADDR':
            return {
                ...state,
                loadingAddReg: action.loadingAddReg,
            }
        default:
            throw new Error()
    }
}

function GovernanceIndex(): JSX.Element {
    const [state, dispatch] = useReducer(reducer, initialState)
    const { account, chainId, library } = useEthers()

    const isLocalChain =
        chainId === ChainId.Localhost || chainId === ChainId.Hardhat

    const CONTRACT_ADDRESS =
        chainId === ChainId.Ropsten
            ? ROPSTEN_CONTRACT_ADDRESS
            : LOCAL_CONTRACT_ADDRESS

    // call the smart contract, read the current greeting value
    async function fetchTotalVCUs() {
        if (library) {
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                Carbon.abi,
                library,
            ) as CarbonType
            try {
                const data = (await contract.carbonSeason())["1"].toString()
                dispatch({ type: 'SET_VCUs', totalVCUs: data })
            } catch (err) {
                // eslint-disable-next-line no-console
                console.log('Error: ', err)
            }
        }
    }

    // call the smart contract, send an update
    async function AddTotalVCUs() {
        if (!state.inputTotalVCUs) return
        if (library) {
            dispatch({
                type: 'SET_LOADING_VCUs',
                loadingAddVCUs: true,
            })
            const signer = library.getSigner()
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                Carbon.abi,
                signer
            ) as CarbonType
            const transaction = await contract.newCarbonSeason(state.inputTotalVCUs)
            await transaction.wait()
            fetchTotalVCUs()
            dispatch({
                type: 'SET_LOADING_VCUs',
                loadingAddVCUs: false,
            })
        }
    }

    // call the smart contract, send an update
    async function AddRegistryAddress() {
        if (!state.inputRegAddr) return
        if (library) {
            dispatch({
                type: 'SET_LOADING_ADDR',
                loadingAddReg: true,
            })
            const signer = library.getSigner()
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                Carbon.abi,
                signer
            ) as CarbonType
            const regs: string[] = [state.inputRegAddr]
            const transaction = await contract.addIssurers(regs)
            await transaction.wait()
            dispatch({
                type: 'SET_LOADING_ADDR',
                loadingAddReg: false,
            })
        }
    }

    return (
        <Layout>
            <Heading as="h1" mb="12">
                Governance
            </Heading>
            <Box maxWidth="container.sm" p="8" mt="8" bg="gray.100">
                <Text fontWeight="semibold" mt="2" fontSize="xl">New Carbon Season</Text>
                <Text fontSize="lg">Total VCUs: {state.totalVCUs}</Text>
                <Text fontWeight="semibold" mt="2">Total Verified Carbon Units:</Text>
                <Input
                    mt="2"
                    bg="white"
                    type="text"
                    placeholder="Enter Total VCUs"
                    onChange={(e) => {
                        dispatch({
                            type: 'SET_INPUT_VCUs',
                            inputTotalVCUs: e.target.value,
                        })
                    }}
                />
                <Button mt="2" colorScheme="teal" onClick={AddTotalVCUs} isLoading={state.loadingAddVCUs}>
                    Add
                </Button>
            </Box>
            <Divider my="8" />
            <Box maxWidth="container.sm" p="8" mt="8" bg="gray.100">
                <Text fontWeight="semibold" mt="2" fontSize="xl">Add Registry</Text>
                <Text fontWeight="semibold" mt="2">Registry Address:</Text>
                <Input
                    bg="white"
                    mt="2"
                    type="text"
                    placeholder="Enter Registry Address"
                    onChange={(e) => {
                        dispatch({
                            type: 'SET_INPUT_ADDR',
                            inputRegAddr: e.target.value,
                        })
                    }}
                />
                <Button mt="2" colorScheme="teal" onClick={AddRegistryAddress} isLoading={state.loadingAddReg}>
                    Add
                </Button>
            </Box>
        </Layout>
    )
}

export default GovernanceIndex

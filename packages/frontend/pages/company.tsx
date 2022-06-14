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
    inputClaimVCUs: string
    totalVCUs: string
    loadingClaimVCUs: boolean
    inputOrderVCUs: string
    loadingOrderVCUs: boolean
}
type ActionType =
    | {
    type: 'SET_INPUT_CLAIM_VCUs'
    inputClaimVCUs: StateType['inputClaimVCUs']
}
    | {
    type: 'SET_LOADING_CLAIM_VCUs'
    loadingClaimVCUs: StateType['loadingClaimVCUs']
}
    | {
    type: 'SET_INPUT_ORDER_VCUs'
    inputOrderVCUs: StateType['inputOrderVCUs']
}
    | {
    type: 'SET_LOADING_ORDER_VCUs'
    loadingOrderVCUs: StateType['loadingOrderVCUs']
}

const initialState: StateType = {
    inputClaimVCUs: '',
    totalVCUs: '',
    loadingClaimVCUs: false,
    inputOrderVCUs: '',
    loadingOrderVCUs: false,
}

function reducer(state: StateType, action: ActionType): StateType {
    switch (action.type) {
        // Track the greeting from the blockchain
        case 'SET_INPUT_CLAIM_VCUs':
            return {
                ...state,
                inputClaimVCUs: action.inputClaimVCUs,
            }
        case 'SET_LOADING_CLAIM_VCUs':
            return {
                ...state,
                loadingClaimVCUs: action.loadingClaimVCUs,
            }
        case 'SET_INPUT_ORDER_VCUs':
            return {
                ...state,
                inputOrderVCUs: action.inputOrderVCUs,
            }
        case 'SET_LOADING_ORDER_VCUs':
            return {
                ...state,
                loadingOrderVCUs: action.loadingOrderVCUs,
            }
        default:
            throw new Error()
    }
}

function CompanyIndex(): JSX.Element {
    const [state, dispatch] = useReducer(reducer, initialState)
    const { account, chainId, library } = useEthers()

    const isLocalChain =
        chainId === ChainId.Localhost || chainId === ChainId.Hardhat

    const CONTRACT_ADDRESS =
        chainId === ChainId.Ropsten
            ? ROPSTEN_CONTRACT_ADDRESS
            : LOCAL_CONTRACT_ADDRESS

    // call the smart contract, send an update
    async function ClaimVCUs() {
        if (!state.inputClaimVCUs) return
        if (library) {
            dispatch({
                type: 'SET_LOADING_CLAIM_VCUs',
                loadingClaimVCUs: true,
            })
            const signer = library.getSigner()
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                Carbon.abi,
                signer
            ) as CarbonType
            const transaction = await contract.claimCarbon(state.inputClaimVCUs)
            await transaction.wait()
            dispatch({
                type: 'SET_LOADING_CLAIM_VCUs',
                loadingClaimVCUs: false,
            })
        }
    }

    // call the smart contract, send an update
    async function MakeOrder() {
        if (!state.inputOrderVCUs) return
        if (library) {
            dispatch({
                type: 'SET_LOADING_ORDER_VCUs',
                loadingOrderVCUs: true,
            })
            const signer = library.getSigner()
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                Carbon.abi,
                signer
            ) as CarbonType
            const transaction = await contract.makeOrder(state.inputOrderVCUs)
            await transaction.wait()
            dispatch({
                type: 'SET_LOADING_ORDER_VCUs',
                loadingOrderVCUs: false,
            })
        }
    }

    return (
        <Layout>
            <Heading as="h1" mb="12">
                Company
            </Heading>
            <Box maxWidth="container.sm" p="8" mt="8" bg="gray.100">
                <Text fontWeight="semibold" mt="2" fontSize="xl">Claim Carbon</Text>
                <Text fontWeight="semibold" mt="2">Claim Verified Carbon Units:</Text>
                <Input
                    mt="2"
                    bg="white"
                    type="text"
                    placeholder="Enter VCUs Amount"
                    onChange={(e) => {
                        dispatch({
                            type: 'SET_INPUT_CLAIM_VCUs',
                            inputClaimVCUs: e.target.value,
                        })
                    }}
                />
                <Button mt="2" colorScheme="teal" onClick={ClaimVCUs} isLoading={state.loadingClaimVCUs}>
                    Claim
                </Button>
            </Box>
            <Divider my="8" />
            <Box maxWidth="container.sm" p="8" mt="8" bg="gray.100">
                <Text fontWeight="semibold" mt="2" fontSize="xl">Make Order</Text>
                <Text fontWeight="semibold" mt="2">VCUs Amount:</Text>
                <Input
                    bg="white"
                    mt="2"
                    type="text"
                    placeholder="Enter VCUs Amount"
                    onChange={(e) => {
                        dispatch({
                            type: 'SET_INPUT_ORDER_VCUs',
                            inputOrderVCUs: e.target.value,
                        })
                    }}
                />
                <Button mt="2" colorScheme="teal" onClick={MakeOrder} isLoading={state.loadingOrderVCUs}>
                    Add
                </Button>
            </Box>
        </Layout>
    )
}

export default CompanyIndex

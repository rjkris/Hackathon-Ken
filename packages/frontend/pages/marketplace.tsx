import {
    Box, Button,
    ChakraProvider,
    Flex,
    Grid,
    Heading,
    Table,
    TableCaption,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    theme,
    Tr,
} from '@chakra-ui/react'
import {ChainId, useEthers} from '@usedapp/core'
import {BigNumber, ethers} from 'ethers'
import React, {useReducer} from 'react'
import Layout from '../components/layout/Layout'
import {ColorModeSwitcher} from "./ColorModeSwitcher";
import TablePerso from "../components/table";
import Carbon from "../artifacts/contracts/Carbon.sol/Carbon.json";
import {Carbon as CarbonType} from "../types/typechain";
import {CarbonContract as LOCAL_CONTRACT_ADDRESS} from "../artifacts/contracts/contractAddress";

const ROPSTEN_CONTRACT_ADDRESS = '0x6b61a52b1EA15f4b8dB186126e980208E1E18864'

type Order = {
    from: string;
    amount: string;
    to: string;
    onSale: string;
}
type StateType = {
    orders:      Order[]
}

type ActionType =
    | {
    type: 'UPDATE_ORDERS',
    orders: StateType["orders"]
}

const initialState: StateType = {
    orders: [{
        from: "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199",
        amount: "100",
        to: "456",
        onSale: "true",
    }],
}

function reducer(state: StateType, action: ActionType): StateType {
    switch (action.type) {
        // Track the greeting from the blockchain
        case 'UPDATE_ORDERS':
            return {
                ...state,
                orders: action.orders,
            }
        default:
            throw new Error()
    }
}
function Marketplace(): JSX.Element {
    // const [data, setData] = useState(initialState.orders)

    const [state, dispatch] = useReducer(reducer, initialState)
    const { account, chainId, library } = useEthers()

    const isLocalChain =
        chainId === ChainId.Localhost || chainId === ChainId.Hardhat

    const CONTRACT_ADDRESS =
        chainId === ChainId.Ropsten
            ? ROPSTEN_CONTRACT_ADDRESS
            : LOCAL_CONTRACT_ADDRESS
    async function GetCarbonOrders() {
        if (library) {
            const signer = library.getSigner()
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                Carbon.abi,
                signer
            ) as CarbonType
            const ContractData = await contract.GetOrders()
            let displayData: Order[] = [];
            for (let i = 0; i < ContractData.length; i++) {
                const oneOrder: Order = {
                    from: ContractData[i].from,
                    amount: ethers.utils.formatEther(ContractData[i].amount),
                    to: ContractData[i].to,
                    onSale: String(ContractData[i].onSale),
                }
                displayData.push(oneOrder)
            }
            dispatch({ type: 'UPDATE_ORDERS', orders: displayData })
            // setData(displayData)
        }
    }
    // const data = React.useMemo(
    //     () => [
    //         {
    //             id: "1233",
    //             fromUnit: "inches",
    //             toUnit: "millimetres (mm)",
    //             factor: 25.4,
    //         },
    //         {
    //             id: "1",
    //             fromUnit: "feet",
    //             toUnit: "centimetres (cm)",
    //             factor: 30.48,
    //         },
    //         {
    //             id: "13",
    //             fromUnit: "yards",
    //             toUnit: "metres (m)",
    //             factor: 0.91444,
    //         },
    //     ],
    //     []
    // );

    // const columns = React.useMemo(
    //     () => [
    //         {
    //             Header: "To convert",
    //             accessor: "fromUnit",
    //         },
    //         {
    //             Header: "Into",
    //             accessor: "id",
    //             Cell: ({ value }) => <Flex>Perso Render</Flex>,
    //         },
    //         {
    //             Header: "Multiply by",
    //             accessor: "factor",
    //             isNumeric: true,
    //         },
    //     ],
    //     []
    // );
    const columns = React.useMemo(
        () => [
            {
                Header: "VCUs",
                accessor: "amount",
            },
            {
                Header: "Seller Address",
                accessor: "from",
            },
            {
                Header: "Status",
                accessor: "onSale",
            },
            {
                width: 100,
                Header: "",
                accessor: "buy",
                Cell: cell => (
                    <Button colorScheme="teal" size="sm">
                        Buy
                    </Button>
                )
            },
            {
                width: 100,
                Header: "",
                accessor: "cancel",
                Cell: cell => (
                    <Button colorScheme="teal" size="sm">
                        Cancel
                    </Button>
                )
            },
        ],
        []
    );

    return (
        <Layout>
            <ChakraProvider theme={theme}>
                <Box  fontSize="xl">
                    <Grid>
                        {/*<ColorModeSwitcher justifySelf="flex-end" />*/}
                        {/*<VStack spacing={8}>*/}
                        {/*    <Logo h="20vmin" pointerEvents="none" />*/}
                        {/*</VStack>*/}

                        <Heading as="h1" mb="12">
                            Marketplace
                        </Heading>

                        <Button mt="2" colorScheme="teal" onClick={GetCarbonOrders} width="100px">
                            Refresh
                        </Button>

                        <Flex p="20px">
                            <TablePerso
                                data={state.orders}
                                columns={columns}
                                isResponsive={true}
                                onRowClick={(row: any) => console.log(row)}
                                responsiveView={<Flex>responsive here....</Flex>}
                                isPaginate
                                onPageChanged={(f: any) => alert(JSON.stringify(f))}
                                currentPage={1}
                                totalRecords={300}
                                pageLimit={10}
                            />
                        </Flex>
                    </Grid>
                </Box>
            </ChakraProvider>
        </Layout>
    );
}

export default Marketplace

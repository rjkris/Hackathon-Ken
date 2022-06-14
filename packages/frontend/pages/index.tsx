import { Box, Button, Divider, Heading, Input, Text } from '@chakra-ui/react'
import { ChainId, useEthers, useSendTransaction } from '@usedapp/core'
import { ethers, providers, utils } from 'ethers'
import React, { useReducer } from 'react'
import { YourContract as LOCAL_CONTRACT_ADDRESS } from '../artifacts/contracts/contractAddress'
import YourContract from '../artifacts/contracts/YourContract.sol/YourContract.json'
import Layout from '../components/layout/Layout'
import { YourContract as YourContractType } from '../types/typechain'

/**
 * Constants & Helpers
 */

const localProvider = new providers.StaticJsonRpcProvider(
  'http://localhost:8545'
)

const ROPSTEN_CONTRACT_ADDRESS = '0x6b61a52b1EA15f4b8dB186126e980208E1E18864'

/**
 * Prop Types
 */


function HomeIndex(): JSX.Element {
  return (
    <Layout>
      <Heading as="h1" mb="8">
          Welcome to Graphite石墨C
      </Heading>
            <Text fontSize="xl">
                Decentralized storage and authenticated transfer model for carbon-neutral data.
            </Text>
            <Button
                mt = "8"
                as="a"
                size="lg"
                colorScheme="teal"
                variant="outline"
                href="https://github.com/skyh24/Hackathon-Ken"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get the source code!
            </Button>
    </Layout>
  )
}

export default HomeIndex

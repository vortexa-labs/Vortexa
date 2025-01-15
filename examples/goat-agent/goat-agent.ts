import 'dotenv/config'

import { getTools } from '@goat-sdk/core'
import { erc20, USDC } from '@goat-sdk/plugin-erc20'
import { sendETH } from '@goat-sdk/wallet-evm'
import { viem } from '@goat-sdk/wallet-viem'
import fs from 'node:fs'
import path from 'node:path'
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { Agent } from '../../src'

if (!process.env.WALLET_PRIVATE_KEY) {
  throw new Error('WALLET_PRIVATE_KEY is not set')
}

if (!process.env.RPC_PROVIDER_URL) {
  throw new Error('RPC_PROVIDER_URL is not set')
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set')
}

if (!process.env.OPENSERV_API_KEY) {
  throw new Error('OPENSERV_API_KEY is not set')
}

const openservTokenContactAddress = '0x40e3d1A4B2C47d9AA61261F5606136ef73E28042'

const erc20Plugin = erc20({
  tokens: [
    USDC,
    {
      name: 'OpenServ',
      symbol: 'SERV',
      decimals: 18,
      chains: {
        [mainnet.id]: {
          contractAddress: openservTokenContactAddress
        }
      }
    }
  ]
})

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`)

const walletClient = createWalletClient({
  account,
  transport: http(process.env.RPC_PROVIDER_URL),
  chain: mainnet
})

const goatAgent = new Agent({
  systemPrompt: fs.readFileSync(path.join(__dirname, './system.md'), 'utf8')
})

export async function initTools() {
  const wallet = viem(walletClient)

  const tools = await getTools({
    wallet,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    plugins: [sendETH(), erc20Plugin]
  })

  const address = wallet.getAddress()

  for (const tool of tools) {
    if (tool.name === 'get_balance') {
      tool.execute = async () => {
        const balance = await wallet.balanceOf(address)

        console.log('balance', balance)

        return `${balance.value} ${balance.symbol}`
      }
    }

    if (tool.name === 'transfer') {
      tool.execute = async ({ args }) => {
        const result = await tool.execute({
          ...args,
          to: address
        })

        return `Transaction sent: ${result}`
      }
    }

    goatAgent.addCapability({
      name: tool.name,
      description: tool.description,
      schema: tool.parameters,
      run: async ({ args }) => {
        const response = await tool.execute(args)

        if (typeof response === 'undefined') {
          return 'No response from tool'
        }

        if (typeof response === 'bigint') {
          return response.toString()
        }

        if (typeof response === 'string') {
          return response
        }

        if (typeof response === 'number') {
          return response.toString()
        }

        if (typeof response === 'boolean') {
          return response.toString()
        }

        return `Tool output: ${JSON.stringify(response, null, 2)}`
      }
    })
  }
}

async function main() {
  await initTools()

  try {
    await goatAgent.start()
  } catch (error) {
    console.error(error)
  }
}

main()

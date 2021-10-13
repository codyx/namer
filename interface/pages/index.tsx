import {
  ChainId,
  CHAIN_NAMES,
  shortenAddress,
  useContractCall,
  useContractFunction,
  useEtherBalance,
  useEthers,
} from "@usedapp/core";
import { formatEther } from "ethers/lib/utils";
import type { NextPage } from "next";
import Head from "next/head";
import {
  Alert,
  Button,
  Layout,
  Input,
  Statistic,
  Row,
  Col,
  Form,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { utils } from "@usedapp/core/node_modules/ethers";
import Namer from "../abis/Namer.json";
import invariant from "tiny-invariant";

const { NEXT_PUBLIC_NAMER_CONTRACT_ADDRESS } = process.env;

invariant(
  NEXT_PUBLIC_NAMER_CONTRACT_ADDRESS,
  "Missing NEXT_PUBLIC_NAMER_CONTRACT_ADDRESS in env"
);

const namerContract = new Contract(
  NEXT_PUBLIC_NAMER_CONTRACT_ADDRESS,
  new utils.Interface(Namer.abi)
);

const { Content } = Layout;

message.config({
  maxCount: 1,
  duration: 1,
});

const Home: NextPage = () => {
  const { activateBrowserWallet, account, chainId } = useEthers();
  const etherBalance = useEtherBalance(account);
  const [name] =
    useContractCall(
      account &&
        chainId === ChainId.Ropsten && {
          address: NEXT_PUBLIC_NAMER_CONTRACT_ADDRESS!,
          abi: new utils.Interface(Namer.abi),
          method: "readName",
          args: [account],
        }
    ) ?? [];

  // @ts-ignore
  const { state, send } = useContractFunction(namerContract, "setName");
  const [input, setInput] = useState<string>(name || "");
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const saveName = () => {
    if (!input.length) return;
    setIsDisabled(true);
    message.loading("Transaction in progress...");
    send(input);
  };

  useEffect(() => {
    if (state.status != "Mining") {
      setIsDisabled(false);
      setInput("");
      if (state.status === "Exception" || state.status === "Fail")
        message.error("Transaction failed");
      else if (state.status === "Success")
        message.success("Transaction succeeded");
    }
  }, [state]);

  const [form] = Form.useForm();

  return (
    <Layout>
      <Head>
        <title>Namer</title>
        <meta name='description' content='Namer' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      {!account && (
        <Button type='primary' onClick={() => activateBrowserWallet()}>
          Connect
        </Button>
      )}

      <Content style={{ margin: "auto", width: "50%" }}>
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title='Chain'
                value={chainId ? CHAIN_NAMES[chainId] : ""}
                loading={!chainId}
              />
              <Statistic title='Name' value={name} loading={!name} />
            </Col>
            <Col span={12}>
              <Statistic
                title='Account'
                value={account ? shortenAddress(account) : ""}
                loading={!account}
              />
              <Statistic
                title='Ether Balance'
                prefix='Ξ'
                value={etherBalance && formatEther(etherBalance)}
                loading={!etherBalance}
              />
            </Col>
          </Row>
          <br />
          {chainId !== ChainId.Ropsten ? (
            <Alert
              message='Wrong Network'
              description='Please switch to Ropsten network.'
              type='error'
              showIcon
            />
          ) : (
            <Row gutter={16}>
              <Form form={form} layout='inline'>
                <Form.Item>
                  <Input
                    placeholder='Enter a name to set'
                    onChange={handleChange}
                    value={input}
                    onPressEnter={saveName}
                    disabled={isDisabled}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type='primary'
                    onClick={saveName}
                    loading={isDisabled}
                    disabled={!input.length}
                  >
                    {!isDisabled ? "Save" : "Saving"}
                  </Button>
                </Form.Item>
              </Form>
            </Row>
          )}
        </>
      </Content>
    </Layout>
  );
};

export default Home;

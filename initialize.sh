#!/usr/bin/bash

# INITIALIZE THE PRIVATE ETHEREUM NETWORK 

bootnode --genkey privateChainDocker/bootNode.key
bootNodeEnode=$(bootnode -nodekey privateChainDocker/bootNode.key -writeaddress)

rm -rf node*

mkdir privateChainDocker/node1 privateChainDocker/node2 privateChainDocker/node3 privateChainDocker/node4
gpg --gen-random --armor 2 32 > privateChainDocker/node1/passNode1
gpg --gen-random --armor 2 32 > privateChainDocker/node2/passNode2
gpg --gen-random --armor 2 32 > privateChainDocker/node3/passNode3
gpg --gen-random --armor 2 32 > privateChainDocker/node4/passNode4
gpg --gen-random --armor 2 32 > privateChainDocker/node1/passAccount1
gpg --gen-random --armor 2 32 > privateChainDocker/node1/passAccount2

signers=''
printf "" > chainInfo
printf "chainId: 210567\n\n" > chainInfo

geth account new --datadir privateChainDocker/node1/ --password privateChainDocker/node1/passNode1
files=(privateChainDocker/node1/keystore/*)
pubKey1=$(cat "${files[0]}" | cut -d "," -f 1 | cut -d ":" -f 2 | tr -d '"')
signers+="$pubKey1"
pass=$(cat privateChainDocker/node1/passNode1)
printf "node1\n\tpublicKey: $pubKey1\n\tpass: $pass\n\n" >> chainInfo

geth account new --datadir privateChainDocker/node2/ --password privateChainDocker/node2/passNode2
pubKey2=$(cat privateChainDocker/node2/keystore/UTC* | cut -d "," -f 1 | cut -d ":" -f 2 | tr -d '"')
signers+="$pubKey2"
pass=$(cat privateChainDocker/node2/passNode2)
printf "node2\n\tpublicKey: $pubKey2\n\tpass: $pass\n\n" >> chainInfo

geth account new --datadir privateChainDocker/node3/ --password privateChainDocker/node3/passNode3
pubKey3=$(cat privateChainDocker/node3/keystore/UTC* | cut -d "," -f 1 | cut -d ":" -f 2 | tr -d '"')
signers+="$pubKey3"
pass=$(cat privateChainDocker/node3/passNode3)
printf "node3\n\tpublicKey: $pubKey3\n\tpass: $pass\n\n" >> chainInfo

geth account new --datadir privateChainDocker/node4/ --password privateChainDocker/node4/passNode4
pubKey4=$(cat privateChainDocker/node4/keystore/UTC* | cut -d "," -f 1 | cut -d ":" -f 2 | tr -d '"')
signers+="$pubKey4"
pass=$(cat privateChainDocker/node4/passNode4)
printf "node4\n\tpublicKey: $pubKey4\n\tpass: $pass\n\n" >> chainInfo

geth account new --datadir privateChainDocker/node1/ --password privateChainDocker/node1/passAccount1
files=(privateChainDocker/node1/keystore/*)
pubKeyAcc1=$(cat "${files[1]}" | cut -d "," -f 1 | cut -d ":" -f 2 | tr -d '"')
pass=$(cat privateChainDocker/node1/passAccount1)
keyStore=$(cat "${files[1]}")
printf "account1\n\tpublicKey: $pubKeyAcc1\n\tpass: $pass\n\tkeystore: $keyStore\n\n" >> chainInfo

geth account new --datadir privateChainDocker/node1/ --password privateChainDocker/node1/passAccount2
files=(privateChainDocker/node1/keystore/*)
pubKeyAcc2=$(cat "${files[2]}" | cut -d "," -f 1 | cut -d ":" -f 2 | tr -d '"')
pass=$(cat privateChainDocker/node1/passAccount2)
keyStore=$(cat "${files[2]}")
printf "account2\n\tpublicKey: $pubKeyAcc2\n\tpass: $pass\n\tkeystore: $keyStore\n\n" >> chainInfo

extraData="0x0000000000000000000000000000000000000000000000000000000000000000"
extraData+="$signers"
extraData+="0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"

cp privateChainDocker/genesisTemplate.json privateChainDocker/genesisTemplate.json.tmp
sed -i "s/"SIGNERS"/$extraData/" privateChainDocker/genesisTemplate.json.tmp
sed -i "s/"PREFUNDACC1"/$pubKeyAcc1/" privateChainDocker/genesisTemplate.json.tmp
sed -i "s/"PREFUNDACC2"/$pubKeyAcc2/" privateChainDocker/genesisTemplate.json.tmp
mv privateChainDocker/genesisTemplate.json.tmp privateChainDocker/genesis.json

cp envTemplate envTemplate.tmp
currentDir=$(pwd)

cat envTemplate.tmp
sed -i "s/"NODE1_ACC_PUB"/0x$pubKey1/" envTemplate.tmp
sed -i "s/"NODE2_ACC_PUB"/0x$pubKey2/" envTemplate.tmp
sed -i "s/"NODE3_ACC_PUB"/0x$pubKey3/" envTemplate.tmp
sed -i "s/"NODE4_ACC_PUB"/0x$pubKey4/" envTemplate.tmp
sed -i "s/"BOOTNODE_PUB_KEY"/$bootNodeEnode/" envTemplate.tmp
sed -i "s@"CURRENT_WORK_DIR"@$currentDir@" envTemplate.tmp
mv envTemplate.tmp .env

geth init --datadir privateChainDocker/node1 privateChainDocker/genesis.json
printf "Initialized Node 1\n\n"
geth init --datadir privateChainDocker/node2 privateChainDocker/genesis.json
printf "Initialized Node 2\n\n"
geth init --datadir privateChainDocker/node3 privateChainDocker/genesis.json
printf "Initialized Node 3\n\n"
geth init --datadir privateChainDocker/node4 privateChainDocker/genesis.json
printf "Initialized Node 4\n\n"

rm privateChainDocker/node*/geth/nodekey 

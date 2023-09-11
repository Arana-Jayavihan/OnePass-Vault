#!/usr/bin/bash

bootnode --genkey bootNode.key
bootNodeEnode=$(bootnode -nodekey bootNode.key -writeaddress)

rm -rf node*

mkdir node1 node2 node3 node4
gpg --gen-random --armor 2 32 > node1/passNode1
gpg --gen-random --armor 2 32 > node2/passNode2
gpg --gen-random --armor 2 32 > node3/passNode3
gpg --gen-random --armor 2 32 > node4/passNode4
gpg --gen-random --armor 2 32 > node1/passAccount1
gpg --gen-random --armor 2 32 > node1/passAccount2

signers=''
printf "" > chainInfo
printf "chainId: 210567\n\n" > chainInfo

geth account new --datadir node1/ --password node1/passNode1
files=(node1/keystore/*)
pubKey1=$(cat "${files[0]}" | cut -d "," -f 1 | cut -d ":" -f 2 | tr -d '"')
signers+="$pubKey1"
pass=$(cat node1/passNode1)
printf "node1\n\tpublicKey: $pubKey1\n\tpass: $pass\n\n" >> chainInfo

geth account new --datadir node2/ --password node2/passNode2
pubKey2=$(cat node2/keystore/UTC* | cut -d "," -f 1 | cut -d ":" -f 2 | tr -d '"')
signers+="$pubKey2"
pass=$(cat node2/passNode2)
printf "node2\n\tpublicKey: $pubKey2\n\tpass: $pass\n\n" >> chainInfo

geth account new --datadir node3/ --password node3/passNode3
pubKey3=$(cat node3/keystore/UTC* | cut -d "," -f 1 | cut -d ":" -f 2 | tr -d '"')
signers+="$pubKey3"
pass=$(cat node3/passNode3)
printf "node3\n\tpublicKey: $pubKey3\n\tpass: $pass\n\n" >> chainInfo

geth account new --datadir node4/ --password node4/passNode4
pubKey4=$(cat node4/keystore/UTC* | cut -d "," -f 1 | cut -d ":" -f 2 | tr -d '"')
signers+="$pubKey4"
pass=$(cat node4/passNode4)
printf "node4\n\tpublicKey: $pubKey4\n\tpass: $pass\n\n" >> chainInfo

geth account new --datadir node1/ --password node1/passAccount1
files=(node1/keystore/*)
pubKeyAcc1=$(cat "${files[1]}" | cut -d "," -f 1 | cut -d ":" -f 2 | tr -d '"')
pass=$(cat node1/passAccount1)
keyStore=$(cat "${files[1]}")
printf "account1\n\tpublicKey: $pubKeyAcc1\n\tpass: $pass\n\tkeystore: $keyStore\n\n" >> chainInfo

geth account new --datadir node1/ --password node1/passAccount2
files=(node1/keystore/*)
pubKeyAcc2=$(cat "${files[2]}" | cut -d "," -f 1 | cut -d ":" -f 2 | tr -d '"')
pass=$(cat node1/passAccount2)
keyStore=$(cat "${files[2]}")
printf "account2\n\tpublicKey: $pubKeyAcc2\n\tpass: $pass\n\tkeystore: $keyStore\n\n" >> chainInfo

extraData="0x0000000000000000000000000000000000000000000000000000000000000000"
extraData+="$signers"
extraData+="0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"

cp genesisTemplate.json genesisTemplate.json.tmp
sed -i "s/"SIGNERS"/$extraData/" genesisTemplate.json.tmp
sed -i "s/"PREFUNDACC1"/$pubKeyAcc1/" genesisTemplate.json.tmp
sed -i "s/"PREFUNDACC2"/$pubKeyAcc2/" genesisTemplate.json.tmp
mv genesisTemplate.json.tmp genesis.json

cp envTemplate envTemplate.tmp
sed -i "s/"NODE1_ACC_PUB"/0x$pubKey1/" envTemplate.tmp
sed -i "s/"NODE2_ACC_PUB"/0x$pubKey2/" envTemplate.tmp
sed -i "s/"NODE3_ACC_PUB"/0x$pubKey3/" envTemplate.tmp
sed -i "s/"NODE4_ACC_PUB"/0x$pubKey4/" envTemplate.tmp
sed -i "s/"BOOTNODE_PUB_KEY"/$bootNodeEnode/" envTemplate.tmp
mv envTemplate.tmp .env

geth init --datadir node1 genesis.json
printf "Initialized Node 1\n\n"
geth init --datadir node2 genesis.json
printf "Initialized Node 2\n\n"
geth init --datadir node3 genesis.json
printf "Initialized Node 3\n\n"
geth init --datadir node4 genesis.json
printf "Initialized Node 4\n\n"

rm node*/geth/nodekey 

#printf "" > commands
#printf "geth --datadir node1 --port 30305 --bootnodes $bootNode --networkid 210567 --unlock 0x$pubKey1 --password node1/passNode1 --syncmode full --ipcdisable --http --http.addr 127.0.0.1 --http.api net,eth,txpool,web3 --http.corsdomain "\'*\'" --http.vhosts "\'*\'" --http.port 8979 --allow-insecure-unlock --authrpc.addr 127.0.0.1 --authrpc.port 8551 --authrpc.vhosts "\'*\'" --mine --miner.gasprice "0" --miner.etherbase 0x$pubKey1\n\n" >> commands
#printf "geth --datadir node2 --port 30306 --bootnodes $bootNode --networkid 210567 --unlock 0x$pubKey2 --password node2/passNode2 --syncmode full --ipcdisable --http --http.addr 127.0.0.1 --http.api net,eth,txpool,web3 --http.corsdomain "\'*\'" --http.vhosts "\'*\'" --http.port 8980 --allow-insecure-unlock --authrpc.addr 127.0.0.1 --authrpc.port 8552 --authrpc.vhosts "\'*\'" --mine --miner.gasprice "0" --miner.etherbase 0x$pubKey2\n\n" >> commands

#start client RPC node
#geth --datadir node1 --port 30304 --bootnodes "$bootNodeEnode" --networkid 210567 --unlock "0x$pubKey1" --password node1/passNode1 --syncmode full --ipcdisable --http --http.addr 0.0.0.0 --http.api net,eth,txpool,web3 --http.corsdomain "*" --http.vhosts "*" --http.port 8979 --allow-insecure-unlock --authrpc.addr 127.0.0.1 --authrpc.port 8551 --authrpc.vhosts "*" --mine --miner.gasprice "0" --miner.etherbase "0x$pubKey1"

#start admin RPC node
#geth --datadir node2 --port 30305 --bootnodes "$bootNodeEnode" --networkid 210567 --unlock "0x$pubKey2" --password node2/passNode2 --syncmode full --ipcdisable --http  --http.addr 127.0.0.1 --http.api net,eth,txpool,web3 --http.corsdomain "*" --http.vhosts "*" --http.port 8980 --allow-insecure-unlock --authrpc.addr 127.0.0.1  --authrpc.port 8551 --authrpc.vhosts "*" --mine --miner.gasprice "0" --miner.etherbase "0x$pubKey2"

#start miner nodes
#geth --datadir node3 --port 30306 --bootnodes "$bootNodeEnode" --networkid 210567 --unlock "0x$pubKey3" --password node3/passNode3 --syncmode full --authrpc.port 8552 --ipcdisable --mine --miner.gasprice "0" --miner.etherbase "0x$pubKey3"
#geth --datadir node4 --port 30307 --bootnodes "$bootNodeEnode" --networkid 210567 --unlock "0x$pubKey4" --password node4/passNode4 --syncmode full --authrpc.port 8553 --ipcdisable --mine --miner.gasprice "0" --miner.etherbase "0x$pubKey4"

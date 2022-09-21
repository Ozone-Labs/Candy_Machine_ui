import styled from 'styled-components';
import {useEffect, useState} from 'react';
import Button from '@material-ui/core/Button';
import {CircularProgress} from '@material-ui/core';
import {GatewayStatus, useGateway} from '@civic/solana-gateway-react';
import {CandyMachineAccount} from './candy-machine';


export const CTAButton = styled(Button)`
  display: flex;
  justify-content: center;
  display: block !important;

  align-items: center;
  max-width: 382px;
  width: 100%;
  margin: 0px 20px;
  margin-bottom: 0px;
  height: 55px;
  // background: linear-gradient(90deg, rgba(124, 215, 214, 0.63) -20.79%, #FBF454 99.88%, rgba(251, 244, 84, 0.65) 99.88%);
  // background: #F6B9FF;
  background: linear-gradient(#fad4ff 0%, #f6aaff 100%);
  font-family: "VALORANT";
  font-style: normal;
  font-weight: 400;
  font-size: 30px;
  line-height: 33px;
  color: black;
  cursor: pointer;
`;

export const MintButton = ({
                               onMint,
                               candyMachine,
                               isMinting,
                               isEnded,
                               isActive,
                               isSoldOut
                           }: {
    onMint: () => Promise<void>;
    candyMachine?: CandyMachineAccount;
    isMinting: boolean;
    isEnded: boolean;
    isActive: boolean;
    isSoldOut: boolean;
}) => {
    const {requestGatewayToken, gatewayStatus} = useGateway();
    const [clicked, setClicked] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        setIsVerifying(false);
        if (gatewayStatus === GatewayStatus.COLLECTING_USER_INFORMATION && clicked) {
            // when user approves wallet verification txn
            setIsVerifying(true);
        } else if (gatewayStatus === GatewayStatus.ACTIVE && clicked) {
            console.log('Verified human, now minting...');
            onMint();
            setClicked(false);
        }
    }, [gatewayStatus, clicked, setClicked, onMint]);

    return (
      <CTAButton
        disabled={
          clicked ||
          candyMachine?.state.isSoldOut ||
          isSoldOut ||
          isMinting ||
          isEnded ||
          !isActive ||
          isVerifying
        }
        onClick={async () => {
          if (
            isActive &&
            candyMachine?.state.gatekeeper &&
            gatewayStatus !== GatewayStatus.ACTIVE
          ) {
            console.log("Requesting gateway token");
            setClicked(true);
            await requestGatewayToken();
          } else {
            console.log("Minting...");
            await onMint();
          }
        }}
        variant="contained"
      >
        {!candyMachine ? (
          "Kindly Connect Your walllet"
        ) : candyMachine?.state.isSoldOut || isSoldOut ? (
          "SOLD OUT"
        ) : isActive ? (
          isVerifying ? (
            "VERIFYING..."
          ) : isMinting || clicked ? (
            <CircularProgress />
          ) : (
            "MINT"
          )
        ) : isEnded ? (
          "ENDED"
        ) : candyMachine?.state.goLiveDate ? (
          "SOON"
        ) : (
          "UNAVAILABLE"
        )}
      </CTAButton>
    );
};

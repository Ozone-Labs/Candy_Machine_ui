import './navbar.scss'
import './burger.css'
import styled from "styled-components";
import '../../page/styles.css';

import { GoMute } from "@react-icons/all-files/go/GoMute";
import { GoUnmute } from "@react-icons/all-files/go/GoUnmute";
import { slide as Menu } from 'react-burger-menu'
import { disconnectWallet } from '../../slice/walletSlice';
import { useDispatch, useSelector } from 'react-redux'

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { _default } from 'glamor';

const WalletContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: right;
  background: rgb(0,0,0,0) !important;
  z-index: 10002;
//   margin: auto;
`;

const WalletAmount = styled.div`
  color: black;
  width: auto;
background: rgb(0,0,0,0) !important;
//   padding: 5px 5px 5px 16px;
  min-width: 48px;
  min-height: auto;
//   border-radius: 22px;
//   background-color: var(--main-text-color);
//   box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%);
//   box-sizing: border-box;
//   transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  font-weight: 500;
  line-height: 1.75;
  text-transform: uppercase;
  border: 0;
  margin: 0;
  display: inline-flex;
  outline: 0;
  position: relative;
  align-items: center;
  user-select: none;
  vertical-align: middle;
  justify-content: flex-start;
  gap: 10px;
  z-index: 10001;
`;
//   flex: 0 0 auto;

const Wallet = styled.ul`
  margin: 0;
  padding: 0;
  display: flex;
    height: 35px;
    // width: 245px;
  align-items: center;
  background: rgb(0,0,0,0) !important;
  justify-content: center;
//   justify-content: flex-end;
  z-index: 10003;
  &:hover{
    background: rgb(0,0,0,0);
  }
`;

const ConnectButton = styled(WalletMultiButton)`
    padding: 5px 0px 0px 0px !important;
    width: 160px !important;
    height: 100% !important;
    font-family: VALORANT;
    background: rgb(0,0,0,0) !important;
    color: white;
    display: flex;
    align-items: center !important;
    justify-content: center !important;
    z-index: 10004;
    img{
        width: 0px !important;
        opacity: 0 !important;
    }
    i{
        width: 0px !important;
        margin: 0px !important;
    }
    &:hover{
        background: rgb(0,0,0,0) !important;
    
  }
  
`;

const mintClicked = {
  // position: 'asolute',
  // right: '-500px',
  // top: '120px',
  // // margin-right: -10px;
  // width: '382px',
  // height: '55px',
  // background: 'linear - gradient(white 10 %, #B860C9 100 %)'
}

let volumes = []
for (let i = 0; i < 18; ++i) {
  volumes.push(0)
}

export const Navbar = ({ closehidden, setCloseHidden, setshowblock, moveingblock, mintbtnshow, setBtnShow, address, wallet, balance, afterSuccess, setAfterSuccess, onConnectClick, playBtn, setPlaybtn, setvideoStart2, videoStart2, videoStart, Allbgshow, setAllbgshow }) => {
  // const [mintbtnClick, setClicked] = useState(false);

  const [sound, setSound] = useState(true)
  const [videShow, setShow] = useState(false);
  const [soundline, setLine] = useState([]);
  const [disconnectFlag, setDisconnectFlag] = useState(false)
  const [volume, setVolume] = useState(18)
  const [pagesign, setSign] = useState(0);

  const dispatch = useDispatch()
  // const address = useSelector((state) => state.wallet.account)
  const connected = useSelector((state) => state.wallet.connected)
  // const [showPlaybtn, setShowbtn] = useState(true);

  const [playHover, setHover] = useState(false);

  const onClickAddress = () => {
    setDisconnectFlag(!disconnectFlag)
    setAfterSuccess(false)
  }
  const onClickDisconnect = () => {
    setDisconnectFlag(false)
    dispatch(disconnectWallet())
  }

  // console.log(moveingblock)
  const truncate = (text = "", [h, t] = [6, 6]) => {
    const head = text.slice(0, h);
    const tail = text.slice(-1 * t, text.length);
    return text.length > h + t ? [head, tail].join("...") : text;
  };

  // useEffect(() => {
  // document.getElementById("wallet-adapter-modal-title").innerHTML = "Connect a wallet on Solana to continue";
  // });
  useEffect(() => {
    if (!Allbgshow && videoStart2 && !videoStart) {
      setPlaybtn(true);
    }
  }, [])

  const videoplayed = () => {
    setvideoStart2(true);
    setPlaybtn(false);
    setAllbgshow(false);
    setHover(false);
    setCloseHidden(true);
    setTimeout(() => {
      // setCloseHidden(false);
      setvideoStart2(false);
      // setAllbgshow(true);
      setPlaybtn(true);

    }, 15000)
  }
  return (
    <div className='navBody'>
      <div className='navContainer'>
        <div className='mentLeftItem'>
          <div className='menuItems'>
            <div className='menuItem0'>
              <img className='logoimg' src='/assets/logo.png' alt='logo' />
            </div>
            <div onClick={() => setSign(1)} className='menuItem'>
              <div className={pagesign === 1 ? 'text textstroke' : 'text'}>HOME</div>
            </div>
            <div onClick={() => setSign(2)} className='menuItem'>
              <div className={pagesign === 2 ? 'text textstroke' : 'text'}>Ark COLLECTION</div>
            </div>
            <div onClick={() => setSign(3)} className='menuItem'>
              <div className={pagesign === 3 ? 'text textstroke' : 'text'}>Ark CHAMBER</div>
            </div>
            <div onClick={() => setSign(4)} className='menuItem'>
              <div className={pagesign === 4 ? 'text textstroke' : 'text'}>story and lore</div>
            </div>
          </div>
        </div>
        <div className='menu-left'>
          <div id='showedtext' className='menuLeft'>
            {playBtn ? <div className='play-btn' onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => videoplayed()}>
              <div className='tooltip'>
                <span className='tooltiptext'>play video</span>
                {playHover ? <div className='btn' ><img src='/assets/U3.png' /></div> :
                  <div className='btn1'><img src='/assets/direction_triangle.png' /></div>}
              </div>
            </div> : ''}
            {/* <img onClick={onMinus} src='/assets/sound_icon.png' alt='sound-icon' className='img-sound' /> */}
            {
              sound ?
                (<GoUnmute style={{ width: '20px', height: '18px', cursor: 'pointer' }} onClick={() => setSound(!sound)} />) :
                (<GoMute style={{ width: '20px', height: '18px', cursor: 'pointer' }} onClick={() => setSound(!sound)} />)
            }
            <div className='sound-txt'>
              <span>SOUND</span>
              <span>{sound ? 'ON' : 'OFF'}</span>
            </div>
            {/* <img src='/assets/battery_icon.png' alt='battery-icon' className='img-battery' /> */}
            <div className='sound-bar'>
              {
                volumes.map((vlm, idx) => <div key={idx} className={volume >= idx + 1 ? 'sound-line' : 'sound-line black-bg'} onClick={() => sound ? setVolume(idx + 1) : ''}></div>)
              }
            </div>
          </div>
          <div id='walletGroup' className='walletGroup'>
            <div className='wallet-shadow'></div>
            <img className='avater' src='/assets/avatar.png' />
            {/* <Button className='avater' startIcon={<AccountCircleIcon style={{ color: 'white' }} />}></Button> */}

            <WalletContainer>
              <Wallet>
                {(!!wallet && !!wallet.publicKey) ?
                  <WalletAmount><ConnectButton>{address.substr(0, 6)}...{address.substr(address.length - 4, 4)}</ConnectButton></WalletAmount> :
                  <ConnectButton />}
              </Wallet>
            </WalletContainer>
          </div>
          <div className='burger'>
            <Menu right>
              <div className='hidemenuItem'>
                <div onClick={() => setSign(1)} className='menuItem'>
                  <div className={pagesign === 1 ? 'text textstroke' : 'text'}>HOME</div>
                </div>
                <div onClick={() => setSign(2)} className='menuItem'>
                  <div className={pagesign === 2 ? 'text textstroke' : 'text'}>Ark COLLECTION</div>
                </div>
                <div onClick={() => setSign(3)} className='menuItem'>
                  <div className={pagesign === 3 ? 'text textstroke' : 'text'}>Ark CHAMBER</div>
                </div>
                <div onClick={() => setSign(4)} className='menuItem'>
                  <div className={pagesign === 4 ? 'text textstroke' : 'text'}>story and lore</div>
                </div>
              </div>

              <div id='walletGroup2' className='walletGroup2'>
                <div className='wallet-shadow'></div>
                {!wallet ? <img className='avater' src='/assets/avatar.png' /> : ''}
                <WalletContainer>
                  <Wallet>
                    {!wallet ?
                      <WalletAmount><ConnectButton>Connect Wallet</ConnectButton></WalletAmount> :
                      <ConnectButton>Connect Wallet</ConnectButton>}
                  </Wallet>
                </WalletContainer>

              </div>

            </Menu>
          </div>
        </div>
      </div>
    </div>
  )
}


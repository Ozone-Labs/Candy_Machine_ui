import React, { useState, useEffect } from 'react'
import './videoModal.scss'
import { GoMute } from "@react-icons/all-files/go/GoMute";
import { GoUnmute } from "@react-icons/all-files/go/GoUnmute";


const VideoModal = (props) => {

    const [closehover, setCloseHover] = useState(false);

    const [hidden, setHidden] = useState(true);
    useEffect(() => {
        setTimeout(() => {
            // props.setAllbgshow(true);
            // props.setCloseHidden(false);
            // props.setStart(false);
            props.setPlaybtn(true);
            // props.setvideoStart2(false);
        }, 15000)
    }, [])

    const onCloseClick = () => {

        props.setAllbgshow(true);
        props.setStart(true);
        props.setvideoStart2(true);
        props.setPlaybtn(true);
        props.setCloseHidden(false);
        // setTimeout(() => {
        //     props.setStart(false);
        // }, 15000);
    }

    let volumes = [];
    for (let i = 0; i < 18; ++i) {
        volumes.push(0)
    }
    if (!props.show) {
        return null
    }

    // console.log('all', props.Allbgshow, '1000', props.videoStart, '2000', props.videoStart)



    return (
        <div className='video-body'>
            <div className={props.Allbgshow ? 'bgshow-container' : 'video-container'}>

                {closehover ?
                    <img src='/assets/xxx.png' onMouseLeave={e => setCloseHover(false)} onClick={onCloseClick} alt='cross' className='cross' /> :
                    <img src='/assets/cross_icon.png' onMouseEnter={e => setCloseHover(true)} onClick={onCloseClick} className='cross' />}

                {(props.videoStart && props.Allbgshow) ? <img src='/assets/intro.gif' className='video' /> : ""}
                {!props.Allbgshow ? <img src='/assets/intro.gif' className='video' /> : '' /* : <img src='/assets/videoStart.png' className='video' />*/}

                {/* {(props.videoReload && videoStart) ? <img src='/assets/intro.gif' className='video' /> : ''} */}

                {props.closehidden ? <div style={{ position: 'relative', display: 'flex', width: '100%', zIndex: '100000', alignItems: 'center', justifyContent: 'right', marginTop: '0px' }}>
                    {
                        props.sound ? (
                            <GoUnmute style={{ width: '20px', height: '18px', margin: '10px' }} onClick={() => props.setSound(!props.sound)} />
                        ) : (
                            <GoMute style={{ width: '20px', height: '18px', margin: '10px' }} onClick={() => props.setSound(!props.sound)} />
                        )
                    }
                    <div className='sound-txt' style={{ margin: '10px' }}>
                        <span>SOUND &nbsp;</span>
                        <span>{props.sound ? 'ON' : 'OFF'}</span>
                    </div>
                    {/* <img src='/assets/battery_icon.png' alt='battery-icon' className='img-battery' /> */}
                    <div className='sound-bar'>
                        {
                            volumes.map((vlm, idx) => <div key={idx} className={props.volume >= idx + 1 ? 'sound-line' : 'sound-line black-bg'} onClick={() => props.setVolume(idx + 1)}></div>)
                        }
                    </div>
                    {/* </div> */}
                </div> : ''}
            </div>

        </div >
    )
}

export default VideoModal
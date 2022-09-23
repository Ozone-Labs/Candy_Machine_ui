import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import './footer.scss'

const FootLine = styled.div`

`;

const Footer = () => {
    return (
        <div className='footer-body'>
            {/* <FootLine></FootLine> */}
            <div className='footer-max-container'>
                <div>
                    <div className='footer-left'>
                    </div>
                    <div className='footer-right'>

                        <div className='footer-right-top'>
                            <div className='foot-bottom-right-text'>© 2022 The Easy Elves</div>
                            <div className='footer-img-flex'>
                                <a href='https://discord.gg/EasyElves' target="_blank"
                                >
                                    <img src='/assets/Discord.png' alt='Discord.png' /></a>
                                <a href='https://twitter.com/EasyElves' target="_blank"
                                >
                                    <img src='/assets/twitterlogoundercircel.png' alt='twitter.png' /></a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='footer-right-bottom'>
                    {/* <div className='foot-bottom-left-text'>
                        <img src="/assets/logo.png" />
                        <span>Terms of Service</span>
                        <span>Privacy & Policy</span>
                        <span>FAQ</span> */}
                    {/* </div> */}

                </div>
            </div>
        </div>
    )
}

export default Footer
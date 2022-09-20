import React from 'react'
import './warn.scss'

const Warn = (props) => {
    if (!props.show) {
        return null
    }
    return (
        <div className='warn-body' onClick={() => props.closeSuccessModal()}>
            You minted 2 NFT’s succesfully!
        </div>
    )
}

export default Warn
import React from 'react'
import styled from 'styled-components'
import LazyImage from '../Lazy/LazyImage'
import {useTranslation} from 'react-i18next'

const palette = {
    darkBg: '#2e2e2e',
    extraDarkBg: '#1c1c1c',
    red: '#f95565'
}

const VideoDiscalimer = () => {
    const {t} = useTranslation()
    return (
        <Container>
            {t("VideoDiscalimer")}
            <div className='alert-container'>
                <LazyImage
                    width={46}
                    height={46}
                    alt='alert icon'
                    src='/icons/alert.svg' />
            </div>


            <div style={{ display: 'flex', background: 'white', padding: '1rem', justifyContent: 'space-around', alignItems: 'center' }}>
                <LazyImage
                    width={80}
                    height={70}
                    alt='alert icon'
                    src='/icons/aams_logo.png' />

                <LazyImage
                    width={70}
                    height={40}
                    alt='alert icon'
                    src='/icons/playsafe_left_it.png' />
            </div>

        </Container>
    )
}

const Container = styled.div`
    color : black;
    background : white;
    padding : 1rem 2rem;
    position : relative;
    max-width : 400px;      
    border-radius : 8px;
    margin : 3rem auto;
    border : 3px solid ${palette.darkBg};

    .alert-container{
        position : absolute;
        top : -30px;
        left : -20px;        
    }
`

export default VideoDiscalimer

import React from 'react'
import MarkdownProvider from './MarkdownProvider'
import ReactMarkdown from 'react-markdown'
import { injectCDN } from '../../utils/Utils'
import { FunctionComponent } from 'react';
import ArticleBonus from './ArticleBonus';
import styled from 'styled-components';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import ArticleTable from './ArticleTable';
import SocialBanner from './../Banners/SocialBanner';
import LoadingSlotCard from './../Cards/LoadingSlotCard';
import LoadingVideoCard from './../Cards/LoadingVideoCard';
import { tablet } from '../Responsive/Breakpoints';

interface Props {
    content: string
    style?: CSSProperties
}

const ArticleToMarkdown: FunctionComponent<Props> = ({ content, style }) => {


    const replaceWithCustomElement = (props: any) => {

        const customCode = props.children[0].props.children[0].props.value
        const parts = customCode.toString().split('@')
        const elementType = parts[0]
        
        const elementData = parts[1]

        if (elementType === 'spikeBonusCard') return <ArticleBonus bonusName={elementData} countryCode={'it'} />

        if (elementType === 'spikeCompare') {
            const bonusNames = elementData.split('&')
            return <Wrapper>
                {bonusNames && bonusNames.map(name => <ArticleBonus style={{ margin: '.7rem auto' }} key={`compare_${name}`} bonusName={name} countryCode={'it'} />)}
            </Wrapper>
        }

        if (elementType === 'spikeVideo') {
            const videoLink = props.children[0].props.children[1].props.children[0].props.children
            return <video controls preload="metadata">
                <source src={`${videoLink}#t=0.5`} type="video/mp4"></source>
            </video>
        }

        if (elementType === 'spikeTable') {
            return <ArticleTable tableString={elementData} />
        }

        if (elementType === 'spikeSocialBanner') {
            return <SocialBanner />
        }

        if (elementType === 'spikeSlotCards') {
            const slotNames = elementData.split('&')
            return <SlotNameContainer>
                {slotNames.map(name => <LoadingSlotCard key={`inline_slot_${name}`} slotName={name} />)}
            </SlotNameContainer>
        }

        if (elementType === 'spikeVideoCards') {

            const videoNames = elementData.split('&')
            return <SlotNameContainer>
                {videoNames.map(title => <LoadingVideoCard key={`inline_video_${title}`} videoTitle={title} />)}
            </SlotNameContainer>
        }

        if (elementType === 'imageButton') {
            const imageButtonData = elementData.split(',')
            const imageLink = imageButtonData.find(d => d.includes('img='))?.split('img=')[1]
            const link = imageButtonData.find(d => d.includes('link='))?.split('link=')[1]
            const width = imageButtonData.find(d => d.includes('width='))


            return <div style={{ textAlign: 'center', margin: '2rem 0rem' }}>
                <a href={`https://${link}`}>
                    <ImageButton width={`${width.split('width=')[1]}px`}
                        src={`https://${imageLink}`} />
                </a>
            </div>
        }

        return <h1>{customCode}</h1>
    }

    return (
        <MarkdownProvider style={style}>
            <ReactMarkdown
                escapeHtml={false}
                renderers={{ blockquote: (props) => replaceWithCustomElement(props) }}
                source={injectCDN(content)} />
        </MarkdownProvider>
    )
}

const ImageButton = styled.img`
    width : 100%;

    ${tablet}{
        width : ${props => props.width} !important;
    }
`

const Wrapper = styled.div`
    margin : 1rem 0rem;
`

const SlotNameContainer = styled.div`
    display  :flex;
    flex-wrap : wrap;
    justify-content : space-around;
    margin : 1rem 0rem;
`

const TableTop = styled.div`
    display : flex;
    background : ${(props) => props.theme.colors.primary};
    border-top-left-radius : 6px;
    border-top-right-radius : 6px;
    margin : 0rem auto;
    justify-content : space-between;
    align-items : center;
    max-width  : 550px;

    h4{
        color : white;
        font-family : ${(props) => props.theme.text.secondaryFont};
        padding : 1rem;
        width : 80px;
    }
`

const TableTopDivider = styled.div`
    width : 2px;
    height : 40px;
    background : white;
    display : flex;
    flex-direction : column;
    justify-content : center;
    align-items : center;
`

export default ArticleToMarkdown



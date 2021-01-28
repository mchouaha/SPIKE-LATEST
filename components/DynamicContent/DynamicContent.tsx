import React from 'react'
import { ApolloSlotCard } from '../../data/models/Slot'
import { Bonus } from '../../graphql/schema'
import { FunctionComponent } from 'react';
import ArticleToMarkdown from '../Markdown/ArticleToMarkdown';
import { injectCDN } from '../../utils/Utils';
import BonusStripe from '../Cards/BonusStripe';
import PrimaryBonusCard from '../Cards/PrimaryBonusCard';
import { appTheme } from '../../theme/theme';
import styled from 'styled-components';
import SlotCardComponent from './../Cards/SlotCardComponent';

export interface DynamicArticle {
    type: 'article'
    article: string
}

export interface DynamicBonusList {
    type: 'bonusList'
    direction: 'vertical' | 'horizontal'
    bonus: { bonus: Bonus }[]
    tableLabel?: string
}

export interface DynamicSlotList {
    type: 'slotList'
    slot: { slot: ApolloSlotCard }[]
}

export interface DynamicVideo {
    type: 'video'
    videoUrl: string
    thumbnailUrl?: string
}

export interface DynamicContentProps {
    content: (DynamicArticle | DynamicBonusList | DynamicSlotList | DynamicVideo)[]
}

const DynamicContent: FunctionComponent<DynamicContentProps> = ({ content }) => {

    const contentToBlocks = () => {
        return content?.map((dynamicContent, index) => {
            if (dynamicContent.type === 'article') return articleBlockRenderer(`dynamic_${index}`, dynamicContent.article)
            if (dynamicContent.type === 'bonusList') return bonusListRenderer(`dynamic_${index}`, dynamicContent.bonus, dynamicContent.direction, dynamicContent.tableLabel)
            if (dynamicContent.type === 'video') return videoRenderer(`dynamic_${index}`, dynamicContent.videoUrl)
            if (dynamicContent.type === 'slotList') return slotListRenderer(`dynamic_${index}`, dynamicContent.slot)
        })
    }

    const articleBlockRenderer = (key: string, article: string) => <ArticleToMarkdown key={key} content={injectCDN(article)} />

    const bonusListRenderer = (key: string, bonusList: { bonus: Bonus }[], direction: 'vertical' | 'horizontal', tableLabel: string | undefined) => {

        if (direction === 'vertical') return <div key={key} style={{ margin: '3rem 0rem' }}>
            {tableLabel && <ComparisonContainer>
                <p>{tableLabel}</p>
            </ComparisonContainer>}
            {bonusList.map(b => <BonusStripe key={b.bonus.name} bonus={b.bonus} />)}
        </div>

        if (direction === 'horizontal') return <div key={key} style={{ margin: '3rem 0rem' }}>
            {tableLabel && <HorizontalTableHeader> {tableLabel}</HorizontalTableHeader>}

            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {bonusList.map(b => <PrimaryBonusCard withSuggestion={false} key={b.bonus.name} bonus={b.bonus} />)}
            </div>
        </div>
    }

    const slotListRenderer = (key: string, slotList: { slot: ApolloSlotCard }[]) => {
        return <div key={key}>
            <div
                style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', margin: '2rem  0rem', background: appTheme.colors.primary, padding: '2rem' }}>
                {slotList.map(slot => <SlotCardComponent key={slot.slot.name} slotCardData={slot.slot} />)}
            </div>
        </div>
    }


    const videoRenderer = (key: string, videoLink: string) => {
        return <video key={key} controls style={{ width: '100%', margin: '1rem 0rem' }}>
            <source src={videoLink} type="video/mp4"></source>
        </video>
    }

    return (
        <div>
            {contentToBlocks()}
        </div>
    )
}

const HorizontalTableHeader = styled.h1`
    font-size : 1.5rem;
    text-align : center;
    color : ${(props) => props.theme.colors.primary};
    font-weight : bold;
`

const ComparisonContainer = styled.div`
    background : ${(props) => props.theme.colors.primary};
    color : white;
    font-weight : bold;
    padding : 1rem;
    display : flex;
`

export default DynamicContent

import React, { Fragment, useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import NavbarProvider from '../../../../components/Navbar/NavbarProvider';
import { NextPageContext } from 'next';
import CustomBreadcrumbs from '../../../../components/Breadcrumbs/CustomBreadcrumbs'
import { Slot, Bonus } from './../../../../graphql/schema';
import AquaClient from '../../../../graphql/aquaClient';
import { SLOT_WITH_SLUG } from './../../../../graphql/queries/slots';
import { injectCDN, goFullScreen, exitFullscreen } from './../../../../utils/Utils';
import SmallSlotCard from '../../../../components/Cards/SmallSlotCard';
import snakeCase from 'lodash/snakeCase';
import { isMobile } from 'react-device-detect'
import { laptop } from './../../../../components/Responsive/Breakpoints';
import PrimaryBonusCard from '../../../../components/Cards/PrimaryBonusCard';
import SecondaryBonusCard from './../../../../components/Cards/SecondaryBonusCard';
import NeonButton from './../../../../components/NeonButton/NeonButton';
import PlayDimmer from '../../../../components/PlayDimmer/PlayDimmer';
import FadeInOut from '../../../../components/Ui/FadeInOut';
import ArticleToMarkdown from './../../../../components/Markdown/ArticleToMarkdown';
import { MainColumn, RightColumn, BodyContainer } from '../../../../components/Layout/Layout';
import { FunctionComponent } from 'react';
import BonusCardRevealComponent from './../../../../components/Cards/BonusCardReveal';
import SlotMainFeatures from '../../../../components/Cards/SlotMainFeatures';
import Head from 'next/head';
import { ApolloBonusCardReveal } from '../../../../data/models/Bonus';
import { HOME_BONUS_LIST } from '../../../../graphql/queries/bonus';
import {useRouter} from 'next/router'
import {countryContext} from '../../../../context/CountryContext'
import {useTranslation} from 'react-i18next'

interface PageProps extends NextPageContext {
    slotData: Slot
    bonusList: { bonus: ApolloBonusCardReveal }[],
    countryCode:string
}

const SlotPage: FunctionComponent<PageProps> = ({ slotData, bonusList,countryCode}) => {
    
    const {t} = useTranslation()
    const slot: Slot = slotData
    const primaryBonus = slotData?.mainBonus
    const auxiliaryBonuses: Bonus[] = slot?.bonuses.filter((b: Bonus) => b.name !== primaryBonus?.name)
    const [homeBonuses, setHomeBonuses] = useState<{ bonus: ApolloBonusCardReveal }[]>(bonusList)

    const [isPlaying, setIsPlaying] = useState(false)

    const [isPlayingMobile, setIsPlayingMobile] = useState(false)

    const {currentCountry} = useContext(countryContext)
    const router  = useRouter()
    useEffect(() => {
        // if current url of the page is not with existing country code then pass with only existing country code
        if(!currentCountry){}else{
            if(currentCountry !== router.query.countryCode){
                router.push('/', `${currentCountry}`)
            }
        }
        if (isPlayingMobile) goFullScreen()
        else exitFullscreen()
        
    }, [isPlayingMobile,currentCountry])

    return (
        <Fragment>
            <Head>
                <title>{slotData?.seo ? `${slotData?.seo.seoTitle}` : `${slotData?.name} | SPIKE`}</title>
                <meta
                    name="description"
                    content={slotData?.seo ? `${slotData?.seo.seoDescription}` : `${slotData?.name} Le migliori slot online selezionate per te con trucchi consigli e demo gratuite. Prova le slot online in modalità gratuita, scegli quella che ti incuriosisce di più e leggi la guida approfondita prima di passare alla versione a soldi veri`}>
                </meta>
                <meta httpEquiv="content-language" content="it-IT"></meta>
                <meta property="og:image" content={slotData?.image.url} />
                <meta property="og:locale" content={'it'} />
                <meta property="og:type" content="article" />
                <meta property="og:description" content={slotData?.seo?.seoDescription} />
                <meta property="og:site_name" content="SPIKE Slot | Il Blog n.1 in Italia su Slot Machines e Gioco D'azzardo" />
                <meta property="article:tag" content={slotData?.seo?.seoTitle} />
            </Head>

            <FadeInOut visible={!isPlayingMobile}>
                {!isPlayingMobile && <NavbarProvider currentPage={`/slot/${slotData?.name}`} countryCode={countryCode}>
                    <Body>
                        <div>
                            <CustomBreadcrumbs
                                style={{ padding: '1.5rem 1rem' }}
                                slotSlug={slot?.slug}
                                slotName={slot?.name}
                                producerName={slot?.producer.name}
                                producerSlug={slot?.producer.slug}
                                name={slot?.name}
                                from='slot' />

                            <Container>
                                <div style={{ overflow: 'hidden ', border: '1px solid white' }}>
                                    <SlotBackgroundImage
                                        isMobile={isMobile}
                                        image={injectCDN(slot?.image.url)}>
                                    </SlotBackgroundImage>
                                </div>

                                <div style={{ zIndex: 9 }}>
                                    <TitleAndRating>
                                        <h1>{slot?.name}</h1>
                                        <StarContainer>
                                            { slot ?
                                            <>
                                            {[...Array(slot.rating).keys()].map((s, i) => <img key={`${snakeCase(slot.name)}_${i}_start_full`} alt='full_star_icon' className='star' src='/icons/star_full.svg' />)}
                                            {[...Array(5 - slot.rating).keys()].map((s, i) => <img key={`${snakeCase(slot.name)}_${i}_start_empty`} alt='empty_star_icon' className='star' src='/icons/star_empty.svg' />)}
                                            </>
                                            :""}
                                            </StarContainer>
                                    </TitleAndRating>
                                </div>

                                <SmallSlotCard
                                    onClick={() => setIsPlayingMobile(true)}
                                    slug={slot?.slug}
                                    image={injectCDN(slot?.image.url)} />

                                <PlayArea>
                                    {isPlaying && <iframe src={slot?.playLink} />}
                                    {!isPlaying && <NeonButton onClick={() => setIsPlaying(true)} />}
                                </PlayArea>
                                {primaryBonus && <PrimaryBonusCard bonus={primaryBonus} />}
                            </Container>

                            <h2 className='alternative-bonus-list'>{t("You can also find it on these sites")}</h2>

                            <SecondaryBonusListContainer>
                                {auxiliaryBonuses?.map(bonus => <SecondaryBonusCard key={bonus.name} bonus={bonus} />)}
                            </SecondaryBonusListContainer>

                        </div>

                        <div style={{ width: '100%', marginBottom: '6rem' }}>
                            <BodyContainer>
                                <MainColumn style={{ maxWidth: '800px', margin: '1rem' }}>
                                    <ArticleToMarkdown content={slot?.description} />
                                </MainColumn>
                                <RightColumn>
                                    <SlotMainFeatures
                                        rtp={slotData?.rtp}
                                        paymentMethods={slotData?.mainBonus?.acceptedPayments}
                                        gameMode={slotData?.gameMode}
                                        theme={slotData?.theme}
                                        volatility={slotData?.volatility}
                                        rating={slotData?.rating}
                                        bonusName={slotData?.mainBonus?.name}
                                        bonusLink={slotData?.mainBonus?.link}
                                        winningSpinFrequency={slotData?.winningSpinFrequency}
                                    />
                                    <div style={{ top: '0', position: 'static' }} className='bonus-column-container'>
                                        {homeBonuses && homeBonuses.map(bo => <BonusCardRevealComponent key={bo.bonus.name} bonus={bo.bonus} />)}
                                    </div>
                                </RightColumn>
                            </BodyContainer>
                        </div>
                    </Body>
                </NavbarProvider>}
            </FadeInOut>

            {isPlayingMobile && <PlayDimmer
                onClose={() => setIsPlayingMobile(false)}
                slotData={slot} />}
        </Fragment >
    )
}

const PlayArea = styled.div`
    display : none;
    background : rgba(0,0,0, .8);
    border-radius : 8px;
    width : 70%;
    margin-left : 1rem;
    height : 500px;
    z-index : 10;
   

    ${laptop}{
        display : flex;
        justify-content : center;
        align-items : center;
    }

    iframe{
        width : 100%;
        height : 100%;
        border-radius : 6px;
    }


`


const Body = styled.div`
    min-height : 100vh;
    width : 100%;

    .alternative-bonus-list{
        font-family : ${(props) => props.theme.text.secondaryFont};
        color: ${(props) => props.theme.colors.primary};
        margin-top : 2rem;
        padding : 1rem 1rem;
        font-size : 1.5rem;
        text-align : start;
    }
   
`

const SecondaryBonusListContainer = styled.div`
    display : flex;
    flex-wrap : wrap;
    justify-content : center;
    align-items : center;
`


interface PlayContainerProps {
    image: string
    isMobile: boolean
}


const Container = styled.div`
   width : 100%;
    position : relative;
    display : flex;
    justify-content : center;
    align-items : center;
    flex-wrap : wrap;
    padding-top : 5rem;
`

const SlotBackgroundImage = styled.div`
    width : 100%;
    background-image: ${(props: PlayContainerProps) => `url(${injectCDN(props.image)})`};
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    height: 500px;
    display : flex;
    flex-direction: column;
    justify-content : center;
    align-items: center;
    position : absolute;
    top : 0;
    left : 0;
    filter : blur(3px);

    ${laptop}{
        filter : blur(5px);
        border-radius : 16px;
        height : 600px;
    }
`


const TitleAndRating = styled.div`
    position : absolute;
    top:0;
    left:0;
    display : flex;
    flex-direction : column;
    align-items : flex-start;
    justify-content : start;

    h1{
        color : white;
        text-transform : uppercase;
        font-family : ${(props) => props.theme.text.secondaryFont};
        font-size : 1.5rem;
        padding-left : 1rem;
        padding-top : 1rem;
        padding-bottom : .5rem;
    }
`

const StarContainer = styled.div`
    display : flex;
    width: 100%;
    padding-left : 1rem;
    
    .star {
        width : 20px;
        height :20px;
        margin-right : .3rem;
    }
`

export async function getServerSideProps({ query }) {

    const slug = query.slug as string
    const country = query.countryCode as string
    const aquaClient = new AquaClient(`https://spikeapistaging.tech/graphql`)

    const response = await aquaClient.query({
        query: SLOT_WITH_SLUG,
        variables: { slug: slug, countryCode: country }
    })

    let slotData1 : any
    if(response.data.data.slots[0] === undefined){
        slotData1 = await aquaClient.query({
            query: SLOT_WITH_SLUG,
            variables: { slug: slug, countryCode: "row" }
        })
    }
    
    const bonusListResponse = await aquaClient.query({
        query: HOME_BONUS_LIST,
        variables: {
            countryCode: country
        }
    })

    let bonusListResponseData1 : any
    if(bonusListResponse.data.data.homes[0] === undefined){
        bonusListResponseData1 = await aquaClient.query({
            query: HOME_BONUS_LIST,
            variables: {
                countryCode: "row"
            }
        })
    }

    return {
        props: {
            query,
            slotData: response.data.data.slots.length > 0 ? response.data.data.slots[0] : slotData1.data.data.slots[0] || null,
            bonusList: bonusListResponse.data.data.homes.length > 0 ? bonusListResponse.data.data.homes[0]?.bonuses.bonus : bonusListResponseData1.data.data.homes[0]?.bonuses.bonus,
            countryCode:country
        }
    }
}


export default SlotPage

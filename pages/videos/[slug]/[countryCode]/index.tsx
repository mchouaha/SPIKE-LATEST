import React, { Fragment, useState,useEffect, useContext,FunctionComponent } from 'react'
import axios from 'axios'
import { firebaseDatabaseUrl } from '../../../../data/firebaseConfig';
import Head from 'next/head';
import styled from 'styled-components'
import { Video } from '../../../../graphql/schema';
import VideoMainData from '../../../../components/Video/VideoMainData';
import AquaClient from '../../../../graphql/aquaClient';
import { GET_BONUS_BY_LEGACY_ID } from '../../../../graphql/queries/bonus';
import { Bonus, Slot, AlgoliaSearchResult } from '../../../../graphql/schema';
import VideoMainBonusCard from '../../../../components/Cards/VideoMainBonusCard';
import { OnlyMobile, OnlyDesktop } from '../../../../components/Responsive/Only';
import { bigscreens } from '../../../../components/Responsive/Breakpoints';
import RelatedVideoCard from '../../../../components/Cards/RelatedVideoCard';
import VideoSecondaryBonusCard from '../../../../components/Cards/VideoSecondaryBonusCard';
import { GET_SLOT_BY_LEGACY_ID } from '../../../../graphql/queries/slots';
import { GET_SLOT_CARD_BY_ID } from '../../../../graphql/queries/slots';
import VideoRelatedSlots from '../../../../components/Lists/VideoRelatedSlots';
import { OnlyBigScreens } from '../../../../components/Responsive/Only';
import VideoDiscalimer from '../../../../components/Singles/VideoDiscalimer';
import Divider from '../../../../components/Ui/Divider';
import NavbarWithPlayer from '../../../../components/Navbar/NavbarWithPlayer';
import BonusStripe from './../../../../components/Cards/BonusStripe';
import truncate from 'lodash/truncate';
import {useTranslation} from 'react-i18next'
import {useRouter} from 'next/router'
import {countryContext} from '../../../../context/CountryContext'


interface Props {
    video: Video
    mainBonus: Bonus
    auxiliaryBonuses: Bonus[]
    relatedVideos: Video[]
    relatedSlots: AlgoliaSearchResult[]
}

const slug = 'giochiamo_alla_sheriff_of_nottingham_della_i_soft_bet'

const palette = {
    darkBg: '#2e2e2e',
    extraDarkBg: '#1c1c1c',
    red: '#f95565'
}

const getCdnZone = video => {
    if (!video.conversionType) return `https://spikeconvertedcomplete.b-cdn.net/${video.videoId}/Default/HLS/${video.videoId}.m3u8`
    else return `https://spikeconverted720.b-cdn.net/${video.videoId}/Default/HLS/${video.videoId}.m3u8`
}




const VideoPage: FunctionComponent<Props> = ({ video, mainBonus, auxiliaryBonuses, relatedVideos, relatedSlots }) => {


    const router = useRouter()
    const [videoLink, setVideoLink] = useState(getCdnZone(video))
    const [descriptionOpen, setDescriptionOpen] = useState(false)
    const {t} = useTranslation()
    const {currentCountry}  = useContext(countryContext)

    useEffect(() => {
        if(!currentCountry){}else{
            if(currentCountry !== router.query.countryCode){
                router.push('/', `${currentCountry}`)
            }
        }
    },[currentCountry])

    const goToBonus = (link: string) => {
        window.open(link, '_self')
    }

    return (
        <Fragment>
            <Head>
                <title>SPIKE Slot | {video.title} [VIDEO]</title>
                <meta charSet="utf-8" />
                <meta property="og:image" content={`https://firebasestorage.googleapis.com/v0/b/spike-2481d.appspot.com/o/VideoThumbnails%2Fthumb_500_${video.videoId}?alt=media`} />
                <meta name="description"
                    content={`${truncate(video.description, {
                        length: 155
                    })} - ${video.title}`} />
                <meta property="og:locale" content={'it'} />
                <meta property="og:type" content="video.movie" />
                <meta property="og:description" content={video.description} />
                <meta property="og:site_name" content="SPIKE Slot | Il Blog n.1 in Italia su Slot Machines e Gioco D'azzardo" />
                <meta property="article:tag" content={`Slot ${video.title} [VIDEO]`} />
                <meta property="article:published_time" content={video.time.toString()} />
            </Head>


            <NavbarWithPlayer
                mainBonus={mainBonus}
                video={video}
                currentPage={`/video/${video.title}`}>
                <Body>

                    <div style={{ margin: '0rem 1rem' }}>

                        <VideoMainData
                            title={video.title}
                            time={video.time}
                            description={video.description} />

                        {/* <VideoMainBonusCard
                            style={{ marginTop: '2rem' }}
                            onClick={link => goToBonus(link)}
                            bonusData={mainBonus} /> */}

                        <MainBonusHeader>{t("In this video I played on")}</MainBonusHeader>
                        <BonusStripe bonus={mainBonus} />

                        <CompareHeader>{t("Comparison with other offers")}</CompareHeader>

                        {auxiliaryBonuses.map(b => <BonusStripe
                            key={`${b.name}`}
                            bonus={b} />)}


                        <OnlyDesktop>
                            <DesktopRelatedVideoContainer>
                                <RelatedVideosHeader>{t("Related Videos")}</RelatedVideosHeader>
                                {relatedVideos.filter(v => v !== null).map((relatedVideo, index) => <RelatedVideoCard key={`related_video_${index}`} videoData={relatedVideo} />)}
                            </DesktopRelatedVideoContainer>
                        </OnlyDesktop>

                        <OnlyBigScreens>
                            <RelatedBonusContainer>
                                <RelatedBonusHeader>{("Recommended Bonuses")}</RelatedBonusHeader>
                                {[mainBonus, ...auxiliaryBonuses].map((b, index) => <div style={{ marginBottom: '1rem', width: '100%' }} key={`${b.name}_side_${index}`}>
                                    <VideoSecondaryBonusCard bonus={b} />
                                </div>)}
                            </RelatedBonusContainer>
                        </OnlyBigScreens>

                        <OnlyMobile>
                            <MobileRelatedVideoContainer>
                                <CompareHeader>{t("Related Videos")}</CompareHeader>
                                {relatedVideos.filter(v => v !== null).map((relatedVideo, index) => <RelatedVideoCard key={`related_video_${index}`} videoData={relatedVideo} />)}
                            </MobileRelatedVideoContainer>
                        </OnlyMobile>
                        <VideoRelatedSlots slotList={relatedSlots} />
                        <Divider style={{ margin: '2rem 0rem' }} color={'red'} />
                        <VideoDiscalimer />
                    </div>
                </Body>
            </NavbarWithPlayer>
        </Fragment>
    )
}

const MainBonusHeader = styled.h1`
    color : ${(props) => props.theme.colors.primary};
    font-family : ${(props) => props.theme.text.secondaryFont};
    font-size : 1.5rem;
    text-align : center;
    padding : 1rem;
`


const RelatedBonusContainer = styled.div`
    display : flex;
    flex-direction : row;
    justify-content:center;
    align-items : center;
    width : 100%;

    ${bigscreens}{
                    position : absolute;
        flex-direction : column;
        top : -600px;
        left : -785px;
    }
`


const MobileRelatedVideoContainer = styled.div`
    display : flex;
    flex-direction : column;
    justify-content:center;
    align-items : center;
    width : 100%;
`

const DesktopRelatedVideoContainer = styled.div`
    display : flex;
    flex-direction : row;
    justify-content:center;
    align-items : center;
    width : 100%;

    ${bigscreens}{
        position : absolute;
        flex-direction : column;
        top : -630px;
        right : -785px;
    }
`

const Body = styled.div`
    position : relative;
    background : ${palette.extraDarkBg};
    padding-bottom : 2rem;
    a{
        display : block;
    }
`

const CompareHeader = styled.h4`
    text-align : center;
    color : white;
    font-family : ${(props) => props.theme.text.primaryFont};
    font-weight : bold;
    text-transform: uppercase;
    padding : 1rem;
    font-size : 1.2rem;
`

const RelatedVideosHeader = styled.h4`
    text-align : center;
    color : white;
    font-family : ${(props) => props.theme.text.primaryFont};
    font-weight : bold;
    text-transform: uppercase;
    padding : 1rem;
    font-size : 1.2rem;
    border : 1px solid ${(props) => props.theme.colors.primary};
    border-radius : 6px;
    background : ${palette.darkBg};
`

const RelatedBonusHeader = styled.h4`
    text-align : center;
    color : white;
    font-family : ${(props) => props.theme.text.primaryFont};
    font-weight : bold;
    text-transform: uppercase;
    padding : 1rem;
    font-size : 1.2rem;
    border : 1px solid ${(props) => props.theme.colors.primary};
    border-radius : 6px;
    background : ${palette.darkBg};
    margin-bottom : 1rem;
`

export async function getServerSideProps({ query }) {

    const aquaClient = new AquaClient()

    const slug = query.slug as string
    const country = query.countryCode as string
    const videoId = await axios.get(`${firebaseDatabaseUrl}/AwsVideoMappings/${slug}.json`)
    const videoData = await (await axios.get(`${firebaseDatabaseUrl}/AwsVideosApproved/${videoId.data}.json`)).data as Video
   

    const mainBonusId = videoData.mainBonus
    const auxiliaryBonusesId = videoData.auxiliaryBonuses

    const mainBonusRequest = aquaClient.query({
        query: GET_BONUS_BY_LEGACY_ID,
        variables: {
            legacyId: mainBonusId
        }
    })

    const auxiliaryRequests = auxiliaryBonusesId.map(b => aquaClient.query({
        query: GET_BONUS_BY_LEGACY_ID,
        variables: {
            legacyId: b
        }
    }))

    const relatedVideosRequest = videoData.relatedVideos.map(videoId =>
        axios.get(`${firebaseDatabaseUrl}/AwsVideosApproved/${videoId}.json`)
    )

    let relatedSlotsRequest
    if (videoData.relatedSlots !== undefined) {
        relatedSlotsRequest = videoData.relatedSlots.map(relatedSlotId => {
            if (relatedSlotId.startsWith('-')) return aquaClient.query({
                query: GET_SLOT_BY_LEGACY_ID,
                variables: {
                    legacyId: relatedSlotId
                }
            })
            else {
                return aquaClient.query({
                    query: GET_SLOT_CARD_BY_ID,
                    variables: {
                        id: relatedSlotId
                    }
                })
            }
        })
    }


    let newRelatedSlotsRequest

    if (videoData.newRelatedSlots !== undefined) {
        newRelatedSlotsRequest = videoData.newRelatedSlots.map(relatedSlotId => {
            return aquaClient.query({
                query: GET_SLOT_CARD_BY_ID,
                variables: {
                    id: relatedSlotId
                }
            })
        })
    }

    const bonusResponses = await Promise.all([...auxiliaryRequests, mainBonusRequest])
    const relatedVideos = await Promise.all([...relatedVideosRequest])
    let newRelatedSlots
    if (newRelatedSlotsRequest) newRelatedSlots = await Promise.all([...newRelatedSlotsRequest])

    let relatedSlots
    if (relatedSlotsRequest) relatedSlots = await Promise.all([...relatedSlotsRequest])



    const mainBonus = bonusResponses.find(r => r.data.data.bonuses[0].legacyId === mainBonusId)?.data.data.bonuses[0]
    const auxiliaryBonuses = bonusResponses.filter(r => r.data.data.bonuses[0].legacyId !== mainBonusId).map(r => r.data.data.bonuses[0])

    const remappedSlots: Slot[] = []

    if (relatedSlots) relatedSlots.forEach(rs => {
        if (rs !== undefined) remappedSlots.push(rs.data.data.slots[0])
    })

    if (newRelatedSlots) newRelatedSlots.forEach(rs => {
        if (rs !== undefined) remappedSlots.push(rs.data.data.slot)
    })

    return {
        props: {
            video: videoData,
            mainBonus: mainBonus,
            auxiliaryBonuses: auxiliaryBonuses,
            relatedVideos: relatedVideos.filter(o => o.data !== undefined).map(res => res.data),
            relatedSlots: remappedSlots,
            countryCode:country
            
        }
    }
}






export default VideoPage

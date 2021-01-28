import React, { Fragment, useEffect, useState, useContext } from 'react'
import styled from 'styled-components'
import { FunctionComponent } from 'react';
import NavbarProvider from '../../../components/Navbar/NavbarProvider';
import { Video, AlgoliaVideo } from '../../../graphql/schema';
import { getInitialVideos } from '../../../data/api/video';
import { loadNextVideoListChunk } from '../../../data/api/video';
import { orderBy, pickBy, delay } from 'lodash';
import VideoListSearchInput from '../../../components/Search/VideoListSearch';
import algoliasearch, { SearchIndex } from 'algoliasearch';
import VideoListComponent from '../../../components/Lists/VideoListComponent';
import LatestVideoCardList from '../../../components/Cards/LatestVideoCardList';
import { countryContext } from '../../../context/CountryContext';
import Head from 'next/head';
import { laptop } from '../../../components/Responsive/Breakpoints';
import {useTranslation} from 'react-i18next'
import {useRouter} from 'next/router'

interface Props {
    latestVideo: AlgoliaVideo
    initialVideos: AlgoliaVideo[]
    initialLatestVideoInListTime: number,
    countryCode:string
}

const VideoList: FunctionComponent<Props> = ({ latestVideo, initialVideos, initialLatestVideoInListTime,countryCode }) => {

    const { currentCountry } = useContext(countryContext)    
    const [videoList, setVideoList] = useState<AlgoliaVideo[] | undefined>(initialVideos)
    const [lastVideoTime, setLastVideoTime] = useState<number>(initialLatestVideoInListTime)
    const [showNewest, setShowNewest] = useState(true)
    const { t } = useTranslation();
    // search
    const [searchValue, setSearchValue] = useState('')
    const [algoliaVideoIndex, setAlgoliaVideoIndex] = useState<SearchIndex | undefined>(undefined)
    const [searchTimerId, setSearchTimerId] = useState<number | undefined>(undefined)
    const [searchResults, setsearchResults] = useState<AlgoliaVideo[] | undefined>(undefined)
    const router = useRouter()

    useEffect(() => {
        // if current url of the page is not with existing country code then redirect page with only existing country code
        if(!currentCountry){}else{
            if(currentCountry !== router.query.slug){
                router.push('/', `${currentCountry}`)
            }
        }
        if (searchResults) setShowNewest(false)
        else setShowNewest(true)
    }, [searchResults,currentCountry])

    useEffect(() => {
        if (searchValue !== undefined && searchValue.length !== 0) searchVideo(searchValue)
        else {
            clearTimeout(searchTimerId)
            setsearchResults(undefined)
        }
    }, [searchValue])

    useEffect(() => {
    }, [videoList])

    const searchVideo = (query: string) => {
        clearTimeout(searchTimerId)

        if (algoliaVideoIndex !== undefined) {
            // ricerca normale
            const newTimer = delay(() => {
                algoliaVideoIndex.search(query).then(({ hits }) => {
                    const converted = hits.map((hit: any) => {
                        return {
                            videoId: hit.videoId,
                            title: hit.title,
                            description: hit.description,
                            time: hit.time,
                            slotType: hit.type
                        }
                    })
                    setsearchResults(converted)
                })
            }, 300)
            setSearchTimerId(newTimer)
        } else {
            // fallback nel caso in cui per qualche strano motivo non sia stato importato algolia
            import('algoliasearch').then(algoliasearch => {
                const client = algoliasearch.default('92GGCDET16', 'fcbd92dd892fe6dc9b67fce3bf44fa04');
                const index = client.initIndex('videos');
                setAlgoliaVideoIndex(index)
                const newTimer = delay(() => {
                    index.search(query).then(({ hits }) => {
                        const converted = hits.map((hit: any) => {
                            return {
                                videoId: hit.videoId,
                                title: hit.title,
                                description: hit.description,
                                time: hit.time,
                                slotType: hit.type
                            }
                        })
                        setsearchResults(converted)
                    })
                }, 300)
                setSearchTimerId(newTimer)
            })
        }
    }

    const loadMore = async () => {
        loadNextVideoListChunk(lastVideoTime, nextChunk => {
            const onlyVisibleAndOrdered = orderBy(pickBy(nextChunk, video => video.visibility === 'VISIBLE'), ['time'], ['desc'])
            const lastVideoInChunk: AlgoliaVideo | undefined = onlyVisibleAndOrdered.pop()
            setVideoList([...videoList!, ...onlyVisibleAndOrdered])
            if (lastVideoInChunk) setLastVideoTime(lastVideoInChunk.time)
        })
    }

    const handleSearchChange = (searchString: string) => setSearchValue(searchString)

    const handleSearchFocusChange = (hasFocus: boolean) => {
        if (hasFocus && algoliaVideoIndex === undefined) {
            import('algoliasearch').then(algoliasearch => {
                const client = algoliasearch.default('92GGCDET16', 'fcbd92dd892fe6dc9b67fce3bf44fa04');
                const index = client.initIndex('videos');
                setAlgoliaVideoIndex(index)
            })
        }
    }

    return (
        <Fragment>

            <Head>
                <title>Video Slot | SPIKE</title>
                <meta charSet="utf-8" />
                <meta property="og:locale" content={currentCountry} />
                <meta name="description" content={"In questa pagina troverete TUTTI i video di SPIKE! Cerca la tua slot preferiti, mettiti comodo e goditi lo spettacolo senza pubblicità"} />
                <meta http-equiv="content-language" content={"it-IT"} />
                <meta property="article:tag" content={`Slot Online Video`} />
                <meta property="article:tag" content={`Slot Gratis Video`} />
                <meta property="article:tag" content={`Slot Machine Video`} />


                <meta property="og:image" content={'https://spikewebsitemedia.b-cdn.net/spike_share_img.jpg'} />
                <meta property="og:locale" content={'it'} />
                <meta property="og:type" content="article" />
                <meta property="og:description" content="In questa pagina troverete TUTTI i video di SPIKE! Cerca la tua slot preferiti, mettiti comodo e goditi lo spettacolo senza pubblicità" />
                <meta property="og:site_name" content="SPIKE Slot | Il Blog n.1 in Italia su Slot Machines e Gioco D'azzardo" />
            </Head>


            <NavbarProvider currentPage='/videolist' countryCode={countryCode}>
                <Body>
                    <HeaderContainer>
                        <div style={{ maxWidth: '450px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <h1 className='header-title'>{t("VideoTextContent1")}</h1>
                            <p>{t("VideoTextContent2")}</p>
                        </div>

                        <img className='big-spike' alt='spike-cartoon' src='/images/spike-diamond.png' />

                    </HeaderContainer>

                    <LatestVideoCardList videoData={latestVideo} />

                    <VideoListSearchInput
                        countryCode={currentCountry}
                        onSearchChange={handleSearchChange}
                        onSearchFocusChange={handleSearchFocusChange}
                        value={searchValue} />
                    <VideoListComponent
                        showNewest={showNewest}
                        videoList={searchResults ? searchResults : videoList} />
                    {!searchResults && <button onClick={() => loadMore()}>{t("Upload more videos")}</button>}
                </Body>
            </NavbarProvider>
        </Fragment>
    )
}

const HeaderContainer = styled.div`
    display : flex;
    flex-wrap : wrap-reverse;
    justify-content : space-around;
    .header-title{
        font-family :${(props) => props.theme.text.secondaryFont};
        color : ${(props) => props.theme.colors.primary};           
        font-size : 1.5rem;
        padding : 1rem;
    }

    p{
        padding : 1rem;
        padding-top : 0;
    }

    .big-spike{
        width : 100%;
        

        ${laptop}{
            width : 30%;
        }
    }
`

const Body = styled.div`
    display : flex;
    flex-direction : column;
    justify-content : center;
    align-items : center;

  

    h1{
        padding : 1rem;
    }

    button{
        cursor : pointer;
        padding : 1rem 2rem;
        margin : 1rem;
        font-family : ${(props) => props.theme.text.primaryFont};
        color : white;
        background : ${(props) => props.theme.colors.primary};
        border : none;  
        border-radius : 4px;
        transition : all .3s ease-in-out;
        :hover{
            filter: brightness(1.2);
        }
    }
`

export async function getServerSideProps({query}) {

    const country = query.slug as string
    const initialVideos = await getInitialVideos()    
    const onlyVisibleAndOrdered = orderBy(pickBy(initialVideos, video => video.visibility === 'VISIBLE'), ['time'], ['desc'])
    const lastVideoInChunk: Video | undefined = onlyVisibleAndOrdered.pop()

    return {
        props: {
            latestVideo: onlyVisibleAndOrdered.shift(),
            initialVideos: onlyVisibleAndOrdered,
            initialLatestVideoInListTime: lastVideoInChunk?.time,
            countryCode:country
        }
    }
}

export default VideoList

import React, { useEffect, useState, useContext, FunctionComponent } from 'react'
import AquaClient from '../../../graphql/aquaClient';
import { PAGINATED_SLOTS, PAGINATED_BAR_SLOTS } from '../../../graphql/queries/slots';
import { AlgoliaSearchResult, Producer, BarSlotListPage } from '../../../graphql/schema';
import NavbarProvider from '../../../components/Navbar/NavbarProvider';
import { BodyContainer, MainColumn, RightColumn } from '../../../components/Layout/Layout';
import CustomBreadcrumbs from '../../../components/Breadcrumbs/CustomBreadcrumbs'
import styled from 'styled-components'
import { SLOT_LIST_ARTICLE_BY_COUNTRY } from '../../../graphql/queries/slotList';
import { injectCDN } from '../../../utils/Utils';
import { SearchIndex } from 'algoliasearch';
import SlotListSearchInput from '../../../components/Search/SlotListSearch';
import delay from 'lodash/delay';
import { countryContext } from '../../../context/CountryContext';
import { PRODUCERS_BY_COUNTRY_DROPDOWN } from '../../../graphql/queries/producers';
import ApolloBonusCardRevealComponent from '../../../components/Cards/BonusCardReveal';
import { HOME_BONUS_LIST } from '../../../graphql/queries/bonus';
import { ApolloBonusCardReveal } from '../../../data/models/Bonus';
import SlotListOrdering from '../../../components/Singles/SlotListOrdering';
import { laptop } from '../../../components/Responsive/Breakpoints';
import { ApolloSlotCard } from '../../../data/models/Slot';
import {useRouter} from 'next/router'
import SlotList from '../../../components/Lists/SlotList';
import LoadMoreButton from '../../../components/Buttons/LoadMoreButton';
import ArticleToMarkdown from '../../../components/Markdown/ArticleToMarkdown';
import Head from 'next/head';
import LazyLoad from 'react-lazyload';
import { appTheme } from '../../../theme/theme';
import SlideShow from '../../../components/SlideShow/SlideShow';
import orderBy from 'lodash/orderBy';
import { BAR_SLOT_LIST } from './../../../graphql/queries/barslotlist';
import {useTranslation} from 'react-i18next'

interface Props {
    initialSlots: AlgoliaSearchResult[]
    countryCode: string
    slotListArticles: SlotListArticles
    bonusList: { bonus: ApolloBonusCardReveal }[]
    highlightSlot: ApolloSlotCard
    barSlotListPage: BarSlotListPage,
    producersQuery:any
}

interface SlotListArticles {
    topArticle: string | undefined,
    bottomArticle: string | undefined
}

const Slots: FunctionComponent<Props> = ({ initialSlots, bonusList, countryCode, slotListArticles, highlightSlot,producersQuery, barSlotListPage }) => {

    const aquaClient = new AquaClient(`https://spikeapistaging.tech/graphql`)
    const {t} = useTranslation()
    const { currentCountry } = useContext(countryContext)
    const router = useRouter()

    useEffect(() => {
        if(!currentCountry){}else{
            if(currentCountry !== router.query.countryCode){
                router.push('/', `${currentCountry}`)
            }
        }
    }, [currentCountry])

    const [slotLength, setSlotLength] = useState(initialSlots.length)
    const [slotList, setSlotList] = useState<AlgoliaSearchResult[] | undefined>(initialSlots)
    useEffect(() => {
        slotList && setSlotLength(slotList?.length)
    }, [slotList])

    // search
    const [algoliaIndex, setAlgoliaIndex] = useState<SearchIndex | undefined>(undefined)
    const [searchTimerId, setSearchTimerId] = useState<number | undefined>(undefined)
    const [showSearchHasNoResults, setShowSearchHasNoResults] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    useEffect(() => {
        if (searchValue.length !== 0) {
            if (algoliaIndex) algoliaSearch(searchValue)
        } else {
            clearTimeout(searchTimerId)
            setSearchResults(undefined)
            setSlotList(initialSlots)
        }
    }, [searchValue])

    const [searchResults, setSearchResults] = useState<AlgoliaSearchResult[] | undefined>(undefined)
    useEffect(() => {    
        if (searchResults && searchResults.length > 0) {
            setSlotList(searchResults)
        } else {
            setShowSearchHasNoResults(true)
        }
    }, [searchResults])

    useEffect(() => {
        if (searchValue.length > 0 && searchResults?.length === 0) setShowSearchHasNoResults(true)
        else setShowSearchHasNoResults(false)
    }, [searchValue, searchResults])

    // ordinamento
    const [ordering, setOrdering] = useState<'date' | 'alphabetical' | 'rating'>('date')
    useEffect(() => {
        if (ordering === 'alphabetical') setSlotList(orderBy(initialSlots, ['name'], ['asc']))
        if (ordering === 'rating') setSlotList(orderBy(initialSlots, ['rating'], ['desc']))
        if (ordering === 'date') setSlotList(orderBy(initialSlots, ['created_at'], ['desc']))
    }, [ordering])

    // filtri
    const [showMoreFilter, setShowMoreFilter] = useState(false)
    const [categories, setCategories] = useState<any>(undefined)
    const [producers, setProducers] = useState<Producer[] | undefined>(undefined)
    useEffect(() => {
        if (categories === undefined || producers === undefined) getCategoriesAndProducers()
    }, [showMoreFilter])


    const [showProducers, setShowProducers] = useState(false)
    const [showCategories, setShowCategories] = useState(false)

    const loadNextOrderedBatch = async (ordering: 'date' | 'alphabetical' | 'rating') => {
        let orderingString: string = "created_at:DESC"
        if (ordering === 'alphabetical') orderingString = "name:ASC"
        if (ordering === 'rating') orderingString = "rating:DESC"

        const response = await aquaClient.query({
            query: PAGINATED_SLOTS,
            variables: {
                countryCode: currentCountry,
                sortingField: orderingString,
                start: slotLength,
                limit: 12
            }
        })

        setSlotList([...slotList!, ...(response.data.data.slots as AlgoliaSearchResult[])])
    }

    const getCategoriesAndProducers =  () => {
        setProducers(producersQuery)

        // mock query
        const categories = [
            '#Egypt',
            '#Fantasy',
            '#Horror',
            t('#Film'),
            '#Animals',
            '#Classic',
            t('#Diamonds'),
        ]

        setCategories(categories)
    }


    const algoliaSearch = async (s: string) => {
        clearTimeout(searchTimerId)
        const newTimer = delay(async () => {
            const results = await algoliaIndex!.search(s, {
                filters: `(country:'${currentCountry}') AND type:slot`
            })

            setSearchResults(results.hits.map((obj: any) => {
                return {
                    name: obj.name,
                    type: obj.type,
                    slug: obj.slug,
                    country: obj.country,
                    image: {
                        url: obj.image
                    },
                    bonuses: [{ link: obj.link }],
                    rating: obj.rating
                }
            }))
        }, 300)
        setSearchTimerId(newTimer)
    }

    const handleOrderChange = (newValue: 'date' | 'alphabetical' | 'rating') => {
        setOrdering(newValue)
    }

    const showProducersOrCategories = (value: 'categories' | 'producers') => {
        if (value === 'categories') {
            setShowCategories(true)
            setShowProducers(false)
        }

        if (value === 'producers') {
            setShowCategories(false)
            setShowProducers(true)
        }
    }

    const goToProducer = (slug: string) => {
        router.push(`/producer/${slug}/${currentCountry}`)
    }

    return (
        <StyleProvider>
            <Head>
                <title>{barSlotListPage?.seo?.seoTitle}</title>
                <meta
                    name="description"
                    content={barSlotListPage?.seo?.seoDescription}>
                </meta>
                <meta httpEquiv="content-language" content="it-IT"></meta>
                <meta property="og:image" content={'https://spikewebsitemedia.b-cdn.net/spike_share_img.jpg'} />
                <meta property="og:locale" content={'it'} />
                <meta property="og:type" content="article" />
                <meta property="og:description" content={barSlotListPage?.seo?.seoDescription} />
                <meta property="og:site_name" content="SPIKE Slot | Il Blog n.1 in Italia su Slot Machines e Gioco D'azzardo" />
            </Head>

            <NavbarProvider currentPage={`/slot-bar-list`} countryCode={countryCode}>
                <BodyContainer>
                    <MainColumn>

                        <CustomBreadcrumbs
                            style={{ padding: '1rem .5rem' }}
                            from='vlt-slot-list' />

                        <ArticleToMarkdown style={{ padding: '0rem 1rem' }} content={injectCDN(barSlotListPage?.topArticle!)} />

                        <LazyLoad height={450} once offset={100}>
                            <SlideShow
                                apolloSlotCards={barSlotListPage?.sliderSlots?.slot.map(s => s.slot)}
                                title='The most famous Bar Slots'
                                icon='/icons/slot_bar_icon.svg'
                                buttonText=''
                                buttonRoute={`/slots/[countryCode]`}
                                buttonRouteAs={`/slots/${currentCountry}`}
                                style={{ marginTop: '2rem' }}
                                mainColor={appTheme.colors.secondary}
                                secondaryColor={appTheme.colors.secondary} />
                        </LazyLoad>

                        <FiltersContainer>
                            <MainFiltersContainer>
                                {/* <SlotListSearchInput
                                    countryCode={countryCode}
                                    value={searchValue}
                                    searchResults={searchResults}
                                    onSearchChange={handleSearchChange} /> */}

                                <SlotListOrdering
                                    style={{ margin: '2rem auto' }}
                                    onOrderChange={handleOrderChange}
                                    ordering={ordering} />
                            </MainFiltersContainer>

                            <OptionalFiltersContainer>
                                <MoreFiltersWrapper isOpen={showMoreFilter}>
                                    <MoreFiltersList>
                                        {showMoreFilter &&
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }}>
                                                <h4
                                                    className={showProducers ? 'selected' : ''}
                                                    onClick={() => showProducersOrCategories('producers')}>
                                                    {t("Manufacturing house")}
                                                </h4>
                                                <h4
                                                    className={showCategories ? 'selected' : ''}
                                                    onClick={() => showProducersOrCategories('categories')}>
                                                    {t("Categories")}
                                                </h4>
                                            </div>}
                                        {showMoreFilter && <div>
                                            <div
                                                style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'start', alignItems: 'flex-start' }}>
                                                {producers && showProducers && producers.map(p => <h1
                                                    key={p.name}
                                                    onClick={() => goToProducer(p.slug)}
                                                    className='hollow-button'>
                                                    {p.name}
                                                </h1>)}
                                            </div>

                                            <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'start', alignItems: 'flex-start' }}>
                                                {categories && showCategories && categories.map(c => <h1 key={c} className='hollow-button-cyan'>{c}</h1>)}
                                            </div>
                                        </div>}
                                    </MoreFiltersList>
                                </MoreFiltersWrapper>

                                <MoreFiltersButton onClick={() => setShowMoreFilter(!showMoreFilter)}>
                                    <h3>
                                        {!showMoreFilter ? t("Show more filters") : t("Show fewer filters")}
                                    </h3>
                                    <img src={!showMoreFilter ? '/icons/chevron_down_red.svg' : '/icons/chevron_up_red.svg'} />
                                </MoreFiltersButton>
                            </OptionalFiltersContainer>
                        </FiltersContainer>

                        <SlotList slotList={slotList} showSearchHasNoResults={showSearchHasNoResults} />


                        {/* <LoadMoreButton onLoadMore={() => loadNextOrderedBatch(ordering)} /> */}

                        {barSlotListPage?.bottomArticle && <ArticleToMarkdown style={{ padding: '0rem 1rem' }} content={injectCDN(barSlotListPage?.bottomArticle!)} />}

                    </MainColumn>


                    <RightColumn>
                        <h1 className='bonus-header'>{t("The best welcome bonuses")}</h1>
                        <div style={{ top: '2rem' }} className='bonus-column-container'>
                            {bonusList && bonusList.map(bo => <ApolloBonusCardRevealComponent key={bo.bonus.name} bonus={bo.bonus} />)}
                        </div>
                    </RightColumn>

                </BodyContainer>

            </NavbarProvider>
        </StyleProvider>
    )
}



const StyleProvider = styled.div`
   .hollow-button{
       cursor : pointer;
       color : white;
       padding : .5rem 1rem;
       margin : .5rem .3rem;
       border : 2px solid #f2a20c;
       border-radius : 36px;
       transition : all .3s ease-in-out;
       background : ${(props) => props.theme.colors.yellowDark};
       box-shadow: 10px 10px 5px -5px rgba(0,0,0,0.1);

       :hover {
         color : white-space;
         border : 2px solid ${(props) => props.theme.colors.primaryDark};
         background : ${(props) => props.theme.colors.primary};
         color : white;
       }
   }

   .hollow-button-cyan{
       cursor : pointer;
       color : black;
       padding : .5rem 1rem;
       margin : .5rem .3rem;
       border : 2px solid #1e8ef7;
       border-radius : 36px;
       transition : all .3s ease-in-out;
       background : #0cebf2;
       box-shadow: 10px 10px 5px -5px rgba(0,0,0,0.1);

       :hover {
         color : white-space;
         border : 2px solid #0cebf2;
         background : #1e8ef7;
         color : white;
       }
   }
`


const FiltersContainer = styled.div`
`

const OptionalFiltersContainer = styled.div`
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    margin-top:1rem;
    padding : 0rem 1rem;
`

interface MoreFiltersWrapper {
    isOpen: boolean
}

const MoreFiltersWrapper = styled.div`
    max-height : ${(props: MoreFiltersWrapper) => props.isOpen ? '3000px' : '0px'};
    transition : max-height .7s ease-in-out;
    display : flex;
    width:100%;
    flex-direction : column;
`

const MoreFiltersList = styled.div`
    display  :flex;
    flex-direction : column;
    align-items:center;
   

    h4{
        cursor : pointer;
        user-select : none;
        background : ${(props) => props.theme.colors.primary};
        color : white;
        text-align :center;
        padding : 1rem 3rem;
        border-radius : 6px;
        transition : all .3s ease-in;
        margin-bottom : 1rem;
        width : 250px;
        border : 3px solid ${(props) => props.theme.colors.primary};

        :hover {
            background : ${(props) => props.theme.colors.primaryDark};
        }        
    }

    .selected{
        cursor : pointer;
        user-select : none;
        background : ${(props) => props.theme.colors.primaryDark};
        color : white;
        text-align :center;
        padding : 1rem 3rem;
        border-radius : 6px;
        transition : all .3s ease-in;
        margin-bottom : 1rem;
        width : 250px;
        border : 3px solid ${(props) => props.theme.colors.yellow};

        :hover {
            background : ${(props) => props.theme.colors.primaryDark};
        }       
    }
`

const MoreFiltersButton = styled.div`
    cursor : pointer;
    display : flex;
    justify-content : center;
    align-items: center;
    -webkit-tap-highlight-color:transparent;

    h3{
        text-align : center;
        color : ${(props) => props.theme.colors.primary};
        font-size : 85%;
    }
    
    img{
        margin-left:1rem;
        width  :16px;
        height : 16px;
    }
`

const MainFiltersContainer = styled.div`
    display : flex;
    flex-wrap : wrap;
    justify-content : center;

    span{
        font-size : .8rem;
    }

    ${laptop}{
        justify-content : space-between;
    }
`

const SlotListContainer = styled.div`
    display : flex;
    flex-wrap : wrap;
    border-radius : 4px;
    background : #f5f5f5;
    justify-content : center;
    padding : 1rem;
    margin : 1.4rem;  
`

const MarkDownStyleProvider = styled.div`
    margin-bottom : 1rem;

    h1{
        color : ${(props) => props.theme.colors.primary};
        font-family : ${(props) => props.theme.text.secondaryFont};
        padding : 1rem 1.4rem;
        font-size : 1.5rem;
        line-height: 1.9rem;
    }

    p{
        padding : 0rem 1.4rem;
        line-height: 1.4rem;
    }

    a{
        color : ${(props) => props.theme.colors.fifth};
        font-family : ${(props) => props.theme.text.secondaryFont};
    }
`

export async function getServerSideProps({ query }) {

    const country = query.countryCode as string
    const aquaClient = new AquaClient(`https://spikeapistaging.tech/graphql`)

    const slotListResponse = await aquaClient.query({
        query: PAGINATED_BAR_SLOTS,
        variables: {
            countryCode: country,
            sortingField: "created_at:DESC",
            start: 0,
            limit: 50,
        }
    })

    let slotListResponseData1 : any
    if(slotListResponse.data.data.slots[0] === undefined){
        slotListResponseData1 = await aquaClient.query({
            query: PAGINATED_BAR_SLOTS,
            variables: {
                countryCode: "row",
                sortingField: "created_at:DESC",
                start: 0,
                limit: 50,
            }
        })
    }

    const barSlotListResponse = await aquaClient.query({
        query: BAR_SLOT_LIST,
        variables: {
            countryCode: country
        }
    })

    let barSlotListResponseData1 : any
    if(barSlotListResponse.data.data.barSlotLists[0] === undefined){
        barSlotListResponseData1 = await aquaClient.query({
            query: BAR_SLOT_LIST,
            variables: {
                countryCode: "row"
            }
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


    const slotListArticlesResponse = await aquaClient.query({
        query: SLOT_LIST_ARTICLE_BY_COUNTRY,
        variables: {
            countryCode: country
        }
    })


    let slotListArticlesResponseData1 : any
    if(slotListArticlesResponse.data.data.slotListArticles[0] === undefined){
        slotListArticlesResponseData1 = await aquaClient.query({
            query: SLOT_LIST_ARTICLE_BY_COUNTRY,
            variables: {
                countryCode: "row"
            }
        })
    }

    const producersQuery = await aquaClient.query({
        query: PRODUCERS_BY_COUNTRY_DROPDOWN,
        variables: {
            countryCode: country
        }
    })

    // const pageData = await Promise.all([slotListResponse, bonusListResponse, slotListArticlesResponse, barSlotListResponse])

    // const slotList = pageData.find(res => res.data.data.slots !== undefined)?.data.data.slots
    // const bonusList = pageData.find(res => res.data.data.homes !== undefined)?.data.data.homes[0]?.bonuses.bonus || null
    // const slotListArticles = pageData.find(res => res.data.data.slotListArticles !== undefined)?.data.data.slotListArticles[0] || null
    // const barSlotListPage = pageData.find(res => res.data.data.barSlotLists !== undefined)?.data.data.barSlotLists[0] || null

    const slotList = slotListResponse.data.data.slots.length > 0 ? slotListResponse.data.data.slots : slotListResponseData1.data.data.slots
    const bonusList = bonusListResponse.data.data.homes.length > 0 ? bonusListResponse.data.data.homes[0]?.bonuses.bonus : bonusListResponseData1.data.data.homes[0]?.bonuses.bonus
    const slotListArticles = slotListArticlesResponse.data.data.slotListArticles.length > 0 ? slotListArticlesResponse.data.data.slotListArticles[0] : slotListArticlesResponseData1.data.data.slotListArticles[0]
    const barSlotListPage = barSlotListResponse.data.data.barSlotLists.length > 0 ? barSlotListResponse.data.data.barSlotLists : barSlotListResponseData1.data.data.barSlotLists
    return {
        props: {
            initialSlots: slotList,
            slotListArticles: slotListArticles,
            bonusList: bonusList,
            countryCode: country,
            barSlotListPage: barSlotListPage,
            producersQuery:producersQuery.data.data.producers
        }
    }
}

export default Slots

import React, { Fragment, useContext, useEffect } from 'react'
import NavbarProvider from '../../../../components/Navbar/NavbarProvider'
import AquaClient from '../../../../graphql/aquaClient';
import { BLOG_ARTICLE_BY_SLUG } from '../../../../graphql/queries/blogarticle';
import { FunctionComponent } from 'react';
import styled from 'styled-components';
import ArticleToMarkdown from '../../../../components/Markdown/ArticleToMarkdown';
import { BodyContainer, MainColumn, RightColumn } from '../../../../components/Layout/Layout';
import LatestVideoCard from '../../../../components/Cards/LatestVideoCard';
import Icon from '../../../../components/Icons/Icon';
import { BlogArticle as BG } from '../../../../graphql/schema';
import BonusCardRevealComponent from '../../../../components/Cards/BonusCardReveal';
import CustomBreadcrumbs from '../../../../components/Breadcrumbs/CustomBreadcrumbs'
import Head from 'next/head';
import { ApolloBonusCardReveal } from '../../../../data/models/Bonus';
import { HOME_BONUS_LIST } from '../../../../graphql/queries/bonus';
import {useTranslation} from 'react-i18next'
import {useRouter} from 'next/router'
import {countryContext} from '../../../../context/CountryContext'

interface Props {
    article: BG,
    bonusList: { bonus: ApolloBonusCardReveal }[],
    countryCode:string
}

const BlogArticle: FunctionComponent<Props> = ({ article, bonusList,countryCode }) => {

    const {t} = useTranslation()
    const {currentCountry} = useContext(countryContext)
    const router = useRouter()

    useEffect(() => {
        if(!currentCountry){}else{
            if(currentCountry !== router.query.countryCode){
                router.push('/', `${currentCountry}`)
            }
        }
    },[currentCountry])

    return (
        <Fragment>
            <Head>
                <title>{article.seo?.seoTitle}</title>
                <meta
                    name="description"
                    content={article.seo?.seoDescription}>
                </meta>
                <meta httpEquiv="content-language" content="it-IT"></meta>
                <meta property="og:image" content={article.image?.url} />
                <meta property="og:locale" content={'it'} />
                <meta property="og:type" content="article" />
                <meta property="og:description" content={article.seo?.seoDescription} />
                <meta property="og:site_name" content="SPIKE Slot | Il Blog n.1 in Italia su Slot Machines e Gioco D'azzardo" />
                <meta property="article:tag" content={article.seo?.seoTitle} />
                <meta property="article:published_time" content={article.created_at} />
            </Head>

            <NavbarProvider currentPage={`/blog-article/${article.seo?.seoTitle}`} countryCode={countryCode}>
                <CustomBreadcrumbs
                    style={{ padding: '1rem 1rem' }}
                    name={article.title}
                    from='blog-article' />

                <BodyContainer>

                    <MainColumn>
                        <Wrapper>
                            <ArticleToMarkdown content={article.article} />
                        </Wrapper>
                    </MainColumn>

                    <RightColumn>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Icon
                                width={56}
                                height={56}
                                source='/icons/flame_icon.svg' />
                            <h1 className='video-header'>{t("Watch SPIKE's latest video")}</h1>
                        </div>
                        <LatestVideoCard />
                        <h1 className='bonus-header'>{t("The best welcome bonuses")}</h1>

                        <div style={{ marginTop: '0rem' }} className='bonus-column-container'>
                            {bonusList && bonusList.map(bo => <BonusCardRevealComponent key={bo.bonus.name} bonus={bo.bonus} />)}
                        </div>
                    </RightColumn>

                </BodyContainer>

            </NavbarProvider>
        </Fragment>
    )
}

const Wrapper = styled.div`
    padding : 1rem 1rem;
`

export async function getServerSideProps({ query }) {

    const slug = query.slug as string
    const country = query.countryCode as string

    const aquaClient = new AquaClient()

    const articleResponse = await aquaClient.query({
        query: BLOG_ARTICLE_BY_SLUG,
        variables: {
            slug: slug,
            countryCode: country
        }
    })

    const bonusListResponse = await aquaClient.query({
        query: HOME_BONUS_LIST,
        variables: {
            countryCode: country
        }
    })    

    const bonusList = bonusListResponse.data.data.homes[0]?.bonuses.bonus

    return {
        props: {
            query,
            article: articleResponse.data.data.blogArticles[0],
            bonusList: bonusList || null,
            countryCode:country
        }
    }
}

export default BlogArticle

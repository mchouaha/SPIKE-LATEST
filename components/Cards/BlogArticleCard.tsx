import React,{useContext} from 'react'
import styled from 'styled-components'
import { Article } from './../../graphql/schema';
import { FunctionComponent } from 'react';
import Link from 'next/link';
import LazyImage from '../Lazy/LazyImage';
import { injectCDN } from './../../utils/Utils';
import { format } from 'date-fns';
import {countryContext} from '../../context/CountryContext'
import {useTranslation} from 'react-i18next'

interface Props {
    article: Article
}

const BlogArticleCard: FunctionComponent<Props> = ({ article }) => {

    const {currentCountry} = useContext(countryContext)
    const {t} = useTranslation()
    return (
        <StyleProvider>
            <Link href={`/blog/[slug]/[countryCode]`} as={`/blog/${article.slug}/${currentCountry}`}>
                <a>
                    <CardContainer>
                        <LazyImage width='100%' height='200px' src={injectCDN(article.image?.url!)} />
                        <div style={{ height: '64px', display: 'flex', alignItems: 'center' }}>
                            <h3>{article.title}</h3>
                        </div>
                        <Divider />
                        <p style={{ textAlign: 'end', margin: '.5rem', fontSize: '.8rem' }}>{`${t("Published on")} ${format(new Date(article.created_at), 'dd/MM/yyyy')}`}</p>
                    </CardContainer>
                </a>
            </Link>
        </StyleProvider>
    )
}

const Divider = styled.div`
    width : 100%;
    height : 2px;
    color : grey;
`

const StyleProvider = styled.div`
    a{
        color : black;
    }
`

const CardContainer = styled.div`
    width : 270px;
    cursor : pointer;
    transition : all .2s ease-in-out;
    margin-bottom : 1rem;
    h3{
        color : ${(props) => props.theme.colors.primary};
        font-weight : bold;
        padding : 1rem .5rem;
    }

    border : 1px solid grey;
    border-radius : 6px;

    :hover{
        transform : scale(1.05);
    }
`

export default BlogArticleCard
